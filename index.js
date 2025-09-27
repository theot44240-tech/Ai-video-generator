// index.js – AI Shorts Generator
// Version finale optimisée pour Node.js / Render
// Modèle : tiiuae/falcon-7b-instruct

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { InferenceClient } from '@huggingface/inference';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Pour servir index.html, style.css, script.js

// Initialisation du client Hugging Face
const client = new InferenceClient(process.env.HF_TOKEN);

// Route de test de l'API
app.get('/', (req, res) => {
  res.json({
    status: "✅ OK",
    message: "Bienvenue sur AI Shorts Generator 🚀",
    docs: "/api/generate"
  });
});

// Route pour générer du texte avec Falcon 7B Instruct
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, max_tokens } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Veuillez fournir un prompt." });
    }

    const response = await client.textGeneration({
      model: "tiiuae/falcon-7b-instruct",
      inputs: prompt,
      parameters: {
        max_new_tokens: max_tokens || 100
      }
    });

    res.json({ generated_text: response.generated_text });
  } catch (error) {
    console.error("❌ Erreur API :", error);
    res.status(500).json({ error: "Une erreur est survenue lors de la génération." });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur AI Shorts Generator démarré sur le port ${port}`);
});
