import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pLimit from "p-limit";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folders check
const outputDir = path.join(__dirname, "output");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Async limiter for API requests
const limit = pLimit(5);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: Date.now() }));

// Upload endpoint
app.post("/upload", async (req, res) => {
    try {
        if (!req.body.data) return res.status(400).json({ error: "No data provided" });
        const fileId = uuidv4();
        const filePath = path.join(uploadsDir, `${fileId}.txt`);
        fs.writeFileSync(filePath, req.body.data);
        res.json({ status: "success", fileId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error" });
    }
});

// Example TTS endpoint
app.post("/tts", async (req, res) => {
    try {
        const text = req.body.text;
        if (!text) return res.status(400).json({ error: "Text missing" });

        const fileId = uuidv4();
        const outputPath = path.join(outputDir, `${fileId}.mp3`);

        const ttsCmd = process.env.PLAYAI_TTS_KEY
            ? `playai-tts-cli "${text}" "${outputPath}" --key ${process.env.PLAYAI_TTS_KEY}`
            : `gtts-cli "${text}" --output "${outputPath}"`;

        exec(ttsCmd, (err) => {
            if (err) return res.status(500).json({ error: "TTS error" });
            res.json({ status: "ok", file: outputPath });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 AI Shorts Generator running on port ${PORT}`);
});
