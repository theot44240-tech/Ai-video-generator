document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value;
  const responseDiv = document.getElementById("response");

  responseDiv.textContent = "⏳ Attends, je réfléchis...";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await res.json();

    if (data.answer) {
      responseDiv.textContent = data.answer;
    } else {
      responseDiv.textContent = "❌ Erreur : aucune réponse reçue.";
    }
  } catch (error) {
    responseDiv.textContent = "❌ Erreur de connexion au serveur.";
  }
});
