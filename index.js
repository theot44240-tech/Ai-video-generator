#!/usr/bin/env node
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { exec } from "child_process";
import pLimit from "p-limit";
import cors from "cors";
import colors from "colors/safe";
import morgan from "morgan";

dotenv.config();

const PORT = process.env.PORT || 3000;
const PLAYAI_TTS_KEY = process.env.PLAYAI_TTS_KEY || null;
const UPLOADS_DIR = "./uploads";
const OUTPUT_DIR = "./output";
const LOGS_DIR = "./logs";

[UPLOADS_DIR, OUTPUT_DIR, LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(morgan("dev"));

const log = (...args) => console.log(colors.cyan("[AI Generator]"), ...args);
const errorLog = (...args) => console.error(colors.red("[AI Generator]"), ...args);

// Queue async tasks
const asyncQueue = pLimit(3);

// ======== LLM SCRIPT GENERATION ========
async function generateScript(prompt) {
  log(colors.yellow("💡 Generating script..."));
  try {
    // Placeholder: real Groq / LLaMA / GPT integration
    return `Generated script for: "${prompt}"`;
  } catch (err) {
    errorLog("LLM fallback used:", err);
    return `Fallback script for: "${prompt}"`;
  }
}

// ======== TTS HANDLER ========
async function generateTTS(text, filename) {
  const outPath = path.join(OUTPUT_DIR, filename);
  return new Promise((resolve, reject) => {
    const ttsCommand = PLAYAI_TTS_KEY
      ? `python3 -m playai_tts --key ${PLAYAI_TTS_KEY} --text "${text}" --output "${outPath}"`
      : `python3 -m gtts-cli "${text}" --output "${outPath}"`;

    exec(ttsCommand, (err) => {
      if (err) return reject(err);
      log(colors.green(`✅ TTS generated: ${filename}`));
      resolve(outPath);
    });
  });
}

// ======== VIDEO HANDLER ========
async function generateVideo(ttsPath, videoName) {
  const outVideo = path.join(OUTPUT_DIR, videoName);
  fs.copyFileSync(ttsPath, outVideo); // placeholder for real video composition
  log(colors.green(`🎬 Video generated: ${videoName}`));
  return outVideo;
}

// ======== API ROUTES ========
app.get("/status", (req, res) => res.json({ status: "ok", timestamp: Date.now() }));

app.post("/short", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const script = await generateScript(prompt);
    const ttsPath = await asyncQueue(() => generateTTS(script, `${Date.now()}_tts.mp3`));
    const videoPath = await asyncQueue(() => generateVideo(ttsPath, `${Date.now()}_video.mp4`));
    res.json({ message: "Short generated successfully", video: videoPath });
  } catch (err) {
    errorLog(err);
    res.status(500).json({ error: "Failed to generate short" });
  }
});

app.post("/upload", async (req, res) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) return res.status(400).json({ error: "Missing filename or base64 data" });

  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  log(colors.green(`📁 File uploaded: ${filename}`));
  res.json({ message: "File uploaded successfully", path: filePath });
});

// ======== START SERVER ========
app.listen(PORT, () => log(colors.green(`🚀 AI Shorts Generator running on port ${PORT}`)));
