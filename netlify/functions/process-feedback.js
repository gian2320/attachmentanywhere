exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { rating, message } = JSON.parse(event.body);

    // 1. Kakausapin si Gemini gamit ang raw fetch (Walang package na kailangan!)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const prompt = `You are Daemon, an AI operations manager for an NFC business called 'Attachment Anywhere'. A customer left this feedback: "${message}". Analyze the issue briefly and provide a direct, actionable recommendation for the owner to fix it. Keep it punchy and professional.`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const geminiData = await geminiRes.json();
    const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Daemon analysis unavailable.";

    // 2. Ipapadala sa Discord Webhook ang alert
    const discordPayload = {
      embeds: [{
        title: `🚨 New Feedback Alert`,
        color: 3066993, // Green color
        fields: [
          { name: "Customer Feedback", value: message || "No comment provided." },
          { name: "Daemon's Action Plan", value: analysis }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
