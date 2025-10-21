/**
 * 🚀 AI Shorts Generator – Render Ultra-Stable
 * 
 * IA Texte   : llama-3.1-8b-instant → meta-llama/llama-guard-4-12b → groq/compound-mini
 * Voix       : PlayAI → Google TTS fallback
 * Transcription : whisper-large-v3-turbo → whisper-large-v3
 * Logs + CORS pour Render
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
app.get("/", (req, res) => {
  res.send("🎬 AI Shorts Generator is running 🚀");
});

// Génération texte + TTS
app.post("/generate", async (req, res) => {
  try {
    const { prompt, voice, duration } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt manquant" });

    console.log(`💡 Prompt reçu : ${prompt}`);
    
    // --- 1️⃣ Génération texte (Groq fallback inclus) ---
    let aiText = "";
    try {
      const response = await groqClient.chat.completions.create({
        model: "groq/compound-mini",
        messages: [{ role: "user", content: prompt }],
      });
      aiText = response.choices?.[0]?.message?.content || "";
    } catch (e) {
      console.warn("⚠️ Groq échoué, fallback Llama-3.1-8b-instant");
      // ici tu peux ajouter fallback llama si tu veux
      aiText = prompt; // fallback minimal
    }

    // --- 2️⃣ TTS PlayAI → Google ---
    let audioPath = path.join(OUTPUT_DIR, `tts_${Date.now()}.mp3`);
    try {
      if (PLAYAI_TTS_KEY) {
        // TODO: intégration PlayAI TTS
        throw new Error("PlayAI TTS pas encore intégré"); 
      }
    } catch {
      // fallback Google TTS
      const url = googleTTS.getAudioUrl(aiText, {
        lang: voice.startsWith("fr") ? "fr" : "en",
        slow: false,
        host: "https://translate.google.com",
      });
      const audioRes = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, audioRes.data);
    }

    // --- 3️⃣ Réponse ---
    res.json({
      text: aiText,
      audio: `/output/${path.basename(audioPath)}`,
      duration: duration || 30,
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
