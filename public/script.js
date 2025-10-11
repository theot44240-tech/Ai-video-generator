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
   * Fonction pour afficher les messages dans la div output
   * @param {string} message
   */
  const showOutput = (message) => {
    outputDiv.style.display = "block";
    outputDiv.textContent = message;
  };

  /**
   * Fonction pour générer un short via API backend
   */
  const generateShort = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert("Veuillez entrer un sujet ou une idée !");
      return;
    }

    generateBtn.disabled = true;
    showOutput("⏳ Génération en cours...");

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API : ${response.status}`);
      }

      const data = await response.json();

      // Affichage uniquement du script généré
      showOutput(data.script || "⚠️ Aucun script généré");

    } catch (err) {
      showOutput("❌ Une erreur est survenue : " + err.message);
      console.error(err);
    } finally {
      generateBtn.disabled = false;
    }
  };

  // Gestionnaire d’événement bouton
  generateBtn.addEventListener("click", generateShort);

  // Optionnel : générer short avec touche Enter dans input
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateShort();
    }
  });
});
