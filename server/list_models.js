require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct "listModels" in the standard SDK easily accessible like this without more setup usually
    // but we can try a simple probe.
    console.log("Testing API key validity...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("test");
    console.log("Success");
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
