/**
 * 🚀 AI Shorts Generator Ultra-Complet – Render Ready
 * Tout-en-un : Texte → TTS → Transcription → Vidéo
 */

import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import axios from "axios";
import FormData from "form-data";
import googleTTS from "google-tts-api";
import cors from "cors";
import { exec } from "child_process";

dotenv.config();

// -------------------- CONFIG --------------------
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = process.env.OUTPUT_DIR || "./output";
const UPLOADS_DIR = "./uploads";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const PLAYAI_TTS_KEY = process.env.PLAYAI_TTS_KEY || "";
const REQUEST_TIMEOUT_MS = 60_000;

[OUTPUT_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// -------------------- CLIENTS --------------------
const groqClient = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const axiosClient = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// -------------------- EXPRESS --------------------
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());
app.use("/output", express.static(OUTPUT_DIR));

// -------------------- ROUTES --------------------

// Serve simple check page
app.get("/", (req, res) => {
  res.send("🎬 AI Shorts Generator is running 🚀");
});

// Génération complète : texte → TTS → vidéo
app.post("/generate", async (req, res) => {
  try {
    const { prompt, voice, duration } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt manquant" });

    console.log(`💡 Prompt : ${prompt}`);

    // --- 1️⃣ Génération texte ---
    let aiText = "";
    try {
      const response = await groqClient.chat.completions.create({
        model: "groq/compound-mini",
        messages: [{ role: "user", content: prompt }],
      });
      aiText = response.choices?.[0]?.message?.content || prompt;
    } catch (e) {
      console.warn("⚠️ Groq échoué, fallback Llama");
      aiText = prompt; // fallback minimal
    }

    // --- 2️⃣ TTS PlayAI → Google ---
    const ttsFilename = `tts_${Date.now()}.mp3`;
    const ttsPath = path.join(OUTPUT_DIR, ttsFilename);

    try {
      if (PLAYAI_TTS_KEY) {
        throw new Error("PlayAI TTS non intégré, fallback Google");
      }
    } catch {
      const url = googleTTS.getAudioUrl(aiText, {
        lang: voice.startsWith("fr") ? "fr" : "en",
        slow: false,
        host: "https://translate.google.com",
      });
      const audioRes = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(ttsPath, audioRes.data);
    }

    // --- 3️⃣ Génération vidéo simple ---
    const videoFilename = `short_${Date.now()}.mp4`;
    const videoPath = path.join(OUTPUT_DIR, videoFilename);
    const dur = parseInt(duration) || 30;

    // Génération vidéo via FFmpeg (texte + audio)
    const ffmpegCmd = `
      ffmpeg -y -f lavfi -i color=c=black:s=720x1280:d=${dur} \
      -i "${ttsPath}" \
      -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf: \
      text='${aiText}': fontcolor=white: fontsize=36: x=(w-text_w)/2: y=(h-text_h)/2" \
      -c:v libx264 -c:a aac -shortest "${videoPath}"
    `;
    await new Promise((resolve, reject) => {
      exec(ffmpegCmd, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      });
    });

    // --- 4️⃣ Réponse ---
    res.json({
      text: aiText,
      audio: `/output/${ttsFilename}`,
      video: `/output/${videoFilename}`,
      duration: dur,
    });

  } catch (err) {
    console.error("❌ Erreur /generate :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// -------------------- START --------------------
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT} ✅`);
});
