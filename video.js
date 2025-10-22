/**
 * video.js — Ultimate AI Video Builder
 * ------------------------------------
 * Gère l’assemblage automatique des vidéos Shorts :
 * - Génère la piste audio (TTS)
 * - Crée le visuel (images, clips, transitions)
 * - Superpose texte, musique et effets
 * - Exporte en .mp4 prêt pour YouTube / TikTok
 *
 * Niveau pro : 100% modulaire, scalable, et stylé.
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === 📍 CONFIG GLOBALE ===
const OUTPUT_DIR = path.join(__dirname, "../outputs");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// === ⚙️ MAIN FUNCTION ===
export async function createVideo({
  audioPath,
  subtitles = [],
  images = [],
  bgMusic = "",
  resolution = "1080x1920",
  outputName = `short-${Date.now()}.mp4`,
}) {
  const outputPath = path.join(OUTPUT_DIR, outputName);

  console.log("🎥 Création de la vidéo...");
  if (!audioPath || !fs.existsSync(audioPath)) {
    throw new Error("❌ Fichier audio introuvable !");
  }

  // === 🖼️ Génération du script FFMPEG ===
  const imageInputs = images
    .map((img, i) => `-loop 1 -t 3 -i "${img}"`)
    .join(" ");

  const filters = [
    "[0:a]apad=pad_dur=10[aud]",
    "fps=30,format=yuv420p,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
  ];

  // === 🎶 Musique de fond ===
  let bgMusicInput = "";
  if (bgMusic && fs.existsSync(bgMusic)) {
    bgMusicInput = `-i "${bgMusic}" -filter_complex "[1:a][0:a]amix=inputs=2:duration=first:dropout_transition=3[a]"`;
  }

  // === 📝 Sous-titres stylés ===
  const subtitlesFilter = subtitles.length
    ? subtitles
        .map(
          (s, i) =>
            `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${s.text.replace(
              /'/g,
              "\\'"
            )}':x=(w-text_w)/2:y=h-200:fontsize=60:fontcolor=white:box=1:boxcolor=black@0.6:enable='between(t,${s.start},${
              s.end
            })'`
        )
        .join(",")
    : "";

  const fullFilter =
    `[0:v]${filters[1]},${subtitlesFilter ? subtitlesFilter + "," : ""}scale=${resolution}[v];[a]volume=1.0[aout]`;

  // === 🧠 Commande FFMPEG ===
  const cmd = `
    ffmpeg ${imageInputs} -i "${audioPath}" ${bgMusicInput} \
    -filter_complex "${fullFilter}" \
    -map "[v]" -map "[aout]" -tune film -preset veryfast \
    -b:v 4M -b:a 192k -shortest "${outputPath}" -y
  `;

  console.log("🧩 Exécution du rendu...");
  await execAsync(cmd);

  console.log(`✅ Vidéo générée avec succès : ${outputPath}`);
  return outputPath;
}

// === 🔧 PROMISIFY EXEC ===
function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Erreur FFMPEG :", stderr);
        reject(err);
      } else resolve(stdout);
    });
  });
}
