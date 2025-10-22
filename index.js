import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { exec } from "child_process";
import { generateScript } from "./groq.js"; // ton module Groq
import { generateTTS } from "./tts.js"; // ton module TTS
import { createVideo } from "./video.js"; // ton module pour assembler le short

dotenv.config();
const app = express();
const port = process.env.PORT || 3000; // Render fournit PORT
app.listen(port, () => console.log(`⚡ Server running on port ${port}`));
app.use(bodyParser.json());

// === Page d'accueil ===
app.get("/", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>AI Shorts Generator</title>
    </head>
    <body style="font-family:sans-serif;text-align:center;padding:50px;">
      <h1>AI Shorts Generator</h1>
      <textarea id="prompt" placeholder="Écris ton texte..." rows="5" cols="40"></textarea><br><br>
      <button id="generateBtn">Générer Short</button>
      <p id="status"></p>
      <script>
        const btn = document.getElementById("generateBtn");
        btn.addEventListener("click", async () => {
          const prompt = document.getElementById("prompt").value;
          if(!prompt) return alert("Écris quelque chose !");
          document.getElementById("status").innerText = "⏳ Génération en cours...";
          try {
            const res = await fetch("/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if(data.url){
              document.getElementById("status").innerHTML = '✅ Short prêt : <a href="'+data.url+'" target="_blank">Voir ici</a>';
            } else {
              document.getElementById("status").innerText = "❌ Erreur lors de la génération";
            }
          } catch(err) {
            document.getElementById("status").innerText = "❌ Erreur : " + err.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// === Génération short vidéo ===
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  if(!prompt) return res.status(400).json({ error: "Pas de texte fourni !" });

  try {
    // 1️⃣ Générer le script via Groq
    const script = await generateScript(prompt);

    // 2️⃣ Générer la voix TTS
    const audioFile = `./output/${uuidv4()}.mp3`;
    await generateTTS(script, audioFile);

    // 3️⃣ Créer la vidéo short
    const videoFile = `./output/${uuidv4()}.mp4`;
    await createVideo(audioFile, videoFile);

    // 4️⃣ Retourner le lien vers la vidéo
    const videoUrl = `/output/${path.basename(videoFile)}`;
    res.json({ url: videoUrl });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// === Servir les vidéos ===
app.use("/output", express.static(path.join(process.cwd(), "output")));

// === Lancer serveur ===
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator running on port ${PORT}`);
});
