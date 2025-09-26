// public/script.js
/**
 * AI Shorts Generator – Frontend Chat
 * Niveau top 0,1% : lisible, sécurisé et maintenable
 */

const form = document.querySelector('#chat-form');
const input = document.querySelector('#chat-input');
const chatContainer = document.querySelector('#chat-container');

/**
 * Ajoute un message dans le chat
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
 * Envoie un message au serveur pour obtenir la réponse IA
 * @param {string} message - Message utilisateur
 * @returns {Promise<string|null>} - Réponse du bot ou null en cas d'erreur
 */
async function sendMessage(message) {
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // Pas de token côté frontend : sécurité maximale
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);

    const data = await response.json();
    addMessage(data.reply, 'bot'); // afficher la réponse IA
    return data.reply;

  } catch (err) {
    console.error('Erreur fetch /chat:', err);
    addMessage('Erreur serveur. Veuillez réessayer.', 'error');
    return null;
  }
}

/**
 * Gestion de l'envoi via formulaire
 */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;
  addMessage(userMessage, 'user');  // Affiche le message utilisateur
  input.value = '';
  sendMessage(userMessage);         // Envoie au serveur
});

// Optionnel : message de bienvenue
addMessage('Bienvenue ! Pose ta question à l\'IA.', 'bot');
