// server.js — AI Shorts Generator (PRODUCTION VERSION)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// === MODULES INTERNES ===
import { generateGroqResponse } from "./groq.js";
import { generateTTS } from "./tts.js";
import { createVideo } from "./video.js";

// === CONFIG DE BASE ===
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === MIDDLEWARES ===
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// === HEALTH CHECK ===
app.get("/", (req, res) => {
  res.send("🚀 AI Shorts Generator backend is running perfectly ✅");
});

// ======================================================
// 🧠 GROQ: Génération de script (texte)
// ======================================================
app.post("/api/groq", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    console.log("🧠 GROQ prompt reçu:", prompt);

    const groqResponse = await generateGroqResponse(prompt);
    if (!groqResponse) throw new Error("GROQ failed to generate content");

    res.json({ success: true, text: groqResponse });
  } catch (error) {
    console.error("❌ Erreur /api/groq:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================================================
// 🔊 TTS: Génération de voix à partir du script
// ======================================================
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    console.log("🎤 TTS texte reçu:", text.slice(0, 60) + "...");

    const audioUrl = await generateTTS(text, voice);
    if (!audioUrl) throw new Error("TTS generation failed");

    res.json({ success: true, audioUrl });
  } catch (error) {
    console.error("❌ Erreur /api/tts:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================================================
// 🎬 VIDEO: Création du short final (vidéo + son)
// ======================================================
app.post("/api/video", async (req, res) => {
  try {
    const { script, audioUrl, background, subtitles } = req.body;

    if (!script || !audioUrl)
      return res.status(400).json({ error: "Missing script or audio URL" });

    console.log("🎬 Création de la vidéo en cours...");
    const videoUrl = await createVideo(script, audioUrl, background, subtitles);

    res.json({ success: true, videoUrl });
  } catch (error) {
    console.error("❌ Erreur /api/video:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================================================
// 🧩 API STATUS CHECK
// ======================================================
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    node: process.version,
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime().toFixed(0) + "s",
  });
});

// ======================================================
// ⚙️ START SERVER
// ======================================================
app.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================");
  console.log("✅ AI Shorts Generator Server launched");
  console.log("🌍 Port:", PORT);
  console.log("🧠 GROQ Model: llama-3.1-8b-instant");
  console.log("🔊 TTS System: Play.ai → Google fallback");
  console.log("🎬 Video Engine: ffmpeg + fluent-ffmpeg");
  console.log("==========================================");
});
