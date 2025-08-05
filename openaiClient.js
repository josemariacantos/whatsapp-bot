// openaiClient.js
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,  // Poné tu API Key en .env
});

const openai = new OpenAIApi(configuration);

module.exports = openai;
