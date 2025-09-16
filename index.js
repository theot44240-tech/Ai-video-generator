import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Pour servir index.html, style.css et script.js

// Initialisation de l'API OpenAI avec la clé stockée sur Render
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route API
app.post("/api/ask", async (req, res) => {
  try {
    const question = req.body.question;

    if (!question) {
      return res.status(400).json({ error: "❌ Aucune question fournie" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // ou "gpt-4" si tu as accès
      messages: [{ role: "user", content: question }],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Erreur API OpenAI :", error);
    res.status(500).json({ error: "⚠️ Erreur lors de l'appel à l'API OpenAI" });
  }
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
