// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { HfInference } = require('@huggingface/hub');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // sert index.html, script.js, style.css

// Initialisation Hugging Face
const hf = new HfInference(process.env.HF_TOKEN);

// Route test / chat
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const response = await hf.textGeneration({
      model: 'gpt2', // tu peux remplacer par un modèle Hugging Face de ton choix
      inputs: message,
      parameters: { max_new_tokens: 50 }
    });

    res.json({ reply: response[0].generated_text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
