document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const outputDiv = document.getElementById("output");
  const promptInput = document.getElementById("prompt");

  const showOutput = (message) => {
    outputDiv.style.display = "block";
    outputDiv.textContent = message;
  };

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error(`Erreur API : ${response.status}`);

      const data = await response.json();
      showOutput(data.script || "⚠️ Aucun script généré");

    } catch (err) {
      showOutput("❌ Une erreur est survenue : " + err.message);
      console.error(err);
    } finally {
      generateBtn.disabled = false;
    }
  };

  generateBtn.addEventListener("click", generateShort);

  promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateShort();
    }
  });
});
