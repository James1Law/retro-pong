import { GameState } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INITIAL_LIVES,
  COLORS
} from '../utils/constants';
import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Level } from './Level';
import { InputManager } from './InputManager';
import { ParticleSystem } from '../effects/ParticleSystem';
import { checkBallBrickCollision, handleBallBrickBounce } from './Collision';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;

  private paddle: Paddle;
  private ball: Ball;
  private level: Level;
  private particles: ParticleSystem;

  private state: GameState = GameState.MENU;
  private score: number = 0;
  private lives: number = INITIAL_LIVES;
  private highScore: number = 0;

  private lastTime: number = 0;
  private screenShake: number = 0;
  private pauseKeyReleased: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.input = new InputManager(canvas);
    this.paddle = new Paddle();
    this.ball = new Ball();
    this.level = new Level();
    this.particles = new ParticleSystem();

    // Load high score
    const savedHighScore = localStorage.getItem('neonBreakoutHighScore');
    if (savedHighScore) {
      this.highScore = parseInt(savedHighScore, 10);
    }
  }

  start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(currentTime: number): void {
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(dt, currentTime);
    this.render(currentTime);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number, time: number): void {
    // Handle pause toggle
    if (this.input.isPausePressed()) {
      if (this.pauseKeyReleased) {
        this.pauseKeyReleased = false;
        if (this.state === GameState.PLAYING) {
          this.state = GameState.PAUSED;
        } else if (this.state === GameState.PAUSED) {
          this.state = GameState.PLAYING;
        }
      }
    } else {
      this.pauseKeyReleased = true;
    }

    // On mobile, allow tap to resume from pause
    if (this.state === GameState.PAUSED && this.input.isMobile() && this.input.isActionPressed()) {
      this.state = GameState.PLAYING;
    }

    // Update screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt / 50);
    }

    switch (this.state) {
      case GameState.MENU:
        this.updateMenu();
        break;
      case GameState.PLAYING:
        this.updatePlaying(dt, time);
        break;
      case GameState.PAUSED:
        // Do nothing, just wait for unpause
        break;
      case GameState.LEVEL_COMPLETE:
        this.updateLevelComplete();
        break;
      case GameState.GAME_OVER:
        this.updateGameOver();
        break;
    }
  }

  private updateMenu(): void {
    if (this.input.isActionPressed()) {
      this.startGame();
    }
  }

  private updatePlaying(dt: number, time: number): void {
    // Update paddle
    if (this.input.isUsingMouse()) {
      this.paddle.moveTo(this.input.getMouseX());
    } else {
      if (this.input.isMovingLeft()) this.paddle.moveLeft();
      if (this.input.isMovingRight()) this.paddle.moveRight();
    }
    this.paddle.update(dt);

    // Launch ball
    if (!this.ball.isLaunched && this.input.isActionPressed()) {
      this.ball.launch();
    }

    // Update ball
    const ballAlive = this.ball.update(dt, this.paddle);

    if (!ballAlive) {
      this.loseLife();
      return;
    }

    // Ball-paddle collision
    if (this.ball.checkPaddleCollision(this.paddle)) {
      this.paddle.flash();
    }

    // Ball-brick collisions
    for (const brick of this.level.activeBricks) {
      const collision = checkBallBrickCollision(this.ball, brick);
      if (collision) {
        handleBallBrickBounce(this.ball, collision);
        const destroyed = brick.hit();

        if (destroyed) {
          this.score += brick.points;
          this.ball.increaseSpeed();
          this.screenShake = 1;

          // Emit explosion particles
          this.particles.emitExplosion(
            brick.x,
            brick.y,
            brick.color,
            brick.width,
            brick.height
          );
        }

        break; // Only handle one collision per frame
      }
    }

    // Update level and particles
    this.level.update(dt, time);
    this.particles.update(dt);

    // Check level complete
    if (this.level.isComplete()) {
      this.state = GameState.LEVEL_COMPLETE;
    }
  }

  private updateLevelComplete(): void {
    if (this.input.isActionPressed()) {
      this.level.nextLevel();
      this.ball.reset(this.paddle);
      this.state = GameState.PLAYING;
    }
  }

  private updateGameOver(): void {
    if (this.input.isActionPressed()) {
      this.startGame();
    }
  }

  private startGame(): void {
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.level.loadLevel(0);
    this.paddle.reset();
    this.ball.reset(this.paddle);
    this.particles.clear();
    this.state = GameState.PLAYING;
  }

  private loseLife(): void {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.ball.reset(this.paddle);
    }
  }

  private gameOver(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('neonBreakoutHighScore', this.highScore.toString());
    }
    this.state = GameState.GAME_OVER;
  }

  private render(time: number): void {
    const ctx = this.ctx;

    // Apply screen shake
    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake * 8;
      const shakeY = (Math.random() - 0.5) * this.screenShake * 8;
      ctx.translate(shakeX, shakeY);
    }

    // Clear with black background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background grid
    this.drawBackgroundGrid(ctx, time);

    switch (this.state) {
      case GameState.MENU:
        this.renderMenu(ctx, time);
        break;
      case GameState.PLAYING:
      case GameState.PAUSED:
        this.renderGame(ctx, time);
        if (this.state === GameState.PAUSED) {
          this.renderPauseOverlay(ctx);
        }
        break;
      case GameState.LEVEL_COMPLETE:
        this.renderGame(ctx, time);
        this.renderLevelComplete(ctx);
        break;
      case GameState.GAME_OVER:
        this.renderGame(ctx, time);
        this.renderGameOver(ctx);
        break;
    }

    ctx.restore();
  }

  private drawBackgroundGrid(ctx: CanvasRenderingContext2D, time: number): void {
    const gridSpacing = 40;
    const pulse = Math.sin(time * 0.001) * 0.2 + 0.8;

    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3 * pulse;

    // Vertical lines
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  private renderGame(ctx: CanvasRenderingContext2D, time: number): void {
    // Render particles (behind other elements)
    this.particles.render(ctx);

    // Render level (bricks)
    this.level.render(ctx, time);

    // Render ball
    this.ball.render(ctx);

    // Render paddle
    this.paddle.render(ctx);

    // Render HUD
    this.renderHUD(ctx);
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Score
    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = COLORS.text;
    ctx.shadowColor = COLORS.paddle;
    ctx.shadowBlur = 10;
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score.toString().padStart(6, '0')}`, 20, 35);

    // Lives (hearts)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF0066';
    ctx.shadowColor = '#FF0066';
    let heartsText = '';
    for (let i = 0; i < this.lives; i++) {
      heartsText += '♥ ';
    }
    ctx.fillText(heartsText.trim(), CANVAS_WIDTH / 2, 35);

    // Level
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.text;
    ctx.shadowColor = COLORS.ball;
    ctx.fillText(`LEVEL: ${this.level.currentLevel + 1}`, CANVAS_WIDTH - 20, 35);

    ctx.restore();
  }

  private renderMenu(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();

    const isMobile = this.input.isMobile();

    // Title with pulsing glow
    const pulse = Math.sin(time * 0.003) * 0.3 + 0.7;

    ctx.font = 'bold 60px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.paddle;
    ctx.shadowColor = COLORS.paddle;
    ctx.shadowBlur = 30 * pulse;
    ctx.fillText('NEON', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    ctx.fillStyle = COLORS.ball;
    ctx.shadowColor = COLORS.ball;
    ctx.fillText('BREAKOUT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    // Start prompt (blinking) - different text for mobile
    if (Math.sin(time * 0.005) > 0) {
      ctx.font = '24px "Courier New", monospace';
      ctx.fillStyle = COLORS.text;
      ctx.shadowColor = COLORS.text;
      ctx.shadowBlur = 15;
      const startText = isMobile ? 'TAP TO START' : 'PRESS SPACE TO START';
      ctx.fillText(startText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
    }

    // High score
    ctx.font = '18px "Courier New", monospace';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.fillText(`HIGH SCORE: ${this.highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 150);

    // Controls info - different for mobile vs desktop
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#666666';
    ctx.shadowBlur = 0;
    const controlsText = isMobile
      ? 'DRAG to move  |  TAP to launch'
      : '← → or MOUSE to move  |  SPACE to launch  |  P to pause';
    ctx.fillText(controlsText, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);

    ctx.restore();
  }

  private renderPauseOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const isMobile = this.input.isMobile();

    // Darken background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pause text
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.paddle;
    ctx.shadowColor = COLORS.paddle;
    ctx.shadowBlur = 20;
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = COLORS.text;
    ctx.shadowBlur = 10;
    const resumeText = isMobile ? 'Tap to resume' : 'Press P or ESC to resume';
    ctx.fillText(resumeText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

    ctx.restore();
  }

  private renderLevelComplete(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const isMobile = this.input.isMobile();

    // Darken background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Level complete text
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00FF66';
    ctx.shadowColor = '#00FF66';
    ctx.shadowBlur = 20;
    ctx.fillText('LEVEL COMPLETE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    ctx.font = '24px "Courier New", monospace';
    ctx.fillStyle = COLORS.text;
    ctx.shadowColor = COLORS.text;
    ctx.shadowBlur = 10;
    ctx.fillText(`Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    const nextText = isMobile ? 'Tap for next level' : 'Press SPACE for next level';
    ctx.fillText(nextText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);

    ctx.restore();
  }

  private renderGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const isMobile = this.input.isMobile();

    // Darken background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Game over text
    ctx.font = 'bold 60px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF0066';
    ctx.shadowColor = '#FF0066';
    ctx.shadowBlur = 25;
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

    ctx.font = '28px "Courier New", monospace';
    ctx.fillStyle = COLORS.text;
    ctx.shadowColor = COLORS.text;
    ctx.shadowBlur = 10;
    ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

    if (this.score >= this.highScore && this.score > 0) {
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FFD700';
      ctx.fillText('NEW HIGH SCORE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    }

    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = COLORS.paddle;
    ctx.shadowColor = COLORS.paddle;
    const restartText = isMobile ? 'Tap to play again' : 'Press SPACE to play again';
    ctx.fillText(restartText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);

    ctx.restore();
  }
}
