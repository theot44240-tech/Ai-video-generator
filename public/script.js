document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value;
  const responseDiv = document.getElementById("response");

  responseDiv.innerText = "⏳ Je réfléchis...";

  try {
    const res = await fetch(`/api/ask?q=${encodeURIComponent(question)}&key=1234`);
    if (!res.ok) {
      responseDiv.innerText = "❌ Erreur : clé invalide ou problème serveur.";
      return;
    }
    const text = await res.text();
    responseDiv.innerText = text;
  } catch (err) {
    responseDiv.innerText = "⚠️ Erreur réseau : " + err.message;
  }
});
