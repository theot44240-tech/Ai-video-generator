// test.js – AI Shorts Generator (Top 0,1% optimisation)
// Modèle : distilgpt2
// Déploiement : Render / Node.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import { HfInference } from '@huggingface/inference';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialisation Hugging Face avec token
const hf = new HfInference(process.env.HF_TOKEN);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route principale pour tester la génération
app.get('/', (req, res) => {
  res.json({
    status: '✅ OK',
    message: 'Bienvenue sur AI Shorts Generator 🚀',
    docs: '/api/generate'
  });
});

// Route API pour générer du texte (short)
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ status: '❌ Error', message: 'Prompt manquant.' });
    }

    // Appel API Hugging Face avec distilgpt2
    const output = await hf.textGeneration({
      model: 'distilgpt2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7
      }
    });

    res.json({
      status: '✅ OK',
      prompt: prompt,
      result: output.generated_text
    });

  } catch (err) {
    console.error('❌ Erreur API :', err);
    res.status(500).json({ status: '❌ Error', message: 'Erreur serveur.', details: err.message });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur AI Shorts Generator démarré sur le port ${PORT}`);
  console.log(`🌐 Accessible sur : http://localhost:${PORT}`);
});
