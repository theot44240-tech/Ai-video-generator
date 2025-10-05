import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = "distilgpt2";

async function generate(prompt) {
  try {
    console.log("🔹 Envoi de la requête à Hugging Face...");
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      console.error("❌ Erreur API :", response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log("✅ Résultat :", data);
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
}

// Exemple
generate("Bonjour le monde !");
