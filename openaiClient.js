// openaiClient.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Tu clave API en el .env
});

module.exports = openai;
