import 'dotenv/config'; // charge automatiquement le .env
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function run() {
  try {
    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: "Explain the importance of fast language models",
    });
    console.log(response.output_text);
  } catch (error) {
    console.error("Erreur API :", error.response ? error.response.data : error.message);
  }
}

run();
