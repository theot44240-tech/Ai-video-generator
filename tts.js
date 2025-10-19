// tts.js
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import googleTTS from "google-tts-api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAYAI_API_KEY = process.env.PLAYAI_API_KEY || "";
const TTS_OUTPUT_DIR = path.join(__dirname, "tts_output");

// Crée le dossier de sortie si besoin
if (!fs.existsSync(TTS_OUTPUT_DIR)) {
  fs.mkdirSync(TTS_OUTPUT_DIR, { recursive: true });
}

export async function generateTTS(text, voice = "en", filename = "output.mp3") {
  const filePath = path.join(TTS_OUTPUT_DIR, filename);

  try {
    // --- 1️⃣ Essai avec PlayAI (si clé présente) ---
    if (PLAYAI_API_KEY) {
      console.log("🔊 Utilisation de PlayAI TTS...");

      const response = await axios.post(
        "https://api.play.ai/v1/tts",
        {
          text,
          voice: voice === "fr" ? "charlotte" : "james", // exemple FR/EN
          format: "mp3",
        },
        {
          headers: {
            Authorization: `Bearer ${PLAYAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      fs.writeFileSync(filePath, response.data);
      console.log("✅ Audio généré via PlayAI :", filePath);
      return filePath;
    }

    // --- 2️⃣ Fallback automatique vers Google TTS ---
    console.log("🎙️ PlayAI indisponible, utilisation de Google TTS...");

    const url = googleTTS.getAudioUrl(text, {
      lang: voice === "fr" ? "fr" : "en",
      slow: false,
      host: "https://translate.google.com",
    });

    const audio = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, audio.data);

    console.log("✅ Audio généré via Google TTS :", filePath);
    return filePath;
  } catch (error) {
    console.error("❌ Erreur lors de la génération TTS :", error.message);
    throw error;
  }
}
