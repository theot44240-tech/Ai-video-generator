// index.js – AI Shorts Generator 🚀
// Top 0,1% optimisation pour Node.js / Render

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF_TOKEN;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Endpoint racine
app.get("/", (req, res) => {
  res.json({
    status: "✅ OK",
    message: "Bienvenue sur AI Shorts Generator 🚀",
    docs: "/api/generate"
  });
});

// Endpoint de génération
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt manquant." });

    const response = await fetch("https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();

    // Renvoi de la réponse du modèle
    res.json({
      status: "✅ OK",
      prompt,
      result: data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur, veuillez réessayer." });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
