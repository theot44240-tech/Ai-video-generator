// ===============================================
// tts.js - AI Shorts Generator
// TTS Manager - PlayAI + Google TTS fallback
// Version ultra clean, top 0,1%
// ===============================================

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const LOG_DIR = './logs';
const AUDIO_DIR = './audio';
const LOG_FILE = path.join(LOG_DIR, 'tts.log');

// Crée les dossiers si nécessaire
[LOG_DIR, AUDIO_DIR].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir); });

// Logger proprement
function log(message) {
    const time = new Date().toISOString();
    const line = `[${time}] ${message}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n');
}

// Hash unique pour éviter les doublons
function hashText(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * textToSpeech - génère un TTS à partir d'un texte
 * @param {string} text - texte à convertir en audio
 * @param {Object} options
 * @param {string} options.voice - voix (ex: 'fr-FR')
 * @param {string} options.format - format audio ('mp3' ou 'wav')
 * @returns {Promise<{ filename: string }>}
 */
export async function textToSpeech(text, options = {}) {
    const voice = options.voice || 'fr-FR';
    const format = options.format || 'mp3';
    const hash = hashText(text + voice);
    const filename = path.join(AUDIO_DIR, `${hash}.${format}`);

    if (fs.existsSync(filename)) {
        log(`✅ TTS existant : ${filename}`);
        return { filename };
    }

    log(`🎤 Génération TTS : "${text.slice(0,50)}..." avec voix ${voice}`);

    // 1️⃣ Essai PlayAI
    if (process.env.PLAYAI_API_KEY) {
        try {
            const response = await axios.post(
                'https://api.playai.com/tts',
                { text, voice },
                { responseType: 'arraybuffer', headers: { 'Authorization': `Bearer ${process.env.PLAYAI_API_KEY}` } }
            );
            fs.writeFileSync(filename, Buffer.from(response.data));
            log(`✅ PlayAI TTS généré : ${filename}`);
            return { filename };
        } catch (err) {
            log(`⚠️ PlayAI échoué : ${err.message}`);
        }
    }

    // 2️⃣ Fallback Google TTS via Python
    const pyScript = path.join(process.cwd(), 'tts_script.py');
    if (fs.existsSync(pyScript)) {
        try {
            const cmd = `python "${pyScript}" "${text.replace(/"/g, '\\"')}" "${filename}" "${voice}"`;
            await execAsync(cmd);
            log(`✅ Google TTS généré : ${filename}`);
            return { filename };
        } catch (err) {
            log(`❌ Google TTS échoué : ${err.message}`);
        }
    }

    throw new Error('❌ Aucun moteur TTS disponible !');
}

// Exemples d'utilisation
// (décommenter pour tester)
// (async () => {
//     const result = await textToSpeech("Bonjour, test TTS ultra stylé !");
//     console.log("Fichier audio généré :", result.filename);
// })();
