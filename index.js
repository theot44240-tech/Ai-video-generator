// ==============================
// AI Shorts Generator – index.js
// Backend Node.js Express
// Optimisé top 0,1% – prêt pour CodeSpaces / Render
// ==============================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';
import path from 'path';
import { fileURLToPath } from 'url';

// ==============================
// Chargement des variables d'environnement
// ==============================
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// Vérification du token Hugging Face
// ==============================
if (!process.env.HF_TOKEN) {
  console.error("❌ HF_TOKEN non défini dans .env !");
  process.exit(1);
}

// ==============================
// Initialisation du client Hugging Face
// ==============================
const client = new InferenceClient({ apiKey: process.env.HF_TOKEN });

// ==============================
// Middleware
// ==============================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==============================
// Route principale pour servir le frontend
// ==============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==============================
// Route API pour le chat
// ==============================
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message manquant" });

    // Génération de texte via Hugging Face
    const response = await client.textGeneration({
      model: "distilgpt2", // léger et rapide pour CodeSpaces / Render
      inputs: message,
      parameters: { max_new_tokens: 50 }
    });

    res.json({ reply: response[0].generated_text });
  } catch (err) {
    console.error("⚠️ Erreur serveur :", err);
    res.status(500).json({ error: "Erreur serveur. Veuillez réessayer." });
  }
});

// ==============================
// Démarrage du serveur
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Serveur AI Shorts Generator démarré sur le port ${PORT}`);
});
