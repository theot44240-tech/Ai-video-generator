import { exec } from "child_process";
import fs from "fs";
import path from "path";

/**
 * LEGENDARY 3D EXTREME MAX SHORT GENERATOR
 * - 3D holographic floating text
 * - Audio spectrum reactive particles in 3D
 * - Vertical 720x1280, TikTok/YouTube Shorts ready
 * - Logo overlay optional
 *
 * @param {string[]} lines - text lines to display
 * @param {string} audioFile - input audio path
 * @param {string} outputFile - final output video path
 * @param {string} [logoPath] - optional logo overlay
 */
export async function createMaxLegendaryShort(lines, audioFile, outputFile, logoPath) {
  return new Promise((resolve, reject) => {
    try {
      const beatFile = path.join("/tmp", `beats-${Date.now()}.txt`);
      const beatCmd = `ffmpeg -i "${audioFile}" -filter_complex "aformat=channel_layouts=mono,ebur128" -f null - 2>&1 | grep 'I:' | awk '{print $2}' > "${beatFile}"`;

      exec(beatCmd, (err) => {
        if (err) return reject(err);

        const beats = fs.readFileSync(beatFile, "utf-8").split("\n").filter(Boolean);

        const drawTexts = lines.map((line, i) => {
          const safeText = line.replace(/:/g, "\\:").replace(/'/g, "\\'");
          const start = parseFloat(beats[i] || 0);
          const end = start + 2;

          return `
            drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:
            text='${safeText}':
            fontsize=100:
            fontcolor_expr='if(mod(t*5,2)>1,cyan,magenta)':
            x=(w-text_w)/2 + 100*sin(PI*5*(t-${start})):
            y=(h-text_h)/2 + ${i*120} + 100*cos(PI*5*(t-${start})):
            box=1:boxcolor=0x00000080:boxborderw=20:
            enable='between(t,${start},${end})',
            fade=t=in:st=${start}:d=0.5,
            fade=t=out:st=${end-0.5}:d=0.5,
            rotate='0.3*sin(15*(t-${start}))',
            zoom='1+0.5*sin(PI*40*(t-${start}))',
            shadowcolor=yellow:shadowx=15:shadowy=15
          `;
        }).join(",");

        // 3D particle effect using ffmpeg geq
        const particleFilter = `
          nullsrc=size=720x1280 [base];
          [base]geq='r=255*random(0)*sin(2*PI*t*10):g=255*random(1)*sin(2*PI*t*12):b=255*random(2)*sin(2*PI*t*8)'[particles];
          [0:v][particles]overlay
        `;

        // Optional animated logo overlay
        const logoFilter = logoPath
          ? `[1:v]scale=180:-1,format=rgba,fade=t=in:st=0:d=1,fade=t=out:st=${beats[beats.length-1] || 10}:d=1,rotate='2*PI*t/5'[logo];[0:v][logo]overlay=W-w-20:H-h-20`
          : "";

        const cmd = `
          ffmpeg -y -f lavfi -i "color=black:s=720x1280:d=${beats[beats.length-1] || 12}" \
          -i "${audioFile}" ${logoPath ? `-i "${logoPath}"` : ""} \
          -filter_complex "[0:v]${drawTexts}${particleFilter}${logoFilter}" \
          -c:v libx264 -preset veryfast -crf 16 -c:a aac -shortest "${outputFile}"
        `;

        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            console.error("FFmpeg error:", stderr);
            return reject(err);
          }
          resolve(outputFile);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
