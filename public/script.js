// script.js – AI Shorts Generator 🚀
// Optimisé top 0,1% – Compatible GPT-2

document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("prompt");
  const generateBtn = document.getElementById("generateBtn");
  const resultArea = document.getElementById("result");

  // Fonction pour appeler l'API backend
  async function generateShort() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert("Veuillez écrire un prompt avant de générer.");
      return;
    }

    resultArea.textContent = "⏳ Génération en cours...";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.statusText}`);
      }

      const data = await response.json();
      resultArea.textContent = data.result || "❌ Aucun résultat généré.";
    } catch (error) {
      console.error("Erreur API :", error);
      resultArea.textContent = `❌ Erreur API : ${error.message}`;
    }
  }

  generateBtn.addEventListener("click", generateShort);

  // Optionnel : générer avec Ctrl+Enter
  promptInput.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      generateShort();
    }
  });
});
