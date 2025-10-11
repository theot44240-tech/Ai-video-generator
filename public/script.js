/**
 * AI Shorts Generator — Frontend Script
 * Version finale optimisée pour Render / Node.js
 * Auteur : theot44240-tech
 */

document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const outputDiv = document.getElementById("output");
  const promptInput = document.getElementById("prompt");

  /**
   * Affiche un message dans la div output
   * @param {string} message
   */
  const showOutput = (message) => {
    outputDiv.style.display = "block";
    outputDiv.textContent = message;
  };

  /**
   * Génère un short via l'API backend
   */
  const generateShort = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert("Veuillez entrer un sujet ou une idée !");
      return;
    }

    showOutput("⏳ Génération en cours...");

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API : ${response.status}`);
      }

      const data = await response.json();

      // Affichage propre du JSON généré
      showOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      showOutput("❌ Une erreur est survenue : " + err.message);
      console.error(err);
    }
  };

  // Gestionnaire du bouton
  generateBtn.addEventListener("click", generateShort);

  // Optionnel : générer avec la touche Enter dans textarea
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateShort();
    }
  });
});
