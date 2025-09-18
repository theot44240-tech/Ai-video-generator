import dotenv from "dotenv";
dotenv.config();
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`, // <-- ton token Hugging Face
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: message,
      }),
    });

    const data = await response.json();

    res.json({
      reply: data[0]?.generated_text || "Pas de réponse générée",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur Hugging Face" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Serveur démarré sur http://localhost:3000");
});
