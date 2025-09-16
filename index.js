import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public")); // sert ton index.html et script.js

// API route pour discuter avec OpenAI
app.post("/api/chat", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Pas de question envoyée" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      res.json({ answer: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "Aucune réponse reçue d'OpenAI." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
