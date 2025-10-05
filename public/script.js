// script.js – AI Shorts Generator
// Top 0,1% optimisation pour Codespaces / Render

document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("prompt");
  const generateBtn = document.getElementById("generateBtn");
  const resultDisplay = document.getElementById("result");

  generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert("Veuillez entrer un prompt !");
      return;
    }

    resultDisplay.textContent = "⏳ Génération en cours...";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`Erreur API : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      resultDisplay.textContent = data.result || "❌ Pas de résultat.";
    } catch (err) {
      console.error(err);
      resultDisplay.textContent = `❌ Erreur API : ${err.message}`;
    }
  });
});
