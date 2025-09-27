// index.js – AI Shorts Generator avec distilgpt2
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialisation Hugging Face
const hf = new HfInference(process.env.HF_TOKEN);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // pour servir index.html, script.js, style.css

// Route racine
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

// Endpoint pour générer du texte
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ status: '❌', message: 'Prompt manquant' });
  }

  try {
    const output = await hf.textGeneration({
      model: 'distilgpt2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        do_sample: true,
        top_k: 50,
        top_p: 0.95
      }
    });

    res.json({
      status: '✅',
      prompt,
      generated: output[0].generated_text
    });
  } catch (error) {
    console.error('Erreur API :', error.message);
    res.status(500).json({
      status: '❌',
      message: 'Erreur serveur : ' + error.message
    });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur AI Shorts Generator lancé sur http://localhost:${PORT}`);
  console.log(`✅ Your service is live at your primary URL if deployed on Render`);
});
