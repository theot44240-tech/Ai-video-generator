// ===============================================
// groq.js - AI Shorts Generator
// GROQ API Manager
// Version pro top 0,1% - Node.js compatible
// ===============================================

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const LOG_DIR = './logs';
const LOG_FILE = path.join(LOG_DIR, 'groq.log');

// Crée le dossier logs si nécessaire
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

// Logger proprement
function log(message) {
    const time = new Date().toISOString();
    const line = `[${time}] ${message}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n');
}

/**
 * queryGroq - effectue une requête sur l'API Groq
 * @param {string} prompt - texte à envoyer à Groq
 * @param {Object} options - options supplémentaires (model, maxTokens, temperature)
 * @returns {Promise<Object>} - réponse Groq
 */
export async function queryGroq(prompt, options = {}) {
    const model = options.model || 'groq/compound-mini';
    const maxTokens = options.maxTokens || 512;
    const temperature = options.temperature || 0.7;

    if (!process.env.GROQ_API_KEY) {
        const errMsg = '❌ GROQ_API_KEY manquante dans les variables d\'environnement !';
        log(errMsg);
        throw new Error(errMsg);
    }

    log(`💡 Envoi requête à Groq avec le modèle "${model}" pour le prompt : "${prompt.slice(0,50)}..."`);

    try {
        const response = await axios.post(
            'https://api.groq.ai/v1/complete',
            {
                model,
                prompt,
                max_tokens: maxTokens,
                temperature
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30s timeout
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const output = response.data.choices[0].text;
            log(`✅ Réponse Groq reçue : "${output.slice(0,50)}..."`);
            return { success: true, output, raw: response.data };
        } else {
            log('⚠️ Groq réponse vide ou malformée');
            return { success: false, output: '', raw: response.data };
        }
    } catch (err) {
        log(`❌ Erreur Groq : ${err.message}`);
        return { success: false, error: err.message };
    }
}

// Exemple d'utilisation
// (async () => {
//     const res = await queryGroq("Propose une idée de short sur la motivation et le sport");
//     console.log("Réponse :", res.output);
// })();
