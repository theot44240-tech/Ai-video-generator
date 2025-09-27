// ==========================================
// AI Shorts Generator – script.js
// Optimisé top 0,1% pour distilgpt2
// Compatible Render & GitHub
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("promptForm");
  const input = document.getElementById("promptInput");
  const resultContainer = document.getElementById("result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prompt = input.value.trim();
    if (!prompt) {
      resultContainer.textContent = "⚠️ Veuillez entrer un prompt !";
      return;
    }

    resultContainer.textContent = "⏳ Génération en cours...";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        resultContainer.textContent = `❌ Erreur API : ${data.error}`;
      } else {
        resultContainer.textContent = data.generated_text || "⚠️ Aucun résultat généré.";
      }
    } catch (error) {
      console.error(error);
      resultContainer.textContent = `❌ Erreur API : ${error.message}`;
    }
  });
});
