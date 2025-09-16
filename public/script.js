document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const input = document.querySelector("input");
  const result = document.createElement("p");
  document.body.appendChild(result);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();

    if (!message) return;

    result.textContent = "⏳ L’IA réfléchit...";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.reply) {
        result.textContent = `🤖 ${data.reply}`;
      } else {
        result.textContent = `⚠️ Erreur: ${data.error || "aucune réponse"}`;
      }
    } catch (error) {
      console.error("Erreur côté client:", error);
      result.textContent = "❌ Erreur de connexion au serveur";
    }
  });
});
