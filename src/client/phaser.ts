import Phaser from 'phaser';

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;

export interface GameState {
  currentQuest: number;
  totalScore: number;
  completedQuests: string[];
}

export class MainScene extends Phaser.Scene {
  private state: GameState = {
    currentQuest: 0,
    totalScore: 0,
    completedQuests: []
  };

  constructor() {
    super('MainScene');
  }

  init(data: Partial<GameState>) {
    this.state = { ...this.state, ...data };
  }

  preload() {
    // Generate simple particle texture
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('dot', 4, 4);
    graphics.destroy();
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0);
    
    // Background Wow: Starfield
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: 0, max: GAME_HEIGHT },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      speed: 20,
      lifespan: 3000,
      frequency: 100
    });

    const title = this.add.text(GAME_WIDTH / 2, 120, 'DAILY QUEST', {
      fontSize: '56px',
      color: '#ff4500',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: title,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const startButton = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    const bg = this.add.rectangle(0, 0, 240, 70, 0xff4500).setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, 'START QUEST', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    startButton.add([bg, text]);

    bg.on('pointerover', () => { 
        bg.setStrokeStyle(4, 0xffffff); 
        this.tweens.add({ targets: startButton, scale: 1.1, duration: 100 }); 
    });
    bg.on('pointerout', () => { 
        bg.setStrokeStyle(0); 
        this.tweens.add({ targets: startButton, scale: 1, duration: 100 }); 
    });

    bg.on('pointerdown', () => {
      this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'dot', {
        speed: { min: -100, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        lifespan: 500,
        emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-20, -20, 40, 40), quantity: 1 } as any
      }).explode(20);
      this.time.delayedCall(300, () => this.scene.start('TriviaScene', this.state));
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, '3 FAST CHALLENGES\n1 DAILY LEADERBOARD\nPLAY FOR GLORY', {
      fontSize: '14px',
      color: '#ff4500',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'Check Leaderboard on Desktop', {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);
  }
}

export class TriviaScene extends Phaser.Scene {
  private state!: GameState;
  private questions = [
    { q: "Which subreddit is for 'cute animals'?", a: ["r/aww", "r/science", "r/gaming"], correct: 0 },
    { q: "Where do you find 'shower thoughts'?", a: ["r/pics", "r/showerthoughts", "r/news"], correct: 1 },
    { q: "Subreddit for 'coding help'?", a: ["r/learnprogramming", "r/movies", "r/funny"], correct: 0 }
  ];
  private currentQ = 0;
  private score = 0;
  private timer!: Phaser.Time.TimerEvent;
  private timeLeft = 15;
  private timerText!: Phaser.GameObjects.Text;

  constructor() {
    super('TriviaScene');
  }

  init(data: GameState) {
    this.state = data;
    this.currentQ = 0;
    this.score = 0;
    this.timeLeft = 15;
  }

  create() {
    this.add.text(20, 20, `Quest 1/3: Trivia`, { fontSize: '18px', color: '#ff4500' });
    
    this.timerText = this.add.text(GAME_WIDTH - 20, 20, `Time: ${this.timeLeft}`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(1, 0);

    this.timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`Time: ${this.timeLeft}`);
        if (this.timeLeft <= 0) this.finish();
      },
      loop: true
    });

    this.showQuestion();
  }

  showQuestion() {
    const qData = this.questions[this.currentQ];
    if (!qData) {
      this.finish();
      return;
    }

    this.add.text(GAME_WIDTH / 2, 150, qData.q, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 350 }
    }).setOrigin(0.5);

    qData.a.forEach((ans, i) => {
      const btn = this.add.container(GAME_WIDTH / 2, 250 + i * 80);
      const bg = this.add.rectangle(0, 0, 300, 60, 0x333333).setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, ans, { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
      btn.add([bg, txt]);

      bg.on('pointerdown', () => {
        if (i === qData.correct) {
          this.score += 10;
          bg.setFillStyle(0x00ff00);
        } else {
          bg.setFillStyle(0xff0000);
        }
        
        this.time.delayedCall(500, () => {
          this.currentQ++;
          if (this.currentQ < this.questions.length) {
            this.children.removeAll();
            this.create();
            this.showQuestion();
          } else {
            this.finish();
          }
        });
      });
    });
  }

  finish() {
    this.timer.remove();
    this.state.totalScore += this.score;
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PatternScene', this.state);
    });
  }
}

export class PatternScene extends Phaser.Scene {
  private state!: GameState;
  private colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
  private sequence: number[] = [];
  private playerSequence: number[] = [];
  private buttons: Phaser.GameObjects.Rectangle[] = [];
  private isDisplaying = false;
  private rounds = 3;
  private currentRound = 0;

  constructor() {
    super('PatternScene');
  }

  init(data: GameState) {
    this.state = data;
    this.sequence = [];
    this.playerSequence = [];
    this.currentRound = 0;
  }

