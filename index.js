import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

// Charger les variables d'environnement
dotenv.config();

// Initialisation HuggingFace avec ton token (Render → "Environment Variables")
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("❌ Erreur : la variable d'environnement HF_TOKEN est manquante.");
  process.exit(1);
}
const hf = new HfInference(HF_TOKEN);

// Initialisation serveur Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" })); // support JSON large

// =============== ROUTES =============== //

// Test de vie du serveur
app.get("/", (req, res) => {
  res.json({
    status: "✅ OK",
    message: "Bienvenue sur AI Shorts Generator 🚀",
    docs: "/api/generate"
  });
});

// Endpoint principal pour générer un texte
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "❌ Le champ 'prompt' est requis." });
    }

    console.log(`📝 Prompt reçu : "${prompt}"`);

    // Appel Hugging Face
    const response = await hf.textGeneration({
      model: "gpt2", // ⚡️ tu peux changer pour un modèle plus puissant
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
        top_p: 0.9
      }
    });

    console.log("✅ Réponse Hugging Face envoyée.");
    res.json({ result: response.generated_text });

  } catch (error) {
    console.error("❌ Erreur dans /api/generate :", error);
    res.status(500).json({
      error: "Erreur interne du serveur.",
      details: error.message
    });
  }
});

// ====================================== //

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur AI Shorts Generator lancé sur http://localhost:${PORT}`);
});
