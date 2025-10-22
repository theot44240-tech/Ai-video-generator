import express from 'express';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { execSync, spawn } from 'child_process';
import os from 'os';
import process from 'process';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

const log = (msg, level = 'info') => {
  const colors = { info: 'cyan', success: 'green', warn: 'yellow', error: 'red' };
  console.log(chalk[colors[level]](`[${new Date().toISOString()}] ${msg}`));
};

// Check GPU
const checkGPU = () => {
  try {
    const nvidia = execSync('nvidia-smi', { stdio: 'pipe' }).toString();
    log(`💻 GPU detected:\n${nvidia}`, 'success');
  } catch {
    log('⚠️ No GPU detected, using CPU fallback', 'warn');
  }
};

// Check deps Node + Python
const checkDeps = () => {
  try { execSync('npm ci', { stdio: 'inherit' }); log('✅ Node deps OK', 'success'); }
  catch { log('❌ Node deps failed', 'error'); }

  try { execSync('pip install -r requirements.txt', { stdio: 'inherit' }); log('✅ Python deps OK', 'success'); }
  catch { log('❌ Python deps failed', 'error'); }
};

// Test port
const testPort = (port) => {
  const net = require('net');
  try { const s = net.createServer().listen(port); s.close(); return true; }
  catch { return false; }
};

// Monitoring CPU/GPU
const monitorResources = () => {
  setInterval(() => {
    const cpus = os.loadavg()[0].toFixed(2);
    const mem = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
    log(`📊 Load: ${cpus} | RAM used: ${mem}GB`, 'info');
  }, 15000);
};

// AI placeholders
const loadModels = () => {
  log('🤖 Loading AI models...', 'info');
  // Ici tu peux intégrer LLaMA/Groq/Whisper/etc
  log('✅ AI models ready', 'success');
};

// Serveur
const startServer = () => {
  const app = express();

  app.use(express.json());
  app.get('/', (req, res) => {
    res.send('🚀 AI Shorts Generator ULTIMATE LEVEL 999999999');
  });

  let finalPort = PORT;
  while (!testPort(finalPort)) { log(`⚠️ Port ${finalPort} occupé, test ${finalPort+1}`, 'warn'); finalPort++; }

  const server = app.listen(finalPort, () => {
    log(`🌟 Server running on port ${finalPort}`, 'success');
  });

  server.on('error', (err) => { log(`❌ Server error: ${err}`, 'error'); process.exit(1); });

  monitorResources();
  loadModels();
};

// Watcher auto-restart
const watchAndRestart = () => {
  const child = spawn('node', ['server.js', 'start'], { stdio: 'inherit' });
  child.on('exit', (code) => {
    log(`⚡ Crash detected (code: ${code}). Restarting...`, 'warn');
    setTimeout(watchAndRestart, 2000);
  });
};

// Lancement
if (process.argv[2] === 'watch') {
  checkGPU();
  checkDeps();
  watchAndRestart();
} else {
  startServer();
}
