// netlify/functions/process-checkout.js

exports.handler = async (event, context) => {
  // 1. Siguraduhing POST request lang ang tatanggapin
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Saluhin ang data galing sa order.html
    const data = JSON.parse(event.body);
    const { product, quantity, name, phone, address, shipping, totalPrice } = data;

    // 3. I-setup ang Discord Webhook (Para tumunog ang phone mo!)
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (discordWebhookUrl) {
      const discordPayload = {
        content: "🚨 **BAGONG ORDER, FOUNDER!** 🚨",
        embeds: [{
          title: "Attachment Anywhere - Order Details",
          color: 15158332, // Red/Orange highlight
          fields: [
            { name: "Customer", value: name, inline: true },
            { name: "Phone Number", value: phone, inline: true },
            { name: "Product Selected", value: `${product.toUpperCase()} (Qty: ${quantity})`, inline: false },
            { name: "Shipping Method", value: shipping.toUpperCase(), inline: true },
            { name: "Total Billing", value: `₱${totalPrice.toLocaleString('en-PH', {minimumFractionDigits: 2})}`, inline: true },
            { name: "Delivery Address", value: address, inline: false }
          ],
          footer: { text: "Attachment Anywhere Automated System" },
          timestamp: new Date().toISOString()
        }]
      };

      // I-fire ang Discord Notification (hindi natin hihintayin matapos para mabilis)
      fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      }).catch(err => console.error("Discord Error:", err));
    }

    // 4. Kausapin ang PayMongo API
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
    const authHeader = 'Basic ' + Buffer.from(paymongoSecretKey + ':').toString('base64');

    // Ang PayMongo ay nagbabasa ng CENTS, kaya imu-multiply natin sa 100 ang Total Price
    const paymongoAmount = Math.round(totalPrice * 100);

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
          description: `Order: ${product.toUpperCase()} (Qty: ${quantity}) | Shipping: ${shipping.toUpperCase()}`,
          line_items: [
            {
              amount: paymongoAmount,
              currency: 'PHP',
              description: `Attachment Anywhere Order`,
              name: `Digital Setup & Hardware`,
              quantity: 1 // Naka-bundle na ang buong computation sa isang line item
            }
          ],
          payment_method_types: ['gcash', 'paymaya', 'card'],
          // PAPALITAN MO ITO NG TOTOONG DOMAIN MO KAPAG LIVE NA:
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
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Failed to generate PayMongo link." })
      };
    }

    // 5. Ibalik ang Secure Checkout Link sa Website
    const checkoutUrl = paymongoData.data.attributes.checkout_url;

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: checkoutUrl })
    };

  } catch (error) {
    console.error("Serverless Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};