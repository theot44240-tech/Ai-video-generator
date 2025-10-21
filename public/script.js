/* ==========================================================
   🚀 AI SHORTS GENERATOR – FRONTEND SCRIPT
   Author: TheoT44240-Tech
   Level: Top 0.1% optimization and clarity
   ========================================================== */

const form = document.getElementById("generateForm");
const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const languageSelect = document.getElementById("languageSelect");

const progressSection = document.getElementById("progressSection");
const progressText = document.getElementById("progressText");
const loader = document.querySelector(".loader");

const resultSection = document.getElementById("resultSection");
const generatedVideo = document.getElementById("generatedVideo");
const downloadBtn = document.getElementById("downloadBtn");
const retryBtn = document.getElementById("retryBtn");

const API_BASE = window.location.origin;

/* ==========================================================
   🧩 HELPERS
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
   🎬 HANDLE FORM SUBMIT
========================================================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideResult();

  const text = textInput.value.trim();
  if (!text) {
    alert("⚠️ Merci d’entrer un texte à transformer en vidéo.");
    return;
  }

  const voice = voiceSelect.value || "fr";
  const lang = languageSelect.value || "fr";

  try {
    setProgress("🎧 Génération de la voix en cours…");

    // Étape 1 : Génération de la voix via TTS
    const ttsRes = await fetch(`${API_BASE}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, lang }),
    });

    if (!ttsRes.ok) throw new Error("Erreur TTS");
    const ttsData = await ttsRes.json();
    if (!ttsData.audioPath) throw new Error("Chemin audio manquant");

    setProgress("🎞️ Génération de la vidéo IA…");

    // Étape 2 : Génération vidéo (texte + audio)
    const genRes = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        audioPath: ttsData.audioPath,
        voice,
        lang,
      }),
    });

    if (!genRes.ok) throw new Error("Erreur vidéo");
    const genData = await genRes.json();
    if (!genData.videoPath) throw new Error("Chemin vidéo manquant");

    // Étape 3 : Affichage du résultat
    hideProgress();
    showResult();

    generatedVideo.src = `${API_BASE}/${genData.videoPath}?t=${Date.now()}`;
    downloadBtn.href = `${API_BASE}/${genData.videoPath}`;
    downloadBtn.download = "ai_short.mp4";

    setProgress("✅ Vidéo générée avec succès !", false);
  } catch (err) {
    console.error(err);
    hideProgress();
    alert("❌ Une erreur est survenue pendant la génération.");
  }
});

/* ==========================================================
   🔁 RETRY / RESET
========================================================== */
retryBtn.addEventListener("click", () => {
  textInput.value = "";
  hideResult();
  hideProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ==========================================================
   🌍 AUTO LOAD VOICES
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
      opt.textContent = `${v.label || v.name}`;
      voiceSelect.appendChild(opt);
    });
  } catch (err) {
    console.warn("⚠️ Chargement voix local par défaut.");
    voiceSelect.innerHTML = `
      <option value="fr">Français</option>
      <option value="en">Anglais</option>
      <option value="es">Espagnol</option>
    `;
  }
});

/* ==========================================================
   🧠 UX TOUCHES
========================================================== */
textInput.addEventListener("input", () => {
  const len = textInput.value.trim().length;
  textInput.style.borderColor = len > 10 ? "var(--primary)" : "#333";
});
