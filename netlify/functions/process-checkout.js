// netlify/functions/process-checkout.js

exports.handler = async (event, context) => {
  // Only permit POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const {
      productId,
      productName,
      variant,
      unitPrice,
      quantity,
      shippingMethod,
      shippingFee,
      totalAmount,
      customer,
      customization
    } = data;

    // Basic validation
    if (!customer?.name || !customer?.phone || !customer?.address || !totalAmount) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required order parameters." })
      };
    }

    // 1. ENVIRONMENT CONFIGURATION
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const ORDER_DISCORD_WEBHOOK = process.env.ORDER_DISCORD_WEBHOOK; 

    if (!PAYMONGO_SECRET_KEY) {
      console.error("Missing PAYMONGO_SECRET_KEY in Netlify environment variables.");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Payment gateway key not configured." })
      };
    }

    // 2. DISPATCH DISCORD ORDER NOTIFICATION
    try {
      // Format customization details into readable fields
      let customFieldsText = "None specified";
      if (customization && Object.keys(customization).length > 0) {
        customFieldsText = Object.entries(customization)
          .map(([key, val]) => `• **${key}:** ${Array.isArray(val) ? val.join(", ") : val || "N/A"}`)
          .join("\n");
      }

      const discordPayload = {
        username: "Attachment HQ Dispatch",
        avatar_url: "https://attachmentanywhere.com/brandbgrmv.png",
        embeds: [
          {
            title: `💳 New Order Checkout Initiated: ${productName}`,
            description: `A customer has proceeded to checkout. Payment session created.`,
            color: 1226602, // Emerald/Green
            fields: [
              {
                name: "Customer Details",
                value: `**Name:** ${customer.name}\n**Phone:** ${customer.phone}\n**Address:** ${customer.address}`,
                inline: false
              },
              {
                name: "Order Breakdown",
                value: `**Item:** ${productName} (${variant || "Standard"})\n**Qty:** ${quantity}\n**Subtotal:** ₱${(unitPrice * quantity).toLocaleString("en-US")}\n**Shipping:** ₱${shippingFee} (${shippingMethod})\n**Total Amount:** ₱${totalAmount.toLocaleString("en-US")}`,
                inline: false
              },
              {
                name: "Custom Hardware Specs",
                value: customFieldsText.substring(0, 1000) || "Standard setup",
                inline: false
              }
            ],
            footer: {
              text: `Attachment Anywhere Dispatch • System Daemon`
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      await fetch(ORDER_DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload)
      });
    } catch (discordErr) {
      // Non-blocking: log error and proceed to checkout creation
      console.error("Discord webhook dispatch error:", discordErr);
    }

    // 3. COMPOSE PAYMONGO CHECKOUT SESSION
    // Note: PayMongo calculates prices in centavos (PHP 1.00 = 100 centavos)
    const lineItems = [
      {
        name: `${productName} (${variant || "Standard"})`,
        amount: Math.round(Number(unitPrice) * 100),
        currency: "PHP",
        quantity: Number(quantity) || 1
      }
    ];

    // If shipping applies, add it as a dedicated line item
    if (Number(shippingFee) > 0) {
      lineItems.push({
        name: `Shipping: ${shippingMethod || "Standard Delivery"}`,
        amount: Math.round(Number(shippingFee) * 100),
        currency: "PHP",
        quantity: 1
      });
    }

    const authHeader = Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString("base64");

    const paymongoResponse = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authHeader}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: false,
            show_description: true,
            show_line_items: true,
            description: `Order for ${customer.name} - ${productName}`,
            payment_method_types: ["card", "gcash", "paymaya", "qrph", "grab_pay"],
            line_items: lineItems,
            reference_number: `AA-${Date.now().toString().slice(-6)}`
          }
        }
      })
    });

    const sessionData = await paymongoResponse.json();

    if (!paymongoResponse.ok) {
      console.error("PayMongo Session Error:", sessionData);
      const errorMsg = sessionData.errors?.[0]?.detail || "Failed to create payment session with PayMongo.";
      return {
        statusCode: paymongoResponse.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: errorMsg })
      };
    }

    const checkoutUrl = sessionData.data?.attributes?.checkout_url;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutUrl })
    };

  } catch (error) {
    console.error("Internal Checkout Handler Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error occurred." })
    };
  }
};