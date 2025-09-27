// script.js – AI Shorts Generator (Top 0,1%)
// Assure une communication fluide avec le backend Node.js / Hugging Face

const chatForm = document.getElementById('chat-form');
const userMessageInput = document.getElementById('user-message');
const chatLog = document.getElementById('chat-log');
const shortsContainer = document.getElementById('shorts-container');

// Fonction pour afficher un message dans le chat
function addMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = text;
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Fonction pour afficher un short généré (si URL vidéo ou texte)
function addShort(content, isVideo = false) {
  const shortDiv = document.createElement('div');
  shortDiv.classList.add('short');

  if (isVideo) {
    const video = document.createElement('video');
    video.src = content;
    video.controls = true;
    video.autoplay = false;
    shortDiv.appendChild(video);
  } else {
    shortDiv.textContent = content;
  }

  shortsContainer.prepend(shortDiv);
}

// Fonction principale pour envoyer le message à l'API
async function sendMessage(message) {
  addMessage('user', message);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur : ${response.status}`);
    }

    const data = await response.json();

    if (data.reply) {
      addMessage('ai', data.reply);
      if (data.short) {
        // Affiche le short généré (si présent)
        addShort(data.short, data.isVideo);
      }
    } else {
      addMessage('ai', "⚠️ Aucun retour de l'IA. Réessaye.");
    }
  } catch (err) {
    console.error('Erreur fetch /api/generate:', err);
    addMessage('ai', 'Erreur serveur. Veuillez réessayer.');
  }
}

// Gestion de l’envoi du formulaire
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = userMessageInput.value.trim();
  if (!message) return;
  sendMessage(message);
  userMessageInput.value = '';
});
