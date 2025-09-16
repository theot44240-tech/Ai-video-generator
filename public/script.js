document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.querySelector("input");
  const question = input.value;
  const output = document.querySelector("#output");

  if (!question) return;

  output.textContent = "⏳ L'IA réfléchit...";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question }),
    });

    const data = await response.json();

    if (data.error) {
      output.textContent = "❌ Erreur : " + data.error;
    } else {
      output.textContent = "🤖 " + data.reply;
    }
  } catch (err) {
    output.textContent = "❌ Impossible de contacter le serveur.";
  }

  input.value = "";
});
