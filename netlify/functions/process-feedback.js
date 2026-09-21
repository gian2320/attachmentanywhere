// File location: netlify/functions/process-feedback.js

exports.handler = async function(event, context) {
  // Harangin kung hindi POST request
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { rating, message } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;
    const discordUrl = process.env.DISCORD_WEBHOOK_URL;

    // 1. Kakausapin natin si Gemini
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `
      You are Daemon, Gian's direct, witty, and practical AI collaborator. 
      Gian just received a ${rating}-star feedback for his NFC business 'Attachment Anywhere'. 
      Customer message: "${message}". 
      
      Your job:
      1. Categorize it (e.g., Complaint, Praise, Feature Request).
      2. Give Gian 2 direct, actionable steps to handle this. Keep it practical, no corporate fluff, and speak in Taglish.
    `;

    const geminiRes = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    const geminiData = await geminiRes.json();
    const analysis = geminiData.candidates[0].content.parts[0].text;

    // 2. Ibabato ang report sa Discord HQ mo
    // Green kung 5-star, Yellow kung 3-4, Red kung 1-2 stars
    const colorCode = rating === 5 ? 65280 : (rating > 2 ? 16776960 : 16711680);

    const discordMessage = {
      embeds: [{
        title: "📡 New Intel: Attachment Anywhere",
        color: colorCode,
        fields: [
          { name: "Rating", value: `${rating}/5 Stars`, inline: true },
          { name: "Raw Customer Feedback", value: `"${message}"` },
          { name: "Daemon's Analysis & Protocol", value: analysis }
        ],
        footer: { text: "Securely processed via Netlify + Gemini" }
      }]
    };

    await fetch(discordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });

    // Tapos na, ibalik ang success signal sa front-end
    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};