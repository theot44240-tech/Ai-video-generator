// ===============================================
// AI Shorts Generator – Frontend Script Optimisé
// Modèle : tiiuae/falcon-7b-instruct
// Optimisation top 0,1% pour performance et réactivité
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("prompt");
  const generateBtn = document.getElementById("generateBtn");
  const output = document.getElementById("output");

  const showMessage = (msg) => {
    output.textContent = msg;
  };

  const generateShort = async (prompt) => {
    try {
      showMessage("⏳ Génération en cours...");

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
      if (data.result) {
        showMessage(data.result);
      } else {
        showMessage("❌ Aucun résultat généré.");
      }
    } catch (error) {
      console.error("Erreur lors de la génération :", error);
      showMessage("❌ Erreur lors de la génération. Réessayez.");
    }
  };

  generateBtn.addEventListener("click", () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      showMessage("⚠️ Veuillez entrer un prompt !");
      return;
    }
    generateShort(prompt);
  });

  // Optionnel : activer la génération avec Ctrl+Enter
  promptInput.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      generateBtn.click();
    }
  });
});
