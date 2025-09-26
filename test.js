// =============================
// AI Shorts Generator – test.js
// Test de l'API Hugging Face
// Niveau top 0,1% – sécurisé et maintenable
// =============================

import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';

dotenv.config();

// Vérification du token
if (!process.env.HF_TOKEN) {
  console.error("❌ Erreur : HF_TOKEN non défini dans .env");
  process.exit(1);
}

const client = new InferenceClient({ apiKey: process.env.HF_TOKEN });

async function testAI() {
  try {
    const prompt = "Bonjour, peux-tu me répondre ?";
    
    const response = await client.textGeneration({
      model: 'gpt2',                 // Remplace par ton modèle préféré
      inputs: prompt,
      parameters: { max_new_tokens: 50 }
    });

    // Affiche la réponse générée
    console.log("Prompt :", prompt);
    console.log("Réponse IA :", response[0].generated_text);

  } catch (err) {
    console.error("⚠️ Erreur lors de la génération de texte :", err);
  }
}

testAI();
