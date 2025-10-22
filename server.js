import express from 'express';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { execSync, spawn } from 'child_process';
import process from 'process';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Logger stylé
const log = (msg, level = 'info') => {
  const colors = { info: 'cyan', success: 'green', warn: 'yellow', error: 'red' };
  console.log(chalk[colors[level]](`[${new Date().toISOString()}] ${msg}`));
};

// Vérifier et installer deps Node + Python
const checkDeps = () => {
  try {
    log('🔍 Vérification des dépendances Node...', 'info');
    execSync('npm ci', { stdio: 'inherit' });
    log('✅ Node deps OK', 'success');
  } catch {
    log('❌ Node deps failed', 'error');
  }

  try {
    log('🔍 Vérification des dépendances Python...', 'info');
    execSync('pip install -r requirements.txt', { stdio: 'inherit' });
    log('✅ Python deps OK', 'success');
  } catch {
    log('❌ Python deps failed', 'error');
  }
};

// Fonction pour lancer le serveur
const startServer = () => {
  const app = express();

  app.get('/', (req, res) => {
    res.send('🚀 AI Shorts Generator en ligne (LEVEL 99999999)');
  });

  const server = app.listen(PORT, () => {
    log(`🌟 AI Shorts Generator démarré (LEVEL 99999999)`, 'success');
    log(`Node v${process.versions.node} | Env: ${NODE_ENV} | Port: ${PORT}`, 'info');
  });

  server.on('error', (err) => {
    log(`❌ Erreur serveur: ${err}`, 'error');
    process.exit(1);
  });
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
  checkDeps();
  watchAndRestart();
} else {
  startServer();
}
