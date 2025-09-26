// ==============================================
// AI Shorts Generator – index.js
// Version finale top 0,1% – GitHub → Render Ready
// ==============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';

dotenv.config(); // Charge HF_TOKEN et PORT depuis .env

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Sert les fichiers HTML/CSS/JS côté client

// Création du client Hugging Face
const client = new InferenceClient({ token: process.env.HF_TOKEN });

// Endpoint principal pour générer du texte depuis l’IA
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Le message est vide.' });
  }

  try {
    const response = await client.textGeneration({
      model: 'gpt2',           // Modèle Hugging Face, change si nécessaire
      inputs: message,
      parameters: { max_new_tokens: 100 },
    });

    res.json({ reply: response.generated_text });
  } catch (err) {
    console.error('Erreur Hugging Face :', err);
    res.status(500).json({ error: 'Erreur serveur. Veuillez réessayer.' });
  }
});

// Port dynamique pour Render / GitHub → Render
const PORT = process.env.PORT || 3000;

// Gestion d’erreur pour port déjà utilisé
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log('💡 Endpoint /chat prêt à recevoir des messages.');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Le port ${PORT} est déjà utilisé.`);
  } else {
    console.error('Erreur serveur :', err);
  }
});
