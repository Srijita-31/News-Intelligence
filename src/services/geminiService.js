const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const queryGemini = async (context, userQuery) => {
  try {
    const prompt = `Use the following context to answer the question.\n\nContext: ${context.join('\n')}\n\nQuestion: ${userQuery}`;
    
    // Correct URL for Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    });

    // Correct path for the response text
    return response.data.candidates[0].content.parts[0].text || 'No response from Gemini';
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    return 'Error generating response';
  }
};

module.exports = { queryGemini };