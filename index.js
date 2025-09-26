// index.js
/**
 * AI Shorts Generator Server
 * Node.js + Express + Hugging Face
 * Niveau top 0,1% pour lisibilité et robustesse
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { HfInference } = require('@huggingface/hub');
const path = require('path');

// === Initialisation ===
const app = express();
const PORT = process.env.PORT || 3000;
if (!process.env.HF_TOKEN) {
  console.error("Erreur : HF_TOKEN non défini dans .env");
  process.exit(1);
}
const hf = new HfInference(process.env.HF_TOKEN);

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // frontend statique

// === Routes ===

// Route principale pour tester le serveur
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route chat
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message invalide' });
    }

    // Appel à Hugging Face
    const response = await hf.textGeneration({
      model: 'gpt2', // remplacer par ton modèle préféré
      inputs: message,
      parameters: { max_new_tokens: 50 }
    });

    // Renvoie la réponse
    res.json({ reply: response[0]?.generated_text || '' });
  } catch (err) {
    console.error('Erreur serveur /chat:', err);
    res.status(500).json({ error: 'Erreur serveur, veuillez réessayer.' });
  }
});

// === Gestion des routes non trouvées ===
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// === Démarrage serveur ===
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