  create() {
    this.buttons = [];
    this.add.text(20, 20, `Quest 2/3: Pattern Match`, { fontSize: '18px', color: '#ff4500' });

    const size = 100;
    const spacing = 20;
    const startX = (GAME_WIDTH - (size * 2 + spacing)) / 2 + size / 2;
    const startY = (GAME_HEIGHT - (size * 2 + spacing)) / 2 + size / 2;

    for (let i = 0; i < 4; i++) {
      const x = startX + (i % 2) * (size + spacing);
      const y = startY + Math.floor(i / 2) * (size + spacing);
      const btn = this.add.rectangle(x, y, size, size, this.colors[i]).setInteractive({ useHandCursor: true });
      btn.setData('id', i);
      btn.setAlpha(0.6);
      this.buttons.push(btn);

      btn.on('pointerdown', () => this.handleInput(i));
    }

    this.time.delayedCall(1000, () => this.nextRound());
  }

  nextRound() {
    this.currentRound++;
    if (this.currentRound > this.rounds) {
      this.finish();
      return;
    }

    this.playerSequence = [];
    this.sequence.push(Math.floor(Math.random() * 4));
    this.displaySequence();
  }

  async displaySequence() {
    this.isDisplaying = true;
    for (const id of this.sequence) {
      await this.flashButton(id);
      await this.wait(300);
    }
    this.isDisplaying = false;
  }

  flashButton(id: number): Promise<void> {
    const btn = this.buttons[id];
    if (!btn) return Promise.resolve();
    btn.setAlpha(1);
    return new Promise(resolve => {
      this.time.delayedCall(500, () => {
        btn.setAlpha(0.6);
        resolve();
      });
    });
  }

  handleInput(id: number) {
    if (this.isDisplaying) return;
    
    this.flashButton(id);
    this.playerSequence.push(id);
    
    const idx = this.playerSequence.length - 1;
    if (this.playerSequence[idx] !== this.sequence[idx]) {
      this.finish();
      return;
    }

    if (this.playerSequence.length === this.sequence.length) {
      this.time.delayedCall(500, () => this.nextRound());
    }
  }

  finish() {
    const score = (this.currentRound - 1) * 20;
    this.state.totalScore += score;
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('EchoScene', this.state);
    });
  }

  private wait(ms: number) {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }
}

export class EchoScene extends Phaser.Scene {
  private state!: GameState;
  private biases = [
    { q: "I already knew this was going to happen!", bias: "Hindsight Bias" },
    { q: "This brand is better because it's famous.", bias: "Authority Bias" },
    { q: "I feel like I'm more skilled than average.", bias: "Overconfidence Effect" }
  ];
  private currentB = 0;
  private score = 0;

  constructor() {
    super('EchoScene');
  }

  init(data: GameState) {
    this.state = data;
    this.currentB = 0;
    this.score = 0;
  }

  create() {
    this.add.text(20, 20, `Quest 3/3: Echo Breaker`, { fontSize: '18px', color: '#ff4500' });
    this.showBias();
  }

  showBias() {
    const bData = this.biases[this.currentB];
    if (!bData) {
      this.finish();
      return;
    }

    this.add.text(GAME_WIDTH / 2, 150, "What cognitive bias is this?", { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 200, `"${bData.q}"`, {
      fontSize: '22px',
      color: '#00ff00',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 350 }
    }).setOrigin(0.5);

    const options = [bData.bias, "Confirmation Bias", "Availability Heuristic", "Anchoring Bias"];
    this.shuffle(options);

    options.forEach((opt, i) => {
      const btn = this.add.container(GAME_WIDTH / 2, 300 + i * 65);
      const bg = this.add.rectangle(0, 0, 320, 50, 0x333333).setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, opt, { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
      btn.add([bg, txt]);

      bg.on('pointerdown', () => {
        if (opt === bData.bias) {
          this.score += 20;
          bg.setFillStyle(0x00ff00);
        } else {
          bg.setFillStyle(0xff0000);
        }

        this.time.delayedCall(500, () => {
          this.currentB++;
          if (this.currentB < this.biases.length) {
            this.children.removeAll();
            this.create();
            this.showBias();
          } else {
            this.finish();
          }
        });
      });
    });
  }

  shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async finish() {
    this.state.totalScore += this.score;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8).setOrigin(0);
    
    // Celebratory Particle Fountain
    this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT + 50, 'dot', {
        angle: { min: 240, max: 300 },
        speed: { min: 400, max: 600 },
        gravityY: 400,
        lifespan: 4000,
        scale: { start: 1, end: 0 },
        tint: [0xff4500, 0xffffff, 0xffff00],
    }).explode(100);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'QUEST COMPLETE!', {
      fontSize: '40px',
      color: '#ff4500',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `Total Score: ${this.state.totalScore}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Call API to submit total score
    try {
      await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: 'daily', score: this.state.totalScore })
      });
    } catch (e) {
      console.error('Failed to submit score', e);
    }

    this.time.delayedCall(4000, () => {
      this.scene.start('MainScene', this.state);
    });
  }
}

export const createGameConfig = (parent: string): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent,
  scene: [MainScene, TriviaScene, PatternScene, EchoScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
});
