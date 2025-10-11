const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.static("public")); // sert le front-end
app.use(express.json());           // parse le JSON

// Endpoint /generate
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ status: "error", message: "Prompt manquant" });
    }
    const script = `🎬 Script généré pour le prompt : "${prompt}"`;
    res.json({ status: "success", prompt, script });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Endpoint de test
app.get("/status", (req, res) => {
  res.json({ status: "ok", message: "AI Shorts Generator API fonctionne !" });
});

// Lancer serveur
app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator API is running successfully on port ${PORT}!`);
});
