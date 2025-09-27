// =========================================
// AI Shorts Generator – script.js
// Top 0,1% optimisation pour Render / GitHub
// Compatible avec tiiuae/falcon-7b-instruct
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("promptInput");
  const generateBtn = document.getElementById("generateBtn");
  const resultDiv = document.getElementById("result");

  const API_URL = "/api/generate"; // Endpoint Node.js

  // Fonction pour afficher le résultat
  const displayResult = (text) => {
    resultDiv.textContent = text;
  };

  // Fonction pour gérer les erreurs
  const handleError = (err) => {
    console.error("Erreur:", err);
    resultDiv.textContent = "❌ Une erreur est survenue. Veuillez réessayer.";
  };

  // Fonction pour générer le short via backend
  const generateShort = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      displayResult("⚠️ Veuillez écrire une question ou un prompt.");
      return;
    }

    displayResult("⏳ Génération en cours...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      if (data.text) {
        displayResult(data.text);
      } else {
        displayResult("⚠️ Aucun résultat reçu. Veuillez réessayer.");
      }
    } catch (err) {
      handleError(err);
    }
  };

  // Événement click sur le bouton
  generateBtn.addEventListener("click", generateShort);

  // Événement Enter dans textarea
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateShort();
    }
  });
});
