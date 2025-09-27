// test.js – AI Shorts Generator
// Version finale optimisée pour Node.js / Render
// Modèle : tiiuae/falcon-7b-instruct

import 'dotenv/config';
import { InferenceClient } from '@huggingface/inference';

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
  try {
    // Texte de test
    const inputText = "Bonjour IA, peux-tu générer un court résumé amusant ?";

    // Appel au modèle Falcon 7B Instruct
    const response = await client.textGeneration({
      model: "tiiuae/falcon-7b-instruct",
      inputs: inputText,
      parameters: { max_new_tokens: 100 }
    });

    console.log("=== Résultat ===");
    console.log(response.generated_text);
  } catch (error) {
    console.error("❌ Une erreur est survenue :", error);
  }
}

// Exécution du test
main();
