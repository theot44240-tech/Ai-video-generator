/**
 * AI Shorts Generator — Backend
 * Version finale optimisée pour Render / Node.js 18+
 * Auteur : theot44240-tech
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const multer = require("multer");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

// --- Configuration de base ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Dossier d'uploads ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// --- Configuration Multer (upload vidéo ou audio) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});
const upload = multer({ storage });

// --- Route de test ---
app.get("/", (req, res) => {
  res.send("🚀 AI Shorts Generator API is running successfully on Render!");
});

// --- Route principale : génération de short IA ---
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt text." });

    // Appel vers Hugging Face API (texte -> script)
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN)
      return res.status(500).json({ error: "Missing Hugging Face API token." });

    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Create a viral short script between 20 and 70 seconds about: ${prompt}`,
        parameters: {
          max_new_tokens: 180,
          temperature: 0.9,
          top_p: 0.95,
        },
      }),
    });

    const result = await response.json();
    if (!result || result.error) {
      console.error("Hugging Face error:", result);
      return res.status(500).json({ error: "Error generating text." });
    }

    // Récupère le texte généré
    const generatedText =
      Array.isArray(result) && result[0]?.generated_text
        ? result[0].generated_text
        : JSON.stringify(result);

    // Réponse JSON finale
    res.json({
      status: "success",
      message: "AI short generated successfully.",
      prompt,
      script: generatedText,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Exemple de route d’upload vidéo (facultatif) ---
app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  res.json({
    status: "success",
    fileName: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

// --- Servir les fichiers uploadés ---
app.use("/uploads", express.static(uploadDir));

// --- Démarrage du serveur ---
app.listen(PORT, () => {
  console.log(`✅ AI Shorts Generator running on port ${PORT}`);
});
