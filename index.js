// index.js - AI Shorts Generator complet
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
  res.send('<h1>🚀 AI Shorts Generator</h1><p>API en ligne ✅</p>');
});

// Route POST /chat
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message requis' });

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) return res.status(500).json({ error: 'HF_TOKEN manquant' });

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: message }),
    });

    const data = await response.json();

    if (data.error) return res.status(500).json({ error: data.error });

    const answer = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : '🤖 L’IA a rencontré un problème.';
    res.json({ response: answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur /chat' });
  }
});

// Route POST /generate (stub)
app.post('/generate', async (req, res) => {
  res.json({ message: '🚀 Endpoint /generate prêt à être implémenté !' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator démarré sur http://localhost:${PORT}`);
});
