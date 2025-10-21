import dotenv from 'dotenv';
import Groq from "groq-sdk";

// 🔹 Chargement du .env
dotenv.config();

// 🔹 Clé Groq : priorité à celle du .env, sinon clé directe
const GROQ_API_KEY = process.env.GROQ_API_KEY || "ta_clef_groq_ici";

if (!GROQ_API_KEY || GROQ_API_KEY === "ta_clef_groq_ici") {
  console.warn("⚠️ GROQ_API_KEY non définie dans .env, utilisation de la clé directe. Remplace-la par ta vraie clé pour sécuriser.");
}

// 🔹 Initialisation du client Groq
const client = new Groq({ apiKey: GROQ_API_KEY });

// 🔹 Modèles et paramètres
const MODELS = ["llama-3.1-8b-instant", "llama-3.1-70b", "mixtral-8x7b"];
const MAX_RETRIES = 5;

// 🔹 Fonction principale
async function generateShortIdea(prompt) {
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🟢 Tentative ${attempt}/${MAX_RETRIES} avec ${model}...`);

        const response = await client.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content:
                "Tu es un créateur de contenu YouTube Shorts. Donne une idée courte, percutante et virale.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 150,
        });

        const output = response.choices[0]?.message?.content?.trim();
        if (output) return output;

        throw new Error("Réponse vide");
      } catch (err) {
        console.error(`❌ Erreur (${model}) : ${err.message}`);
        const delay = 1000 + attempt * 1500;
        console.log(`Pause ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    console.log(`⚠️ Fallback sur modèle suivant...`);
  }
  throw new Error("💀 Abandon après trop d’échecs sur tous les modèles.");
}

// 🔹 Prompt par défaut ou via ligne de commande
const prompt = process.argv.slice(2).join(" ") || "Une idée de short sur la motivation et le sport";

generateShortIdea(prompt)
  .then((r) => console.log("\n✅ Résultat :", r))
  .catch((e) => console.error("\nErreur fatale :", e.message));
