# 🎬 AI Shorts Generator

Génère automatiquement des vidéos **YouTube Shorts** grâce à la puissance de l’IA 🤖

[![Node.js](https://img.shields.io/badge/Node.js->=20.0.0-brightgreen)](https://nodejs.org/)
[![Render](https://img.shields.io/badge/Render-Deploy-blue)](https://render.com/)

---

## 💡 Fonctionnalités
- Génération automatique de vidéos YouTube Shorts
- Choix de la **voix** (Homme/Femme, Français ou autres langues)
- Durée ciblée configurable (20s à 70s)
- **Logs centralisés** pour faciliter le debug
- Compatible **Node.js 20+** et **Python 3.12**
- Optimisé pour **Render** avec déploiement simple

---

## 📝 Utilisation

1. **Entrer l’idée de short**  
   Exemple : *“La motivation à ne jamais abandonner.”*

2. **Choisir la voix**  
   Exemple : *Français (Homme)*

3. **Définir la durée cible**  
   Exemple : *20 secondes*

4. **Générer le Short**  
   L’IA crée la vidéo avec voix synthétique automatiquement.

---

## ⚡ Déploiement sur Render

1. Crée un projet sur Render et connecte ton **repo GitHub**
2. Configure **Environment** :
   - Build Command : `npm install`
   - Start Command : `bash ./start-server.sh`
3. Node.js >= 20.0.0 (Render utilise automatiquement la version définie dans `package.json`)
4. Python 3.12 pour TTS
5. Crée l’environnement Python TTS :

```bash
python3 -m venv tts-env
source tts-env/bin/activate
pip install -r requirements.txt
