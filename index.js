/**
 * 🚀 AI Shorts Generator — Render Ultra-Stable
 * - Texte : llama-3.1-8b-instant → meta-llama/llama-guard-4-12b → groq/compound-mini
 * - Voix : PlayAI → Google TTS fallback
 * - Transcription : whisper-large-v3-turbo → whisper-large-v3
 * - Compatible Render avec CORS
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

dotenv.config();

// -------------------- CONFIG --------------------
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = process.env.OUTPUT_DIR || "./output";
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const PLAYAI_TTS_KEY = process.env.PLAYAI_TTS_KEY || "";
const REQUEST_TIMEOUT_MS = 60_000;

if (!GROQ_API_KEY) console.warn("⚠️ GROQ_API_KEY manquant dans .env !");

// -------------------- CLIENTS --------------------
const groqClient = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const axiosDefaults = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// -------------------- HELPERS --------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isArabic(text) {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
}

async function callGroqResponse({ model, input, timeoutMs = REQUEST_TIMEOUT_MS }) {
  const p = groqClient.responses.create({ model, input });
  const timeout = new Promise((_, rej) =>
    setTimeout(() => rej(new Error("Timeout")), timeoutMs)
  );
  return Promise.race([p, timeout]);
}

// -------------------- TEXT GENERATION --------------------
const TEXT_MODELS = [
  "llama-3.1-8b-instant",
  "meta-llama/llama-guard-4-12b",
  "groq/compound-mini",
];
const MAX_RETRIES = 4;
const RETRY_BACKOFF = (attempt) => 1000 + attempt * 1500;

async function generateText(prompt) {
  if (!prompt.trim()) throw new Error("Prompt vide");

  for (const model of TEXT_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🟢 [Text] Tentative ${attempt}/${MAX_RETRIES} avec ${model}`);
        const res = await callGroqResponse({ model, input: prompt });
        const out = res?.output_text ?? (res?.output?.map(o => o.content || "").join(" ") || "");
        if (out && out.trim()) return { model, text: out.trim() };
        throw new Error("Réponse vide");
      } catch (err) {
        console.warn(`❌ [Text] Erreur (${model}) attempt ${attempt}: ${err.message}`);
        if (attempt < MAX_RETRIES) await sleep(RETRY_BACKOFF(attempt));
      }
    }
  }
  throw new Error("Abandon après trop d'échecs sur les modèles de texte");
}

// -------------------- TTS --------------------
const TTS_PLAYAI_MODELS = { default: "playai-tts", arabic: "playai-tts-arabic" };

async function ttsPlayAI(text, filename, modelName = TTS_PLAYAI_MODELS.default) {
  if (!PLAYAI_TTS_KEY) throw new Error("PLAYAI_TTS_KEY manquant");
  const url = "https://api.play.ai/v1/tts";
  const resp = await axiosDefaults.post(url, { text, model: modelName }, {
    headers: { Authorization: `Bearer ${PLAYAI_TTS_KEY}`, "Content-Type": "application/json" },
    responseType: "arraybuffer",
  });
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(resp.data));
  console.log(`✅ [TTS] PlayAI audio saved: ${filePath}`);
  return filePath;
}

async function ttsGoogle(text, filename, lang = "fr") {
  const url = googleTTS.getAudioUrl(text, { lang, slow: false, host: "https://translate.google.com" });
  const resp = await axiosDefaults.get(url, { responseType: "arraybuffer" });
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(resp.data));
  console.log(`✅ [TTS] Google audio saved: ${filePath}`);
  return filePath;
}

async function generateTTSWithFallback(text, filename) {
  const playModel = isArabic(text) ? TTS_PLAYAI_MODELS.arabic : TTS_PLAYAI_MODELS.default;
  if (PLAYAI_TTS_KEY) {
    try { return await ttsPlayAI(text, filename, playModel); }
    catch (err) { console.warn(`⚠️ PlayAI échoué, fallback Google TTS: ${err.message}`); }
  }
  const lang = isArabic(text) ? "ar" : "fr";
  return await ttsGoogle(text, filename, lang);
}

// -------------------- EXPRESS APP --------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// STATUS
app.get("/status", (req, res) => res.json({ status: "ok", message: "AI Shorts Generator opérationnel" }));

// POST /generate
app.post("/generate", async (req, res) => {
  const prompt = (req.body?.prompt || "").toString().trim();
  if (!prompt) return res.status(400).json({ error: "Prompt manquant" });

  try {
    const { model, text } = await generateText(prompt);
    const filename = `short_${Date.now()}.mp3`;
    let audioFile = null;
    try { audioFile = await generateTTSWithFallback(text, filename); }
    catch (ttsErr) { console.warn(`⚠️ TTS échoué: ${ttsErr.message}`); }
    return res.json({ prompt, modelUsed: model, texte: text, audioFile });
  } catch (err) {
    console.error("❌ [Generate] Erreur :", err.message);
    return res.status(500).json({ error: err.message || "Erreur interne" });
  }
});

// POST /tts
app.post("/tts", async (req, res) => {
  const text = (req.body?.text || "").toString().trim();
  if (!text) return res.status(400).json({ error: "Text missing" });
  const filename = `tts_${Date.now()}.mp3`;
  try {
    const audioFile = await generateTTSWithFallback(text, filename);
    return res.json({ text, audioFile });
  } catch (err) {
    console.error("❌ [TTS] Erreur :", err.message);
    return res.status(500).json({ error: err.message || "TTS failed" });
  }
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator listening at http://localhost:${PORT}`);
  console.log(`⚙️ Output directory: ${path.resolve(OUTPUT_DIR)}`);
});
