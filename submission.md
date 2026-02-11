# Devpost Submission Guide: Daily Quest Quest

This document contains the optimized answers and scripts for your Reddit Daily Games Hackathon submission.

## 🏆 Prize Category Strategy
- **Primary**: Best Daily Game (Core loop is exactly 24h)
- **Secondary**: Best Mobile Gameplay (Thumb-friendly design, Phaser performance)
- **Secondary**: Best Use of User Contributions (Trivia pulls from subreddit context)

---

## 📝 Devpost Answers

### 1. Inspiration
We wanted to create a "daily ritual" for Redditors that felt as native and addictive as checking the front page. Inspired by Wordle's simplicity and the competitive spirit of Reddit's unique sub-cultures, we built a hybrid engine that combines educational cognitive challenges with fast-paced trivia.

### 2. What it does
**Daily Quest Quest** is a 3-part mini-game anthology that refreshes every 24 hours at midnight UTC. 
1. **Trend Trivia**: Fast-paced subreddit knowledge.
2. **Pattern Match**: Visual memory training.
3. **Echo Breaker**: A unique mini-game that teaches users to identify cognitive biases in everyday language.
Completing all three rewards the user with a streak badge and a spot on their community's leaderboard.

### 3. How we built it
We utilized a **Hybrid Architecture**:
- **Devvit Web & Hono**: Robust backend routing and Reddit-native UI integration.
- **React**: For the modern, responsive "Subreddit Rankings" and "Streak" overlays.
- **Phaser.js**: A high-performance game engine for the mini-games, allowing for fluid particle effects and 60FPS mobile gameplay.
- **Deterministic Seeding**: Used `SHA256` of the current date to ensure global parity in quest configuration.

### 4. Challenges we ran into
The biggest challenge was maintaining a "Winner-Grade" aesthetic while staying under the 1.5MB bundle size. We solved this by implementing procedural graphics and particle fountains in Phaser instead of using large static image assets. Managing real-time UTC countdowns and streak persistence in Redis also required careful handling of timezones.

### 5. Accomplishments that we're proud of
- Achieving sub-1.5MB bundle size with a full particle engine.
- Implementing a streak system that actually feels rewarding through "Flame" badges.
- Creating the "Echo Breaker" game, which adds a layer of meaningful, educational value beyond just simple entertainment.

### 6. What we learned
Building for Devvit Web taught us how to seamlessly bridge the gap between standard web technologies and the specialized Reddit Interactive Post environment. We learned a lot about mobile UX optimization for "one-thumb" play.

### 7. What's next for Daily Quest Quest
- **Mod Tools**: Allowing subreddit moderators to seed their own custom Trivia questions.
- **Dynamic AI Quests**: Using safe-mode AI to generate contextual biases for Echo Breaker based on trending non-political news.
- **Global Leaderboards**: Cross-subreddit competitions.

---

## 🎬 Demo Playthrough Script (60-90 Seconds)

**Scene 1: The Intro (0-15s)**
- *Visual*: Show the Starfield Splash screen with the neon "DAILY QUEST" title pulsing.
- *Voiceover*: "Welcome to Daily Quest Quest, your new daily ritual on Reddit. One quest, three challenges, total glory."

**Scene 2: Trend Trivia (15-35s)**
- *Visual*: Quick cuts of 2-3 trivia questions being answered correctly with green flashes.
- *Voiceover*: "Start by testing your knowledge of the subreddits you love. Speed matters! Move fast to maximize your score."

**Scene 3: Pattern Match (35-50s)**
- *Visual*: Show the sequence flashing and the user tapping buttons with particle bursts.
- *Voiceover*: "Level up with our Pattern Matcher. It’s visual memory training built for mobile."

**Scene 4: Echo Breaker & Finish (50-75s)**
- *Visual*: Identifying a 'Hindsight Bias' and the final Particle Fountain celebration.
- *Voiceover*: "Finally, break the echo chamber. Identify cognitive biases and claim your daily streak. See where you rank in your subreddit and come back tomorrow to keep the flame alive."

**Scene 5: The Call to Action (75-90s)**
- *Visual*: Focus on the "12 DAY STREAK" badge and the leaderboard.
- *Voiceover*: "Daily Quest Quest: Play the day, lead the pack. Only on Reddit."
