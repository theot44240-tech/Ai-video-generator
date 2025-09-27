// ==============================
// AI Shorts Generator - index.js
// Version finale optimisée (top 0,1%)
// Déploiement : Render / Node.js >=18
// ==============================

import express from "express";
import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

// Charger les variables d’environnement (.env local / Render dashboard)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF_TOKEN;

// Vérification du token Hugging Face
if (!HF_TOKEN) {
  console.error("❌ ERREUR : HF_TOKEN est manquant. Ajoute-le dans ton .env (local) ou sur Render (Environment Variables).");
  process.exit(1);
}

// Initialiser Hugging Face
const hf = new HfInference(HF_TOKEN);

// Middleware
app.use(express.json());

// ==============================
// 🚀 Route de test
// ==============================
app.get("/", (req, res) => {
  res.json({
    status: "✅ OK",
    message: "Bienvenue sur AI Shorts Generator 🚀",
    docs: "/api/generate"
  });
});

// ==============================
// ✨ Route principale : génération
// ==============================
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        error: "❌ Merci de fournir un prompt valide (minimum 5 caractères)."
      });
    }

    console.log(`📩 Prompt reçu : ${prompt}`);

    // Appel au modèle Hugging Face
    const response = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,   // Limite la longueur → évite Render timeout
        temperature: 0.7,      // Contrôle la créativité
        repetition_penalty: 1.2 // Évite les répétitions
      }
    });

    res.json({
      success: true,
      prompt,
      output: response.generated_text
    });

  } catch (err) {
    console.error("❌ Erreur API Hugging Face :", err.message);
    res.status(500).json({
      error: "Erreur interne lors de la génération.",
      details: err.message
    });
  }
});

// ==============================
// Lancer le serveur
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
