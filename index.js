// =========================================
// AI Shorts Generator – index.js
// Optimisé top 0,1%, prêt pour Render / Node.js
// =========================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Hugging Face client
const hf = new InferenceClient({ apiKey: process.env.HF_TOKEN });
const MODEL = process.env.MODEL || "tiiuae/falcon-7b-instruct";

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "✅ OK",
    message: "Bienvenue sur AI Shorts Generator 🚀",
    docs: "/api/generate",
  });
});

// API endpoint pour générer du texte
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ status: "❌ Error", message: "Le prompt est requis." });
    }

    const response = await hf.textGeneration({
      model: MODEL,
      inputs: prompt,
      parameters: { max_new_tokens: 150 },
    });

    res.json({
      status: "✅ OK",
      generated_text: response.generated_text || response[0]?.generated_text || "Aucun texte généré",
    });
  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ status: "❌ Error", message: "Erreur serveur. Veuillez réessayer." });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator en ligne sur le port ${PORT}`);
});
