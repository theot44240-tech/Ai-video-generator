/**
 * AI Shorts Generator — Backend
 * Version finale optimisée pour Render / Node.js
 * Auteur : theot44240-tech
 */

const express = require("express");
const dotenv = require("dotenv");

dotenv.config(); // Charge .env si présent

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.static("public")); // Sert index.html, style.css, script.js
app.use(express.json()); // Parse les requêtes POST JSON

// Endpoint pour générer un short
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ status: "error", message: "Prompt manquant" });
    }

    // Ici, tu peux intégrer ton AI réel (Hugging Face / OpenAI)
    const script = `🎬 Script généré pour le prompt : "${prompt}"`;

    res.json({ status: "success", prompt, script });

  } catch (err) {
    console.error("Erreur dans /generate :", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Endpoint pour vérifier si l'API fonctionne
app.get("/status", (req, res) => {
  res.json({ status: "ok", message: "AI Shorts Generator API fonctionne !" });
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator API is running successfully on port ${PORT}!`);
});
