import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { spawn } from "child_process";
import fetch from "node-fetch";
import OpenAI from "openai";
import FormData from "form-data";
import { google } from "googleapis";

dotenv.config();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.ensureDirSync(UPLOAD_DIR);

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("tiny"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log(`🚀 AI Shorts FULL AUTO server starting on port ${PORT}`);

// Helper pour commandes
const runCommand = (cmd, args) =>
  new Promise((resolve, reject) => {
    const process = spawn(cmd, args, { stdio: "inherit" });
    process.on("close", code => (code === 0 ? resolve() : reject(`Exit code ${code}`)));
  });

// --- TTS PlayHT -> Google TTS fallback ---
const generateTTS = async (text, outputPath) => {
  try {
    const res = await fetch("https://play.ht/api/v1/convert", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PLAYHT_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voice: "en_us_male", content: text }),
    });
    const data = await res.json();
    const audioUrl = data?.audioUrl || data?.url;
    if (!audioUrl) throw new Error("PlayHT did not return audio URL");
    const audioRes = await fetch(audioUrl);
    const buffer = await audioRes.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
  } catch (err) {
    console.warn("⚠️ PlayHT failed, fallback Google TTS", err);
    const { execSync } = await import("child_process");
    execSync(`gtts-cli "${text}" --output "${outputPath}"`);
  }
};

// --- Générer image via Groq ---
const generateImage = async (prompt, outputPath) => {
  const res = await fetch("https://api.groq.ai/v1/images", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  const imageBuffer = Buffer.from(data.image_base64, "base64");
  await fs.writeFile(outputPath, imageBuffer);
};

// --- Whisper transcription ---
const transcribeAudio = async (audioPath) => {
  const fileStream = fs.createReadStream(audioPath);
  const response = await openai.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-1"
  });
  return response.text;
};

// --- Générer vidéo avec FFmpeg ---
const generateVideo = async ({ text, audioPath, videoPath }) => {
  const imgPath = path.join(UPLOAD_DIR, `${uuidv4()}.png`);
  await generateImage(text, imgPath);
  await runCommand("ffmpeg", [
    "-loop", "1",
    "-i", imgPath,
    "-i", audioPath,
    "-c:v", "libx264",
    "-tune", "stillimage",
    "-c:a", "aac",
    "-b:a", "192k",
    "-pix_fmt", "yuv420p",
    "-shortest",
    videoPath
  ]);
};

// --- Upload YouTube ---
const uploadYouTube = async (videoPath, title) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    process.env.YT_REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: { title, description: "AI Short generated automatically", tags: ["AI", "Shorts"] },
      status: { privacyStatus: "public" },
    },
    media: { body: fs.createReadStream(videoPath) },
  });
  return res.data.id;
};

// --- Upload TikTok (placeholder, car vrai API privée) ---
const uploadTikTok = async (videoPath) => {
  console.log("🎬 Video ready for TikTok upload:", videoPath);
};

// --- Queue simple ---
const queue = [];
let processing = false;
const processQueue = async () => {
  if (processing || queue.length === 0) return;
  processing = true;
  const { prompt, res } = queue.shift();
  try {
    const id = uuidv4();
    const audioPath = path.join(UPLOAD_DIR, `${id}.mp3`);
    const videoPath = path.join(UPLOAD_DIR, `${id}.mp4`);

    await generateTTS(prompt, audioPath);
    await generateVideo({ text: prompt, audioPath, videoPath });

    const ytId = await uploadYouTube(videoPath, prompt);
    await uploadTikTok(videoPath);

    res.json({ videoId: id, ytId, videoPath });
  } catch (err) {
    console.error("🔥 Error processing queue:", err);
    res.status(500).json({ error: err.toString() });
  }
  processing = false;
  processQueue();
};

// --- Endpoint full auto ---
app.post("/generate", (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });
  queue.push({ prompt, res });
  processQueue();
});

// Static
app.use("/uploads", express.static(UPLOAD_DIR));

// Start
app.listen(PORT, () => console.log(`✅ FULL AUTO AI Shorts server running on port ${PORT}`));
