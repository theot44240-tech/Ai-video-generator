import express from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import { execSync } from "child_process";
import os from "os";

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "production";

const log = (msg, level = "info") => {
  const colors = { info: "cyan", success: "green", warn: "yellow", error: "red" };
  console.log(chalk[colors[level]](`[${new Date().toISOString()}] ${msg}`));
};

// --- GPU Check ---
const checkGPU = () => {
  try {
    const info = execSync("nvidia-smi", { stdio: "pipe" }).toString();
    log("💻 GPU detected:\n" + info.split("\n")[0], "success");
  } catch {
    log("⚠️ No GPU detected — using CPU fallback", "warn");
  }
};

// --- System Monitoring ---
const monitorResources = () => {
  setInterval(() => {
    const load = os.loadavg()[0].toFixed(2);
    const memUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
    log(`📊 Load: ${load} | RAM: ${memUsed} GB`, "info");
  }, 15000);
};

// --- AI Placeholders ---
const loadModels = async () => {
  log("🤖 Loading AI models...", "info");
  // TODO: integrate LLaMA, Groq, Whisper, etc.
  await new Promise((r) => setTimeout(r, 500));
  log("✅ AI models ready", "success");
};

// --- Server ---
const startServer = async () => {
  const app = express();
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("🚀 AI Shorts Generator — Top 0.1% Edition");
  });

  const server = app.listen(PORT, () => {
    log(`🌟 Server running on port ${PORT} [${NODE_ENV}]`, "success");
  });

  server.on("error", (err) => log(`❌ Server error: ${err}`, "error"));

  monitorResources();
  await loadModels();
  checkGPU();
};

startServer();
