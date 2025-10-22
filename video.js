// ===============================================
// video.js - AI Shorts Generator
// Video Renderer - Ultra stable, TikTok/YouTube Shorts ready
// ===============================================

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execAsync = util.promisify(exec);

/**
 * createShortVideo
 * @param {string[]} lines - Text lines to display
 * @param {string} audioFile - Path to TTS audio
 * @param {string} outputFile - Final video path
 * @param {string} [logoPath] - Optional logo overlay
 */
export async function createShortVideo(lines, audioFile, outputFile, logoPath) {
  if (!fs.existsSync(audioFile)) throw new Error(`Audio file not found: ${audioFile}`);
  
  const beatFile = path.join('/tmp', `beats-${Date.now()}.txt`);

  // 1️⃣ Extract beat times using ffmpeg ebur128
  const beatCmd = `ffmpeg -i "${audioFile}" -filter_complex "aformat=channel_layouts=mono,ebur128" -f null - 2>&1 | grep 'I:' | awk '{print $2}' > "${beatFile}"`;
  await execAsync(beatCmd);

  const beats = fs.existsSync(beatFile)
    ? fs.readFileSync(beatFile, 'utf-8').split('\n').filter(Boolean).map(Number)
    : [];

  // fallback si beats insuffisants
  while (beats.length < lines.length) beats.push(beats[beats.length - 1] || 0);

  // 2️⃣ Générer drawtext filter
  const drawTextFilters = lines.map((line, i) => {
    const start = beats[i];
    const end = start + 2;
    const safeText = line.replace(/:/g, '\\:').replace(/'/g, "\\'");
    return `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${safeText}':fontsize=100:fontcolor_expr='if(mod(t*5,2)>1,cyan,magenta)':x=(w-text_w)/2 + 50*sin(PI*4*(t-${start})):y=(h-text_h)/2 + ${i*120}:enable='between(t,${start},${end})',fade=t=in:st=${start}:d=0.5,fade=t=out:st=${end-0.5}:d=0.5`;
  }).join(',');

  // 3️⃣ Optional logo overlay
  const logoFilter = logoPath
    ? `[1:v]scale=180:-1,format=rgba[logo];[0:v][logo]overlay=W-w-20:H-h-20`
    : '';

  // 4️⃣ Particle effect simple
  const particleFilter = `[0:v]geq='r=255*random(0):g=255*random(1):b=255*random(2)'[particles];[0:v][particles]overlay`;

  // 5️⃣ Final FFmpeg command
  const cmd = `
    ffmpeg -y -f lavfi -i "color=black:s=720x1280:d=${beats[beats.length-1]+2}" \
    -i "${audioFile}" ${logoPath ? `-i "${logoPath}"` : ''} \
    -filter_complex "${drawTextFilters}${logoPath ? ',' + logoFilter : ''}${particleFilter}" \
    -c:v libx264 -preset veryfast -crf 16 -c:a aac -shortest "${outputFile}"
  `;

  try {
    await execAsync(cmd);
    return outputFile;
  } catch (err) {
    console.error('FFmpeg error:', err);
    throw err;
  }
}

// ======================
// Example usage
// ======================
// (async () => {
//   const video = await createShortVideo(
//     ['Salut !', 'Voici un Short ultra stylé !'],
//     './audio/test.mp3',
//     './videos/short_test.mp4'
//   );
//   console.log('Vidéo générée :', video);
// })();
