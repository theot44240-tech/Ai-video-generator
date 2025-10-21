// ===============================================
// tts.js - AI Shorts Generator
// TTS Manager - PlayAI + Google TTS fallback
// Optimisé top 0,1% - Compatible Node.js
// ===============================================

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';
import { exec } from 'child_process';

const LOG_FILE = './logs/tts.log';
const AUDIO_DIR = './audio';

// Crée le dossier audio si nécessaire
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR);

// Fonction utilitaire pour logger proprement
function log(message) {
    const time = new Date().toISOString();
    const logLine = `[${time}] ${message}`;
    console.log(logLine);
    fs.appendFileSync(LOG_FILE, logLine + '\n');
}

// Génère un hash unique du texte pour éviter les doublons
function hashText(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

// Fonction principale TTS
export async function textToSpeech(text, options = {}) {
    const voice = options.voice || 'fr-FR';
    const format = options.format || 'mp3';
    const hash = hashText(text + voice);
    const filename = path.join(AUDIO_DIR, `${hash}.${format}`);

    // Si le fichier existe déjà, on le réutilise
    if (fs.existsSync(filename)) {
        log(`✅ TTS déjà généré pour ce texte : ${filename}`);
        return filename;
    }

    log(`🎤 Génération TTS pour texte : "${text.slice(0, 50)}..." avec la voix ${voice}`);

    try {
        // -----------------------
        // 1️⃣ Essai PlayAI
        // -----------------------
        if (process.env.PLAYAI_API_KEY) {
            try {
                const response = await axios.post(
                    'https://api.playai.com/tts',
                    { text, voice },
                    {
                        responseType: 'arraybuffer',
                        headers: { 'Authorization': `Bearer ${process.env.PLAYAI_API_KEY}` }
                    }
                );
                fs.writeFileSync(filename, Buffer.from(response.data));
                log(`✅ TTS PlayAI généré : ${filename}`);
                return filename;
            } catch (err) {
                log(`⚠️ PlayAI TTS échoué : ${err.message}`);
            }
        }

        // -----------------------
        // 2️⃣ Fallback Google TTS (via Python script)
        // -----------------------
        const pyScript = path.join(process.cwd(), 'tts_script.py');
        if (fs.existsSync(pyScript)) {
            await new Promise((resolve, reject) => {
                const cmd = `python ${pyScript} "${text.replace(/"/g, '\\"')}" "${filename}" "${voice}"`;
                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        log(`❌ Google TTS échoué : ${error.message}`);
                        reject(error);
                    } else {
                        log(`✅ TTS Google généré : ${filename}`);
                        resolve();
                    }
                });
            });
            return filename;
        }

        throw new Error('Aucun moteur TTS disponible !');
    } catch (err) {
        log(`❌ Erreur TTS : ${err.message}`);
        throw err;
    }
}

// Exemples d'utilisation
// (décommenter pour tester)
// textToSpeech("Bonjour ! Ceci est un test.", { voice: "fr-FR" })
//     .then(f => console.log("Fichier audio généré :", f))
//     .catch(err => console.error(err));
