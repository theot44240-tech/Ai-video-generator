/**
 * AI Shorts Generator — Backend
 * Version finale optimisée pour Render / Node.js
 * Auteur : theot44240-tech
 */

import express from "express"; // ES module style
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // Parse JSON
app.use(express.static("public")); // Servir front-end

// --- Endpoint principal ---
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ status: "error", message: "Prompt manquant" });
    }

    // Ici, tu appelles ta fonction de génération AI
    // Exemple simple : renvoyer un texte simulé
    const script = `🎬 Script généré pour le prompt : "${prompt}"\n\nUne courte explication détaillée adaptée à un format Short.`;

    res.json({
      status: "success",
      prompt,
      script
    });
  } catch (err) {
    console.error("Erreur lors de la génération :", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// --- Test de santé ---
app.get("/status", (req, res) => {
  res.json({ status: "ok", message: "AI Shorts Generator API fonctionne !" });
});

// --- Démarrage serveur ---
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator API is running successfully on port ${PORT}!`);
});
