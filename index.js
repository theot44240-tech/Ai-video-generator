import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const hfClient = new InferenceClient(process.env.HF_TOKEN);

// Endpoint racine
app.get('/', (req, res) => {
  res.json({
    status: '✅ OK',
    message: 'Bienvenue sur AI Shorts Generator 🚀',
    docs: '/api/generate'
  });
});

// Endpoint pour générer du contenu
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt manquant.' });

    const result = await hfClient.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: { max_new_tokens: 150 }
    });

    res.json({ generated_text: result.generated_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la génération.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
});
