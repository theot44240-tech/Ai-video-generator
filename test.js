import dotenv from 'dotenv';
dotenv.config();

import { InferenceClient } from '@huggingface/inference';

// Initialise le client Hugging Face
const hf = new InferenceClient({ apiKey: process.env.HF_TOKEN });

// Fonction pour générer un texte avec GPT-2
export async function generateText(prompt) {
  try {
    const result = await hf.textGeneration({
      model: 'gpt2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7
      }
    });

    // Retourne le texte généré
    return result.generated_text || '❌ Aucun texte généré.';
  } catch (error) {
    console.error('❌ Erreur API :', error);
    return `❌ Erreur API : ${error.message}`;
  }
}

// Exemple d'utilisation en standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2] || "Bonjour IA, écris un short vidéo sur l'IA !";
  generateText(prompt).then((output) => {
    console.log('Prompt :', prompt);
    console.log('Résultat :', output);
  });
}
