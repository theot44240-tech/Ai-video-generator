const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('prompt');
const resultOutput = document.getElementById('result');

generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert('Veuillez entrer un prompt.');

  resultOutput.textContent = '⏳ Génération en cours...';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    resultOutput.textContent = data.generated_text || '❌ Pas de résultat.';
  } catch (err) {
    resultOutput.textContent = '🔥 Erreur lors de la génération.';
    console.error(err);
  }
});
