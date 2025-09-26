// script.js

// Sélection des éléments DOM
const form = document.querySelector('#chat-form');
const input = document.querySelector('#chat-input');
const chatContainer = document.querySelector('#chat-container');

// Fonction pour afficher un message dans le chat
function addMessage(content, sender = 'user') {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message', sender);
  messageEl.textContent = content;
  chatContainer.appendChild(messageEl);
  chatContainer.scrollTop = chatContainer.scrollHeight; // scroll automatique
}

// Fonction pour afficher un message "loading"
function addLoadingMessage() {
  const loadingEl = document.createElement('div');
  loadingEl.classList.add('message', 'loading');
  loadingEl.textContent = '...';
  chatContainer.appendChild(loadingEl);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return loadingEl;
}

// Gestion de la soumission du formulaire
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, 'user'); // afficher le message utilisateur
  input.value = '';

  const loadingEl = addLoadingMessage(); // message de chargement

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });

    loadingEl.remove(); // enlever le message de chargement

    if (!response.ok) {
      addMessage('Erreur serveur. Veuillez réessayer.', 'error');
      return;
    }

    const data = await response.json();
    addMessage(data.reply, 'bot'); // afficher la réponse du bot
  } catch (err) {
    console.error(err);
    loadingEl.remove();
    addMessage('Impossible de contacter le serveur.', 'error');
  }
});
