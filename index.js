<<<<<<< HEAD
/**
 * AI Shorts Generator — Backend
 * Version finale optimisée pour Render / Node.js
 * Auteur : theot44240-tech
 */

const express = require("express");
const dotenv = require("dotenv");

dotenv.config(); // Charge .env si présent

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.static("public")); // Sert index.html, script.js, style.css
app.use(express.json()); // Parse JSON des requêtes POST

// Endpoint pour générer un short
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ status: "error", message: "Prompt manquant" });
    }

    // Génération du script (à remplacer par AI réel si besoin)
    const script = `🎬 Script généré pour le prompt : "${prompt}"`;

    res.json({ status: "success", prompt, script });

  } catch (err) {
    console.error("Erreur dans /generate :", err);
    res.status(500).json({ status: "error", message: err.message });
=======
import 'dotenv/config';
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";

// --- CONFIG CLIENTS ---
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api/groq.com/openai/v1",
});

const TTS_KEY = process.env.PLAYAI_TTS_KEY;
const OUTPUT_DIR = "./output";
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// --- PROMPTS SHORTS ---
const prompts = [
  "Écris un script de 25 à 35 secondes sur la productivité pour un Short YouTube",
  "Écris un script de 25 à 35 secondes sur la concentration pour un Short YouTube",
  "Écris un script de 25 à 35 secondes sur la motivation pour un Short YouTube"
];

// --- GENERER TEXTE AVEC GROQ ---
async function genererShort(prompt) {
  try {
    const response = await groqClient.responses.create({
      model: "openai/gpt-oss-20b",
      input: prompt,
    });
    return response.output_text;
  } catch (err) {
    console.error("Erreur API Groq :", err.response ? err.response.data : err.message);
    return null;
>>>>>>> 878907c (Add TTS fallback system (PlayAI -> GoogleTTS))
  }
}

<<<<<<< HEAD
// Endpoint pour vérifier si l'API fonctionne
app.get("/status", (req, res) => {
  res.json({ status: "ok", message: "AI Shorts Generator API fonctionne !" });
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator API is running successfully on port ${PORT}!`);
});
=======
// --- GENERER AUDIO TTS AVEC PLAYAI ---
async function genererTTS(text, filename) {
  try {
    const response = await axios.post(
      "https://api.play.ai/v1/tts", // endpoint officiel PlayAI à vérifier
      { text: text },
      {
        headers: { "Authorization": `Bearer ${TTS_KEY}` },
        responseType: 'arraybuffer'  // récupère le fichier audio binaire
      }
    );

    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(response.data));
    console.log(`✅ Audio généré : ${filePath}`);
  } catch (err) {
    console.error("❌ Erreur TTS :", err.response ? err.response.data : err.message);
  }
}

// --- PIPELINE COMPLET ---
async function runPipeline() {
  console.log("🚀 Début du pipeline AI Shorts...");

  for (let i = 0; i < prompts.length; i++) {
    console.log(`\n=== Génération Short ${i + 1} ===`);

    // Génération texte
    const texte = await genererShort(prompts[i]);
    if (!texte) {
      console.warn(`⚠️ Short ${i + 1} ignoré (texte non généré)`);
      continue;
    }
    console.log("Texte généré :", texte);

    // Génération TTS
    await genererTTS(texte, `short_${i+1}.mp3`);
  }

  console.log("\n🎯 Pipeline terminé !");
}

// --- LANCEMENT ---
runPipeline();
>>>>>>> 878907c (Add TTS fallback system (PlayAI -> GoogleTTS))
