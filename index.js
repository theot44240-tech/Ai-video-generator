// index.js - AI Shorts Generator - Version finale prête pour Render
const express = require('express');
const fetch = require('node-fetch'); // Pour requêtes Hugging Face
require('dotenv').config(); // Charger variables d'environnement depuis .env

const app = express();
app.use(express.json());

// ---------- ROUTE D'ACCUEIL ----------
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 AI Shorts Generator</h1>
    <p>API en ligne ✅</p>
    <p>POST /chat pour discuter avec l'IA</p>
    <p>POST /generate pour créer des shorts vidéos</p>
  `);
});

// ---------- ROUTE POST /chat ----------
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Le message est requis' });

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

// ---------- ROUTE POST /generate (stub vidéo) ----------
app.post('/generate', async (req, res) => {
  // Ici tu peux ajouter la logique pour générer un short vidéo
  // Exemple : images + texte + audio + montage
  res.json({ message: '🚀 Endpoint /generate prêt à être implémenté !' });
});

// ---------- PORT ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator démarré sur http://localhost:${PORT}`);
});
