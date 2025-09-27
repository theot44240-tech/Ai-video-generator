// ================================================
// AI Shorts Generator – index.js
// Version finale, prête à déployer sur Render
// Modèle: mistralai/Mistral-7B-Instruct-v0.2
// ================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Vérification serveur
app.get('/', (req, res) => {
  res.json({
    status: "✅ OK",
    message: "Bienvenue sur AI Shorts Generator 🚀",
    docs: "/api/generate"
  });
});

// Endpoint pour générer du contenu via Hugging Face
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ status: "error", message: "Le champ 'prompt' est requis." });
    }

    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 150, temperature: 0.7 }
      })
    });

    const data = await response.json();

    // Vérifie si la réponse contient du texte généré
    const output = data?.generated_text || data?.error || "Erreur lors de la génération";

    res.json({ status: "success", result: output });

  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ status: "error", message: "Erreur serveur. Veuillez réessayer." });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator est en ligne sur le port ${PORT}`);
});
