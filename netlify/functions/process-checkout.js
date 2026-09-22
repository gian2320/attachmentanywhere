document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById('order-form'); 
  const checkoutBtn = document.getElementById('checkout-btn'); 

  if(orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault(); 

      // 1. Kunin ang form data
      const formData = new FormData(orderForm);
      const name = formData.get('name') || "Customer";
      const email = formData.get('email') || "No Email";
      const phone = formData.get('phone') || "No Phone";
      const product = document.getElementById('productSelect').value;

      // 2. I-set ang presyo (Centavos)
      let amount = 0;
      let description = "";
      
      if (product === "executive") { 
        amount = 120000; 
        description = "Smart Executive Card"; 
      } else if (product === "shield") { 
        amount = 50000;  
        description = "Google ReviewShield"; 
      } else if (product === "hub") { 
        amount = 250000; 
        description = "Business Smart Hub"; 
      }

      if(amount === 0) {
        alert("Boss, pumili muna ng produkto.");
        return;
      }

      // 3. UI Update
      const originalBtnText = checkoutBtn.innerText;
      checkoutBtn.innerText = "Securing Payment...";
      checkoutBtn.disabled = true;
      checkoutBtn.classList.add('opacity-50');

      // ==========================================
      // SETUP NG MGA KEYS AT WEBHOOKS (PALITAN MO 'TO)
      // ==========================================
      const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY; 
      const ORDER_DISCORD_WEBHOOK = process.env.ORDER_DISCORD_WEBHOOK;
      // ==========================================
      
      const encodedKey = btoa(PAYMONGO_SECRET_KEY); 

      const options = {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': `Basic ${encodedKey}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
              line_items: [{
                  currency: 'PHP',
                  amount: amount,
                  description: description,
                  name: description,
                  quantity: 1
              }],
              payment_method_types: ['gcash', 'paymaya', 'card'],
              description: 'Attachment Anywhere Order',
              billing: { name: name, email: email, phone: phone }
            }
          }
        })
      };

      // 4. I-send sa PayMongo at Discord
      try {
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
        const json = await response.json();

        if (json.data && json.data.attributes && json.data.attributes.checkout_url) {
          
          // 🔥 BAGO MAG-REDIRECT, I-SEND SA DISCORD HQ 🔥
          // Gumamit tayo ng .catch para kahit magloko ang Discord, tuloy pa rin ang bayad sa PayMongo
          fetch(ORDER_DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🚨 **NEW CHECKOUT INITIATED!** 🚨\n> **Product:** ${description}\n> **Customer:** ${name}\n> **Contact:** ${email} | ${phone}\n> **Amount:** ₱${amount/100}`
            })
          }).catch(err => console.error("Discord webhook failed:", err));

          // JACKPOT! Redirect sa secure checkout page ni PayMongo
          window.location.href = json.data.attributes.checkout_url;
          
        } else {
          console.error("PayMongo Error:", json);
          alert("May error sa payment gateway. I-check ang console.");
          checkoutBtn.innerText = originalBtnText;
          checkoutBtn.disabled = false;
          checkoutBtn.classList.remove('opacity-50');
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        alert("Internet connection error. Try again.");
        checkoutBtn.innerText = originalBtnText;
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('opacity-50');
      }
    });
  }
});