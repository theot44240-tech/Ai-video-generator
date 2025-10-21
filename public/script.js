/* ==========================================================
   🚀 AI SHORTS GENERATOR – FRONTEND SCRIPT
   Author: TheoT44240-Tech
   Niveau: Top 0.1% | Optimisé pour Render & Node.js
   ========================================================== */

const API_BASE = window.location.origin;

/* ==========================================================
   🎯 ELEMENTS DU DOM
========================================================== */
const promptInput = document.getElementById("prompt");
const voiceSelect = document.getElementById("voice");
const durationSelect = document.getElementById("duration");
const generateBtn = document.getElementById("generateBtn");

const progressSection = document.getElementById("progressSection");
const progressText = document.getElementById("progressText");
const loader = document.querySelector(".loader");

const resultSection = document.getElementById("resultSection");
const generatedVideo = document.getElementById("generatedVideo");
const downloadBtn = document.getElementById("downloadBtn");
const retryBtn = document.getElementById("retryBtn");

/* ==========================================================
   ⚙️ UTILITAIRES
========================================================== */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const setProgress = (msg, showLoader = true) => {
  progressText.innerText = msg;
  loader.classList.toggle("hidden", !showLoader);
  progressSection.classList.remove("hidden");
};

const hideProgress = () => progressSection.classList.add("hidden");
const showResult = () => resultSection.classList.remove("hidden");
const hideResult = () => resultSection.classList.add("hidden");

/* ==========================================================
   🧠 GÉNÉRATION DU SHORT
========================================================== */
generateBtn.addEventListener("click", async () => {
  hideResult();
  const text = promptInput.value.trim();
  if (!text) {
    alert("⚠️ Merci d’entrer un texte avant de générer la vidéo.");
    return;
  }

  const voice = voiceSelect.value;
  const duration = durationSelect.value;

  try {
    setProgress("🎧 Génération de la voix en cours…");

    // Étape 1 : génération TTS
    const ttsRes = await fetch(`${API_BASE}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });

    if (!ttsRes.ok) throw new Error("Erreur TTS");
    const ttsData = await ttsRes.json();
    if (!ttsData.audioPath) throw new Error("Chemin audio manquant");

    setProgress("🎞️ Génération de la vidéo IA…");

    // Étape 2 : génération vidéo
    const genRes = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        audioPath: ttsData.audioPath,
        voice,
        duration,
      }),
    });

    if (!genRes.ok) throw new Error("Erreur génération vidéo");
    const genData = await genRes.json();
    if (!genData.videoPath) throw new Error("Chemin vidéo manquant");

    // Étape 3 : affichage résultat
    hideProgress();
    showResult();
    generatedVideo.src = `${API_BASE}/${genData.videoPath}?t=${Date.now()}`;
    downloadBtn.href = `${API_BASE}/${genData.videoPath}`;
    downloadBtn.download = "AI_Short.mp4";

    setProgress("✅ Vidéo générée avec succès !", false);
  } catch (err) {
    console.error("❌ Erreur:", err);
    hideProgress();
    alert("❌ Une erreur est survenue pendant la génération. Vérifie le backend.");
  }
});

/* ==========================================================
   🔁 REESSAYER
========================================================== */
retryBtn.addEventListener("click", () => {
  promptInput.value = "";
  hideResult();
  hideProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ==========================================================
   🎤 CHARGEMENT DES VOIX AUTO
========================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_BASE}/api/voices`);
    if (!res.ok) throw new Error("Impossible de charger les voix");

    const voices = await res.json();
    voiceSelect.innerHTML = "";

    voices.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.id || v.name;
      opt.textContent = v.label || v.name;
      voiceSelect.appendChild(opt);
    });
  } catch {
    console.warn("⚠️ Chargement voix locales par défaut.");
    voiceSelect.innerHTML = `
      <option value="fr-male">Français (Homme)</option>
      <option value="fr-female">Français (Femme)</option>
      <option value="en-male">English (Male)</option>
      <option value="en-female">English (Female)</option>
    `;
  }
});

/* ==========================================================
   🧠 UX
========================================================== */
promptInput.addEventListener("input", () => {
  const len = promptInput.value.trim().length;
  promptInput.style.borderColor = len > 15 ? "var(--primary)" : "#333";
});
