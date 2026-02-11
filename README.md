# Daily Quest Quest (Hybrid Version)

Daily Quest Quest is a Reddit-native interactive game challenge that refreshes every 24 hours. Built with **Devvit Web**, it combines the power of **React** for UI/Leaderboards and **Phaser.js** for high-performance mini-games.

## 🚀 Features
- **Deterministic Daily Loop**: Everyone plays the same quest each day, generated via `SHA256(current_UTC_date)`.
- **Hybrid Architecture**: Smooth React-based menus and leaderboards surrounding a custom Phaser game engine core.
- **3 Mini-Games (MVP)**:
  1. **Trend Trivia**: Test your knowledge of public subreddit trends.
  2. **Pattern Match**: A visual memory challenge.
  3. **Echo Breaker**: Identify cognitive biases in neutral, generic examples.
- **Subreddit Leaderboards**: Compete with your community for the top daily score.

## 🛠️ Tech Stack
- **Frontend**: React, Phaser.js, Tailwind CSS, Vite.
- **Backend**: Devvit (Hono), Redis for persistent scores.
- **Encryption**: CryptoJS for deterministic seed generation.

## 📱 Mobile First
Designed for the Reddit mobile app with large touch targets, responsive scaling, and a dark-mode default aesthetic.

## 🏆 Prize Targets
- Best Daily Game
- Best Mobile Gameplay
- Best Use of User Contributions (Subreddit Trivia)

## 📜 Compliance
- No PII storage.
- Respectful content moderation (safe-list subreddits).
- No external monetization.
- High performance (< 1.5MB bundle).

## 🛠️ Installation & Playtest
```bash
npm install
devvit login
devvit playtest
```
