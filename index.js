const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ status: "error", message: "Prompt manquant" });
    }

    const script = `🎬 Script généré pour le prompt : "${prompt}"`;
    res.json({ status: "success", prompt, script });
  } catch (err) {
    console.error("Erreur dans /generate :", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/status", (req, res) => {
  res.json({ status: "ok", message: "AI Shorts Generator API fonctionne !" });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Shorts Generator API is running successfully on port ${PORT}!`);
});
