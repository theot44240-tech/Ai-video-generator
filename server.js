// server.js — Version pro & déploiement-ready

import express from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import os from "os";
import { execSync } from "child_process";

dotenv.config();

// ===== CONFIG =====
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "production";

const log = (msg, level = "info") => {
  const colors = { info: "cyan", success: "green", warn: "yellow", error: "red" };
  console.log(chalk[colors[level]](`[${new Date().toISOString()}] ${msg}`));
};

// ===== SYSTEM CHECKS =====
const checkGPU = () => {
  try {
    execSync("nvidia-smi", { stdio: "pipe" });
    log("💻 GPU detected and accessible.", "success");
  } catch {
    log("⚠️ No GPU detected, CPU mode active.", "warn");
  }
};

// Display system load
const monitorSystem = () => {
  setInterval(() => {
    const load = os.loadavg()[0].toFixed(2);
    const used = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
    log(`📊 Load: ${load} | RAM used: ${used} GB`, "info");
  }, 20000);
};

// ===== EXPRESS SERVER =====
const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🚀 AI Shorts Generator — Ultimate Level 999999999 is running");
});

// ===== START SERVER =====
const startServer = async () => {
  try {
    checkGPU();
    monitorSystem();

    app.listen(PORT, "0.0.0.0", () => {
      log(`🌍 Server listening on port ${PORT}`, "success");
      log(`🌦 Environment: ${NODE_ENV}`, "info");
    });
  } catch (err) {
    log(`❌ Server startup error: ${err.message}`, "error");
    process.exit(1);
  }
};

startServer();
