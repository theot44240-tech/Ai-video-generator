import { GroqClient } from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new GroqClient({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateScript(prompt) {
  try {
    const query = `Generate a short, punchy script for a motivational YouTube/TikTok short based on: "${prompt}"`;
    const result = await client.query(query);
    return result.text || result; // selon la réponse de l'API
  } catch (err) {
    console.error("Erreur Groq:", err);
    return `Sorry, couldn't generate script for: ${prompt}`;
  }
}
