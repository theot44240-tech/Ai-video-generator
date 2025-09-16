document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value;
  const output = document.getElementById("output");

  output.textContent = "⏳ Réponse en cours...";

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    if (data.reply) {
      output.textContent = data.reply;
    } else {
      output.textContent = "❌ Erreur : aucune réponse reçue.";
    }
  } catch (error) {
    console.error("Erreur :", error);
    output.textContent = "⚠️ Erreur de connexion au serveur.";
  }
});
