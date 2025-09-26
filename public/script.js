// public/script.js

/**
 * AI Shorts Generator – Frontend Chat
 * Niveau top 0,1% : lisible, maintenable et extensible
 */

// Sélection des éléments DOM
const form = document.querySelector('#chat-form');
const input = document.querySelector('#chat-input');
const chatContainer = document.querySelector('#chat-container');

/**
 * Affiche un message dans le chat
 * @param {string} content - Texte du message
 * @param {string} sender - 'user', 'bot' ou 'error'
 */
function addMessage(content, sender = 'user') {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message', sender);
  messageEl.textContent = content;
  chatContainer.appendChild(messageEl);
  chatContainer.scrollTop = chatContainer.scrollHeight; // scroll automatique
}

/**
 * Envoie un message au serveur /chat
 * @param {string} message - Texte à envoyer
 * @returns {Promise<string|null>} - Réponse du bot
 */
async function sendMessage(message) {
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // Ne mettez jamais le token côté frontend en prod !
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur : ${response.status}`);
    }

    const data = await response.json();
    addMessage(data.reply, 'bot'); // afficher la réponse
    return data.reply;
  } catch (err) {
    console.error('Erreur fetch /chat:', err);
    addMessage('Erreur serveur. Veuillez réessayer.', 'error');
    return null;
  }
}

// Gestion du formulaire
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;
  addMessage(userMessage, 'user');  // afficher le message utilisateur
  input.value = '';
  sendMessage(userMessage);         // envoyer au serveur
});

// Exemple de test automatique (peut être retiré en prod)
// sendMessage("Bonjour, peux-tu me répondre ?");
