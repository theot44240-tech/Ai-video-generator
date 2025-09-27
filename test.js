import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/generate';
const TEST_PROMPT = 'Bonjour, génère un short vidéo inspirant sur l\'IA.';

async function testAPI() {
  try {
    console.log(`🚀 Envoi d'une requête à l'API: ${API_URL}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: TEST_PROMPT })
    });

    if (!response.ok) {
      console.error(`❌ Erreur HTTP: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log('✅ Réponse de l\'API:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('🔥 Erreur lors du test de l\'API:', error.message);
  }
}

testAPI();
