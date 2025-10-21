/**
 * 🚀 AI Shorts Generator — Render Ultra-Stable Top 0,1%
 */

import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import googleTTS from "google-tts-api";
import cors from "cors";
import pLimit from "p-limit";

dotenv.config();

const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = "./output";
const UPLOAD_DIR = "./uploads";
const REQUEST_TIMEOUT_MS = 60_000;
const CONCURRENCY_LIMIT = 3;

// Création dossiers auto
[OUTPUT_DIR, UPLOAD_DIR].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) });

// API Keys
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const PLAYAI_TTS_KEY = process.env.PLAYAI_TTS_KEY || "";
if (!GROQ_API_KEY) console.warn("⚠️ GROQ_API_KEY manquant !");
if (!PLAYAI_TTS_KEY) console.warn("⚠️ PLAYAI_TTS_KEY manquant, fallback Google TTS activé");

// Clients
const groqClient = new OpenAI({ apiKey: GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
const axiosClient = axios.create({ timeout: REQUEST_TIMEOUT_MS, maxContentLength: Infinity, maxBodyLength: Infinity });
const limit = pLimit(CONCURRENCY_LIMIT);

// Utils
const log = msg => console.log(`[AI Shorts Generator] ${new Date().toISOString()} | ${msg}`);
const genFilePath = (prefix, ext) => path.join(OUTPUT_DIR, `${prefix}_${Date.now()}.${ext}`);
const safeWriteFile = async (filePath, data) => fs.promises.writeFile(filePath, data);

// TTS
async function generateTTS(text, lang = "fr") {
  try {
    if (PLAYAI_TTS_KEY) {
      const res = await axiosClient.post("https://api.play.ai/tts", { text, voice: "fr-FR" }, { headers: { "Authorization": `Bearer ${PLAYAI_TTS_KEY}` }, responseType: "arraybuffer" });
      return res.data;
    } else {
      const url = googleTTS.getAudioUrl(text, { lang, slow: false, host: "https://translate.google.com" });
      const res = await axios.get(url, { responseType: "arraybuffer" });
      return res.data;
    }
  } catch (err) { log("⚠️ TTS error: " + err.message); throw err; }
}

// AI Text avec fallback
async function generateText(prompt) {
  const models = ["llama-3.1-8b-instant", "meta-llama/llama-guard-4-12b", "groq/compound-mini"];
  for (const model of models) {
    try {
      log(`🧠 Generating with model: ${model}`);
      const response = await groqClient.chat.completions.create({ model, messages: [{ role: "user", content: prompt }] });
      return response.choices[0].message.content;
    } catch { log(`⚠️ Model ${model} failed, trying next...`); }
  }
  throw new Error("All AI models failed");
}

// Transcription fallback
async function transcribeAudio(filePath) {
  const models = ["whisper-large-v3-turbo", "whisper-large-v3"];
  for (const model of models) {
    try {
      log(`🎤 Transcribing with: ${model}`);
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));
      form.append("model", model);
      const res = await axiosClient.post("https://api.openai.com/v1/audio/transcriptions", form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
      return res.data.text;
    } catch { log(`⚠️ Transcription ${model} failed, trying next...`); }
  }
  throw new Error("All transcription models failed");
}

// Express
const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/output", express.static(OUTPUT_DIR));
app.use("/uploads", express.static(UPLOAD_DIR));

// Routes
app.post("/generate-short", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt manquant" });

  try {
    const text = await limit(() => generateText(prompt));
    const audioBuffer = await limit(() => generateTTS(text));
    const audioPath = genFilePath("tts", "mp3");
    await safeWriteFile(audioPath, audioBuffer);
    res.json({ text, audioPath });
  } catch (err) { log("❌ Error /generate-short: " + err.message); res.status(500).json({ error: err.message }); }
});

app.post("/transcribe", async (req, res) => {
  const { filePath } = req.body;
  if (!filePath || !fs.existsSync(filePath)) return res.status(400).json({ error: "Fichier manquant ou inexistant" });

  try {
    const transcription = await limit(() => transcribeAudio(filePath));
    res.json({ transcription });
  } catch (err) { log("❌ Error /transcribe: " + err.message); res.status(500).json({ error: err.message }); }
});

// Server
app.listen(PORT, () => log(`🚀 Serveur ultra-stable Render-ready sur port ${PORT}`));
