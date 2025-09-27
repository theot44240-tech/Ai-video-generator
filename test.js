import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Vérifie que le token Hugging Face est défini
if (!process.env.HF_TOKEN) {
  console.error("❌ HF_TOKEN n'est pas défini dans ton fichier .env");
  process.exit(1);
}

// URL de l'API Inference de Hugging Face pour Falcon 7B
const API_URL = "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct";

// Fonction pour générer du texte via le modèle
async function generateShort(prompt) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 150 } })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Hugging Face : ${errorText}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || "⚠️ Aucun texte généré.";
  } catch (err) {
    console.error(err);
    return `Erreur lors de la génération : ${err.message}`;
  }
}

// Exemple d'utilisation
(async () => {
  const prompt = "Écris un court script inspirant pour un short vidéo AI sur la productivité.";
  const result = await generateShort(prompt);
  console.log("=== Résultat généré ===");
  console.log(result);
})();
