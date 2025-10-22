// server.js — AI Shorts Generator LEVEL 99999999
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// === INTERNAL MODULES ===
import { generateGroqResponse } from "./groq.js";
import { generateTTS } from "./tts.js";
import { createVideo } from "./video.js";

// === CONFIG ===
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

// ==========================
// HEALTH CHECKS
// ==========================
app.get("/", (req, res) => res.send("🚀 AI Shorts Generator backend running ✅"));

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    node: process.version,
    env: process.env.NODE_ENV || "development",
    uptime: process.uptime().toFixed(0) + "s",
  });
});

// ==========================
// GROQ: Script generation
// ==========================
app.post("/api/groq", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    console.log("🧠 GROQ prompt:", prompt);

    const groqResponse = await generateGroqResponse(prompt);
    if (!groqResponse) throw new Error("GROQ failed to generate content");

    res.json({ success: true, text: groqResponse });
  } catch (err) {
    console.error("❌ /api/groq error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// TTS: Text-to-speech
// ==========================
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });
    console.log("🎤 TTS request text:", text.slice(0, 60) + "...");

    const audioUrl = await generateTTS(text, voice);
    if (!audioUrl) throw new Error("TTS generation failed");

    res.json({ success: true, audioUrl });
  } catch (err) {
    console.error("❌ /api/tts error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// VIDEO: Create short
// ==========================
app.post("/api/video", async (req, res) => {
  try {
    const { script, audioUrl, background, subtitles } = req.body;
    if (!script || !audioUrl)
      return res.status(400).json({ error: "Missing script or audioUrl" });

    console.log("🎬 Creating video...");

    const videoUrl = await createVideo(script, audioUrl, background, subtitles);
    res.json({ success: true, videoUrl });
  } catch (err) {
    console.error("❌ /api/video error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================");
  console.log("✅ AI Shorts Generator Server LEVEL 99999999");
  console.log("🌍 Port:", PORT);
  console.log("🧠 GROQ: llama-3.1-8b-instant (or configured)");
  console.log("🔊 TTS System: Play.ai → Google fallback");
  console.log("🎬 Video Engine: ffmpeg + fluent-ffmpeg");
  console.log("==========================================");
});
