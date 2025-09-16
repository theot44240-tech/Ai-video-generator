import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Sert les fichiers frontend (public/)
app.use(express.static(path.join(__dirname, "public")));

// API protégée par clé
app.get("/api/ask", (req, res) => {
  const userKey = req.query.key;
  if (userKey !== process.env.MY_SECRET_KEY) {
    return res.status(403).send("Accès refusé 🚫");
  }

  const question = req.query.q || "Aucune question posée";
  // 👉 Ici tu appelleras ton IA (OpenAI, etc.)
  res.send(`Réponse de l'IA à: "${question}"`);
});

app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
