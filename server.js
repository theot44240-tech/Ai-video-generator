// server.js — AI Shorts Generator Backend
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix ESModule __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// === ROUTES PRINCIPALES ===

// Check si le serveur tourne
app.get("/", (req, res) => {
  res.send("🚀 AI Shorts Generator server is running successfully!");
});

// API GROQ (texte / prompt)
app.post("/api/groq", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in /api/groq:", err);
    res.status(500).json({ error: err.message });
  }
});

// API TTS (Google ou PlayHT)
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    // Simule le TTS (tu peux remplacer par ton vrai tts.js plus tard)
    res.json({ audioUrl: "https://example.com/audio.mp3", status: "ok" });
  } catch (err) {
    console.error("❌ Error in /api/tts:", err);
    res.status(500).json({ error: err.message });
  }
});

// API VIDEO
app.post("/api/video", async (req, res) => {
  try {
    const { script, audioUrl } = req.body;
    if (!script || !audioUrl) return res.status(400).json({ error: "Missing script or audio" });

    // Simule la création vidéo (tu relieras ton vrai video.js ici)
    res.json({ videoUrl: "https://example.com/video.mp4", status: "rendering" });
  } catch (err) {
    console.error("❌ Error in /api/video:", err);
    res.status(500).json({ error: err.message });
  }
});

// === LANCEMENT DU SERVEUR ===
app.listen(PORT, () => {
  console.log(`✅ AI Shorts Generator server running on port ${PORT}`);
  console.log("🌐 Environment loaded:", Object.keys(process.env));
});
