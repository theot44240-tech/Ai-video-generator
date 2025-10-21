/**
 * 🚀 AI Shorts Generator — Version Render Ultra-Stable
 * - IA Texte : llama-3.1-8b-instant → meta-llama/llama-guard-4-12b → groq/compound-mini
 * - Voix : PlayAI → Google TTS fallback
 * - Transcription : whisper-large-v3-turbo → whisper-large-v3
 * - CORS + Logs pour Render
 */

import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import googleTTS from "google-tts-api";
import cors from "cors"; // ✅ indispensable pour Render

dotenv.config();

// -------------------- CONFIG --------------------
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = process.env.OUTPUT_DIR || "./output";
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const PLAYAI_TTS_KEY = process.env.PLAYAI_TTS_KEY || "";
const REQUEST_TIMEOUT_MS = 60_000;

if (!GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY manquant dans .env !");
}

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

// -------------------- MODÈLES --------------------
const TEXT_MODELS = [
  "llama-3.1-8b-instant",
  "meta-llama/llama-guard-4-12b",
  "groq/compound-mini",
];

const TTS_PLAYAI_MODELS = {
  default: "playai-tts",
  arabic: "playai-tts-arabic",
};

const TRANSCRIBE_MODELS = ["whisper-large-v3-turbo", "whisper-large-v3"];

const MAX_RETRIES = 4;
const RETRY_BACKOFF = (i) => 1000 + i * 1500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isArabic = (txt) => /[\u0600-\u06FF\u0750-\u077F]/.test(txt);

// -------------------- HELPERS --------------------
async function callGroqResponse({ model, input, timeoutMs = REQUEST_TIMEOUT_MS }) {
  const p = groqClient.responses.create({ model, input });
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), timeoutMs));
  return Promise.race([p, timeout]);
}

// -------------------- TEXTE --------------------
async function generateText(prompt) {
  if (!prompt?.trim()) throw new Error("Prompt vide");

  for (const model of TEXT_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🟢 [Text] Tentative ${attempt}/${MAX_RETRIES} avec ${model}`);
        const res = await callGroqResponse({ model, input: prompt });
        const out =
          res?.output_text ?? (res?.output?.map((o) => o.content || "").join(" ") || "");
        if (out?.trim()) {
          console.log(`✅ [Text] Succès avec ${model}`);
          return { model, text: out.trim() };
        }
        throw new Error("Réponse vide");
      } catch (err) {
        console.warn(`❌ [Text] ${model} échoué (${attempt}) : ${err.message}`);
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_BACKOFF(attempt);
          console.log(`⏳ retry dans ${delay}ms...`);
          await sleep(delay);
        }
      }
    }
    console.log(`🔁 fallback vers le modèle suivant...`);
  }
  throw new Error("Aucun modèle texte n’a réussi");
}

// -------------------- TTS --------------------
async function ttsPlayAI(text, filename, modelName) {
  if (!PLAYAI_TTS_KEY) throw new Error("PLAYAI_TTS_KEY manquant");
  const url = "https://api.play.ai/v1/tts";
  const resp = await axiosDefaults.post(
    url,
    { text, model: modelName },
    {
      headers: { Authorization: `Bearer ${PLAYAI_TTS_KEY}`, "Content-Type": "application/json" },
      responseType: "arraybuffer",
    }
  );
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(resp.data));
  console.log(`✅ [TTS] Audio PlayAI sauvegardé → ${filePath}`);
  return filePath;
}

async function ttsGoogle(text, filename, lang = "fr") {
  const url = googleTTS.getAudioUrl(text, { lang, slow: false });
  const resp = await axiosDefaults.get(url, { responseType: "arraybuffer" });
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(resp.data));
  console.log(`✅ [TTS] Audio Google sauvegardé → ${filePath}`);
  return filePath;
}

async function generateTTSWithFallback(text, filename) {
  const isAr = isArabic(text);
  const playModel = isAr ? TTS_PLAYAI_MODELS.arabic : TTS_PLAYAI_MODELS.default;
  if (PLAYAI_TTS_KEY) {
    try {
      return await ttsPlayAI(text, filename, playModel);
    } catch (err) {
      console.warn(`⚠️ PlayAI échoué → fallback Google : ${err.message}`);
    }
  }
  return await ttsGoogle(text, filename, isAr ? "ar" : "fr");
}

// -------------------- TRANSCRIPTION --------------------
async function transcribeWithFallback(filepath) {
  for (let model of TRANSCRIBE_MODELS) {
    try {
      console.log(`🟢 [Transcribe] essai modèle ${model}`);
      const url = "https://api.groq.com/openai/v1/audio/transcriptions";
      const form = new FormData();
      form.append("file", fs.createReadStream(filepath));
      form.append("model", model);
      const resp = await axios.post(url, form, {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${GROQ_API_KEY}` },
        timeout: REQUEST_TIMEOUT_MS,
      });
      return resp.data?.text || resp.data?.transcript || resp.data?.output_text || "";
    } catch (err) {
      console.warn(`❌ [Transcribe] ${model} : ${err.message}`);
    }
  }
  throw new Error("Transcription échouée sur tous les modèles");
}

// -------------------- EXPRESS APP --------------------
const app = express();
app.use(cors()); // ✅ autorise frontend Render
app.use(express.json());
app.use(express.static("public"));

// STATUS
app.get("/status", (_, res) => res.json({ status: "ok", message: "AI Shorts Generator prêt 🚀" }));

// GENERATE
app.post("/generate", async (req, res) => {
  const prompt = (req.body?.prompt || "").toString().trim();
  console.log(`📩 /generate appelé avec prompt : "${prompt}"`);

  if (!prompt) return res.status(400).json({ error: "Prompt manquant" });

  try {
    const { model, text } = await generateText(prompt);
    const filename = `short_${Date.now()}.mp3`;
    const audioFile = await generateTTSWithFallback(text, filename);
    return res.json({ prompt, modelUsed: model, texte: text, audioFile });
  } catch (err) {
    console.error("❌ [Generate] Erreur :", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// TTS direct
app.post("/tts", async (req, res) => {
  const text = (req.body?.text || "").toString().trim();
  if (!text) return res.status(400).json({ error: "Text manquant" });
  const filename = `tts_${Date.now()}.mp3`;
  try {
    const audioFile = await generateTTSWithFallback(text, filename);
    return res.json({ text, audioFile });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------- START --------------------
app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne : http://localhost:${PORT}`);
  console.log(`⚙️ Dossier output : ${path.resolve(OUTPUT_DIR)}`);
});
