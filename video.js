import { exec } from "child_process";

export async function createVideo(audioFile, outputVideo) {
  return new Promise((resolve, reject) => {
    try {
      // Générer une vidéo simple avec fond noir + audio
      const cmd = `ffmpeg -f lavfi -i color=c=black:s=720x1280:d=10 -i "${audioFile}" -c:v libx264 -c:a aac -shortest "${outputVideo}" -y`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(outputVideo);
      });
    } catch (err) {
      reject(err);
    }
  });
}
