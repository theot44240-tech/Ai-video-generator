// index.js - AI Shorts Generator 🚀 (GPT-2)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { InferenceClient } from '@huggingface/inference';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Hugging Face Client
const hf = new InferenceClient({ apiKey: process.env.HF_TOKEN });

// Route racine
app.get('/', (req, res) => {
  res.send({
    status: "✅ OK",
    message: "Bienvenue sur AI Shorts Generator 🚀",
    docs: "/api/generate"
  });
});

// Endpoint pour générer du texte avec GPT-2
app.post('/api/generate', async (req, res) => {
  const { prompt, max_tokens } = req.body;

  if (!prompt) {
    return res.status(400).json({ status: "❌ Error", message: "Prompt manquant." });
  }

  try {
    const output = await hf.textGeneration({
      model: "gpt2",
      inputs: prompt,
      parameters: {
        max_new_tokens: max_tokens || 100
      }
    });

    res.json({
      status: "✅ Success",
      prompt,
      result: output[0].generated_text
    });
  } catch (error) {
    console.error("❌ Erreur API :", error);
    res.status(500).json({ status: "❌ Error", message: error.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur AI Shorts Generator démarré sur le port ${PORT}`);
  console.log(`Disponible sur : http://localhost:${PORT}`);
});
