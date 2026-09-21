// netlify/functions/process-checkout.js

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { product, quantity, name, phone, address, shipping, message } = data;

    // 1. 🧠 BACKEND COMPUTATION
    const productPrices = { 
      "executive": 1200, "executive-custom": 1500,
      "reviewshield": 500, "reviewshield-custom": 750,
      "hub": 2500, "hub-custom": 3000
    };
    const shippingRates = { "standard": 49, "meetup": 50, "others": 0, "": 0 };

    const basePrice = productPrices[product] || 0;
    const shippingFee = shippingRates[shipping] || 0;
    
    // ETO ANG FINAL TOTAL NA SISINGILIN KAY CUSTOMER (KASAMA SHIPPING)
    const computedTotal = (basePrice * quantity) + shippingFee;

    // 2. 🚨 DISCORD NOTIFICATION
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      const discordPayload = {
        content: "🚨 **BAGONG ORDER, FOUNDER!** 🚨",
        embeds: [{
          title: "Attachment Anywhere - Order Details",
          color: 15158332,
          fields: [
            { name: "Customer", value: name, inline: true },
            { name: "Phone Number", value: phone, inline: true },
            { name: "Product Selected", value: `${product.toUpperCase()} (Qty: ${quantity})`, inline: false },
            { name: "Shipping Method", value: `${shipping.toUpperCase()} (+₱${shippingFee})`, inline: true },
            { name: "Total Billing", value: `₱${computedTotal.toLocaleString('en-PH', {minimumFractionDigits: 2})}`, inline: true },
            { name: "Delivery Address", value: address, inline: false },
            { name: "Order Notes / Negotiation", value: message || "None", inline: false }
          ],
          footer: { text: "Attachment Anywhere Automated System" },
          timestamp: new Date().toISOString()
        }]
      };

      fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      }).catch(err => console.error("Discord Error:", err));
    }

    // 3. 💳 PAYMONGO API
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
    const authHeader = 'Basic ' + Buffer.from(paymongoSecretKey + ':').toString('base64');

    const paymongoPayload = {
      data: {
        attributes: {
          billing: {
            name: name,
            phone: phone,
            address: { line1: address }
          },
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          description: `Shipping Method: ${shipping.toUpperCase()}`,
          
          line_items: [
            {
              name: `Attachment Anywhere - ${product.toUpperCase()}`,
              description: `Qty: ${quantity} | Includes +₱${shippingFee} Shipping Fee`,
              amount: Math.round(computedTotal * 100), 
              currency: 'PHP',
              quantity: 1 
            }
          ],
          
          // IBINALIK NATIN ITO DAHIL REQUIRED PALA NG PAYMONGO
          // Dinagdagan ko na rin ng billease at online banking (dob) kung sakaling activated sa account mo
          payment_method_types: ['gcash', 'paymaya', 'card', 'billease', 'dob'],
          
          success_url: 'https://attachmentanywhere.com', 
          cancel_url: 'https://attachmentanywhere.com/order.html'
        }
      }
    };

    const paymongoResponse = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(paymongoPayload)
    });

    const paymongoData = await paymongoResponse.json();

    if (!paymongoResponse.ok) {
      console.error("PayMongo Error:", paymongoData);
      return { statusCode: 400, body: JSON.stringify({ error: "Failed to generate PayMongo link." }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: paymongoData.data.attributes.checkout_url })
    };

  } catch (error) {
    console.error("Serverless Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};