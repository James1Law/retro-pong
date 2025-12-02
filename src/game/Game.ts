import { GameState, PowerUpType } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INITIAL_LIVES,
  COLORS,
  POWERUP_DURATIONS
} from '../utils/constants';
import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Level } from './Level';
import { InputManager } from './InputManager';
import { ParticleSystem } from '../effects/ParticleSystem';
import { PowerUpManager } from './PowerUpManager';
import { checkBallBrickCollision, handleBallBrickBounce } from './Collision';
import { audioManager } from '../audio/AudioManager';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;

  private paddle: Paddle;
  private balls: Ball[] = [];
  private level: Level;
  private particles: ParticleSystem;
  private powerUpManager: PowerUpManager;

  private state: GameState = GameState.MENU;
  private previousState: GameState = GameState.MENU;
  private score: number = 0;
  private lives: number = INITIAL_LIVES;
  private highScore: number = 0;

  private lastTime: number = 0;
  private screenShake: number = 0;
  private pauseKeyReleased: boolean = true;

  // Settings
  private screenShakeEnabled: boolean = true;

  // Settings UI layout constants
  private readonly SETTINGS_COG_SIZE = 40;
  private readonly SETTINGS_COG_PADDING = 20;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.input = new InputManager(canvas);
    this.paddle = new Paddle();
    this.balls = [new Ball()];
    this.level = new Level();
    this.particles = new ParticleSystem();
    this.powerUpManager = new PowerUpManager();

    // Set up power-up callbacks
    this.setupPowerUpCallbacks();

    // Load high score
    const savedHighScore = localStorage.getItem('lawsBreakoutHighScore');
    if (savedHighScore) {
      this.highScore = parseInt(savedHighScore, 10);
    }

    // Load screen shake setting
    const savedScreenShake = localStorage.getItem('lawsBreakoutScreenShake');
    if (savedScreenShake !== null) {
      this.screenShakeEnabled = savedScreenShake === 'true';
    }
  }

  private setupPowerUpCallbacks(): void {
    this.powerUpManager.onWidePaddle = (active) => {
      this.paddle.setWide(active);
    };

    this.powerUpManager.onStickyPaddle = (active) => {
      this.paddle.setSticky(active);
    };

    this.powerUpManager.onSlowMo = (active) => {
      this.balls.forEach(ball => ball.setSlowMo(active));
    };

    this.powerUpManager.onFireBall = (active) => {
      this.balls.forEach(ball => ball.setFireBall(active));
    };

    this.powerUpManager.onMultiBall = () => {
      this.spawnMultiBalls();
    };

    this.powerUpManager.onExtraLife = () => {
      this.lives++;
    };

    this.powerUpManager.onPowerUpCollect = (type) => {
      if (type === PowerUpType.MULTI_BALL) {
        audioManager.multiBall();
      } else if (type === PowerUpType.EXTRA_LIFE) {
        audioManager.extraLife();
      } else {
        audioManager.powerUpCollect();
      }
    };
  }

  private spawnMultiBalls(): void {
    // Find an active ball to clone
    const activeBall = this.balls.find(b => b.isLaunched && !b.isStuckToPaddle);
    if (!activeBall) return;

    // Create 2 additional balls at different angles
    for (let i = 0; i < 2; i++) {
      const newBall = activeBall.clone();
      const angleOffset = (i === 0 ? -1 : 1) * (Math.PI / 6); // +/- 30 degrees

      const currentAngle = Math.atan2(newBall.velocityX, -newBall.velocityY);
      const newAngle = currentAngle + angleOffset;

      newBall.velocityX = Math.sin(newAngle) * newBall.speed;
      newBall.velocityY = -Math.cos(newAngle) * newBall.speed;

      this.setupBallCallbacks(newBall);
      this.balls.push(newBall);
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
        this.updatePaused();
        break;
      case GameState.LEVEL_COMPLETE:
        this.updateLevelComplete();
        break;
      case GameState.GAME_OVER:
        this.updateGameOver();
        break;
      case GameState.SETTINGS:
        this.updateSettings();
        break;
    }
  }

  private updateMenu(): void {
    // Check for settings cog click first
    const cogX = CANVAS_WIDTH - this.SETTINGS_COG_SIZE - this.SETTINGS_COG_PADDING;
    const cogY = this.SETTINGS_COG_PADDING;
    if (this.input.consumeClickInRect(cogX, cogY, this.SETTINGS_COG_SIZE, this.SETTINGS_COG_SIZE)) {
      this.openSettings();
      return;
    }

    if (this.input.isActionPressed()) {
      this.startGame();
    }
  }

  private updatePaused(): void {
    // Check for settings cog click first
    const cogX = CANVAS_WIDTH - this.SETTINGS_COG_SIZE - this.SETTINGS_COG_PADDING;
    const cogY = this.SETTINGS_COG_PADDING;
    if (this.input.consumeClickInRect(cogX, cogY, this.SETTINGS_COG_SIZE, this.SETTINGS_COG_SIZE)) {
      this.openSettings();
      return;
    }

    // On mobile, allow tap to resume from pause (after settings cog check)
    if (this.input.isMobile() && this.input.isActionPressed()) {
      this.state = GameState.PLAYING;
    }
  }

  private openSettings(): void {
    audioManager.menuBlip();
    this.previousState = this.state;
    this.state = GameState.SETTINGS;
  }

  private closeSettings(): void {
    audioManager.menuBlip();
    this.state = this.previousState;
  }

  private updateSettings(): void {
    const isMobile = this.input.isMobile();
    const centerX = CANVAS_WIDTH / 2;
    const startY = 180;
    const rowHeight = 70;
    const buttonWidth = isMobile ? 200 : 180;
    const buttonHeight = isMobile ? 50 : 40;
    const sliderWidth = isMobile ? 250 : 200;
    const sliderHeight = isMobile ? 40 : 30;

    // Sound toggle button (row 0)
    const soundToggleX = centerX - buttonWidth / 2;
    const soundToggleY = startY;
    if (this.input.consumeClickInRect(soundToggleX, soundToggleY, buttonWidth, buttonHeight)) {
      audioManager.toggleMute();
      audioManager.menuBlip();
      return;
    }

    // Volume slider (row 1)
    const volumeSliderX = centerX - sliderWidth / 2;
    const volumeSliderY = startY + rowHeight;
    const clickPos = this.input.getClickPosition();
    if (this.input.consumeClickInRect(volumeSliderX, volumeSliderY, sliderWidth, sliderHeight + 20)) {
      if (clickPos) {
        const relativeX = clickPos.x - volumeSliderX;
        const newVolume = Math.max(0, Math.min(1, relativeX / sliderWidth));
        audioManager.volume = newVolume;
        if (audioManager.muted && newVolume > 0) {
          audioManager.muted = false;
        }
        audioManager.menuBlip();
      }
      return;
    }

    // Screen shake toggle button (row 2)
    const shakeToggleX = centerX - buttonWidth / 2;
    const shakeToggleY = startY + rowHeight * 2;
    if (this.input.consumeClickInRect(shakeToggleX, shakeToggleY, buttonWidth, buttonHeight)) {
      this.screenShakeEnabled = !this.screenShakeEnabled;
      localStorage.setItem('lawsBreakoutScreenShake', String(this.screenShakeEnabled));
      audioManager.menuBlip();
      return;
    }

    // Back button (row 3)
    const backButtonX = centerX - buttonWidth / 2;
    const backButtonY = startY + rowHeight * 3 + 20;
    if (this.input.consumeClickInRect(backButtonX, backButtonY, buttonWidth, buttonHeight)) {
      this.closeSettings();
      return;
    }

    // Also allow Escape/P to close settings
    if (this.input.isPausePressed() && this.pauseKeyReleased) {
      this.pauseKeyReleased = false;
      this.closeSettings();
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

    // Handle ball launch (including from sticky paddle)
    if (this.input.isActionPressed()) {
      this.balls.forEach(ball => {
        if (!ball.isLaunched || ball.isStuckToPaddle) {
          ball.launch();
          audioManager.launch();
        }
      });
    }

    // Update all balls
    const ballsToRemove: Ball[] = [];

    for (const ball of this.balls) {
      const ballAlive = ball.update(dt, this.paddle);

      if (!ballAlive) {
        ballsToRemove.push(ball);
        continue;
      }

      // Ball-paddle collision
      if (ball.checkPaddleCollision(this.paddle)) {
        this.paddle.flash();
        audioManager.paddleHit();
      }

      // Ball-brick collisions
      for (const brick of this.level.activeBricks) {
        const collision = checkBallBrickCollision(ball, brick);
        if (collision) {
          // Fire ball doesn't bounce, just destroys
          if (!ball.isFireBall) {
            handleBallBrickBounce(ball, collision);
          }

          const destroyed = brick.hit();

          if (destroyed) {
            this.score += brick.points;
            ball.increaseSpeed();
            this.screenShake = 1;
            audioManager.brickDestroy();

            // Emit explosion particles
            this.particles.emitExplosion(
              brick.x,
              brick.y,
              brick.color,
              brick.width,
              brick.height
            );

            // Spawn power-up
            this.powerUpManager.spawnPowerUp(
              brick.x + brick.width / 2,
              brick.y + brick.height / 2
            );
          } else {
            audioManager.brickHit();
          }

          // Fire ball can hit multiple bricks
          if (!ball.isFireBall) {
            break;
          }
        }
      }
    }

    // Remove dead balls
    this.balls = this.balls.filter(b => !ballsToRemove.includes(b));

    // Check if all balls are lost
    if (this.balls.length === 0) {
      this.loseLife();
      return;
    }

    // Update power-ups
    this.powerUpManager.update(
      dt,
      time,
      this.paddle.x,
      this.paddle.y,
      this.paddle.width,
      this.paddle.height
    );

    // Update level and particles
    this.level.update(dt, time);
    this.particles.update(dt);

    // Check level complete
    if (this.level.isComplete()) {
      this.state = GameState.LEVEL_COMPLETE;
      audioManager.levelComplete();
    }
  }

  private updateLevelComplete(): void {
    if (this.input.isActionPressed()) {
      this.level.nextLevel();
      this.resetBalls();
      this.powerUpManager.clearFallingPowerUps();
      this.state = GameState.PLAYING;
    }
  }

  private updateGameOver(): void {
    if (this.input.isActionPressed()) {
      this.startGame();
    }
  }

  private startGame(): void {
    // Initialize audio on first user interaction
    audioManager.init();
    audioManager.resume();
    audioManager.testBeep(); // Debug: test if basic audio works
    audioManager.gameStart();

    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.level.loadLevel(0);
    this.paddle.reset();
    this.resetBalls();
    this.particles.clear();
    this.powerUpManager.clear();
    this.state = GameState.PLAYING;
  }

  private resetBalls(): void {
    this.balls = [new Ball()];
    this.balls[0].reset(this.paddle);
    this.setupBallCallbacks(this.balls[0]);
  }

  private setupBallCallbacks(ball: Ball): void {
    ball.onWallHit = () => audioManager.wallHit();
  }

  private loseLife(): void {
    this.lives--;
    this.powerUpManager.clear();
    this.paddle.reset();
    audioManager.loseLife();

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.resetBalls();
    }
  }

  private gameOver(): void {
    const isNewHighScore = this.score > this.highScore;
    if (isNewHighScore) {
      this.highScore = this.score;
      localStorage.setItem('lawsBreakoutHighScore', this.highScore.toString());
    }
    this.state = GameState.GAME_OVER;

    // Play game over sound, then high score jingle if applicable
    audioManager.gameOver();
    if (isNewHighScore && this.score > 0) {
      setTimeout(() => audioManager.newHighScore(), 1200);
    }
  }

  private render(time: number): void {
    const ctx = this.ctx;

    // Apply screen shake (if enabled)
    ctx.save();
    if (this.screenShakeEnabled && this.screenShake > 0) {
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
          this.renderPauseOverlay(ctx, time);
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
      case GameState.SETTINGS:
        this.renderSettingsBackground(ctx, time);
        this.renderSettings(ctx, time);
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

    // Render power-ups
    this.powerUpManager.render(ctx);

    // Render all balls
    this.balls.forEach(ball => ball.render(ctx));

    // Render paddle
    this.paddle.render(ctx);

    // Render HUD
    this.renderHUD(ctx, time);
  }

  private renderHUD(ctx: CanvasRenderingContext2D, time: number): void {
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

    // Active power-ups display
    this.renderActivePowerUps(ctx, time);

    ctx.restore();
  }

  private renderActivePowerUps(ctx: CanvasRenderingContext2D, time: number): void {
    const powerUps: { type: PowerUpType; color: string; symbol: string; duration: number }[] = [
      { type: PowerUpType.WIDE_PADDLE, color: '#00FFFF', symbol: '◄►', duration: POWERUP_DURATIONS.WIDE_PADDLE },
      { type: PowerUpType.SLOW_MO, color: '#FFFF00', symbol: '◷', duration: POWERUP_DURATIONS.SLOW_MO },
      { type: PowerUpType.FIRE_BALL, color: '#FF6600', symbol: '●', duration: POWERUP_DURATIONS.FIRE_BALL },
      { type: PowerUpType.STICKY_PADDLE, color: '#00FF66', symbol: '▬', duration: POWERUP_DURATIONS.STICKY_PADDLE },
    ];

    let offsetX = 20;
    const y = CANVAS_HEIGHT - 30;

    ctx.font = '16px "Courier New", monospace';
    ctx.textAlign = 'left';

    for (const pu of powerUps) {
      if (this.powerUpManager.isEffectActive(pu.type)) {
        const remaining = this.powerUpManager.getEffectTimeRemaining(pu.type, time);
        const seconds = Math.ceil(remaining / 1000);
        const pulse = Math.sin(time * 0.01) * 0.3 + 0.7;

        ctx.fillStyle = pu.color;
        ctx.shadowColor = pu.color;
        ctx.shadowBlur = 10 * pulse;
        ctx.fillText(`${pu.symbol} ${seconds}s`, offsetX, y);

        offsetX += 70;
      }
    }
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
    ctx.fillText("LAW'S", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

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

    // Settings cog icon
    this.renderSettingsCog(ctx, time);

    ctx.restore();
  }

  private renderPauseOverlay(ctx: CanvasRenderingContext2D, time: number): void {
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

    // Settings cog icon
    this.renderSettingsCog(ctx, time);

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

  private renderSettingsCog(ctx: CanvasRenderingContext2D, time: number): void {
    const cogX = CANVAS_WIDTH - this.SETTINGS_COG_SIZE - this.SETTINGS_COG_PADDING;
    const cogY = this.SETTINGS_COG_PADDING;
    const centerX = cogX + this.SETTINGS_COG_SIZE / 2;
    const centerY = cogY + this.SETTINGS_COG_SIZE / 2;
    const outerRadius = this.SETTINGS_COG_SIZE / 2 - 4;
    const innerRadius = outerRadius * 0.5;
    const teethCount = 8;
    const teethDepth = outerRadius * 0.25;

    // Slow rotation animation
    const rotation = (time * 0.0005) % (Math.PI * 2);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    // Pulsing glow
    const pulse = Math.sin(time * 0.003) * 0.3 + 0.7;

    ctx.fillStyle = '#888888';
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 10 * pulse;

    // Draw gear teeth
    ctx.beginPath();
    for (let i = 0; i < teethCount; i++) {
      const angle = (i / teethCount) * Math.PI * 2;
      const toothAngle = ((i + 0.25) / teethCount) * Math.PI * 2;
      const toothEndAngle = ((i + 0.75) / teethCount) * Math.PI * 2;

      if (i === 0) {
        ctx.moveTo(
          Math.cos(angle) * outerRadius,
          Math.sin(angle) * outerRadius
        );
      }

      // Outer arc to tooth start
      ctx.arc(0, 0, outerRadius, angle, toothAngle, false);

      // Tooth outer edge
      ctx.lineTo(
        Math.cos(toothAngle) * (outerRadius + teethDepth),
        Math.sin(toothAngle) * (outerRadius + teethDepth)
      );
      ctx.lineTo(
        Math.cos(toothEndAngle) * (outerRadius + teethDepth),
        Math.sin(toothEndAngle) * (outerRadius + teethDepth)
      );

      // Back to outer radius
      ctx.lineTo(
        Math.cos(toothEndAngle) * outerRadius,
        Math.sin(toothEndAngle) * outerRadius
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw center hole
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.background;
    ctx.fill();
    ctx.strokeStyle = '#00FFFF';
    ctx.stroke();

    ctx.restore();
  }

  private renderSettingsBackground(ctx: CanvasRenderingContext2D, time: number): void {
    // If coming from a game state, render the game in the background
    if (this.previousState === GameState.PLAYING || this.previousState === GameState.PAUSED) {
      this.renderGame(ctx, time);
    }
    // Otherwise render menu background
    else {
      this.renderMenu(ctx, time);
    }
  }

  private renderSettings(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();

    const isMobile = this.input.isMobile();
    const centerX = CANVAS_WIDTH / 2;
    const startY = 180;
    const rowHeight = 70;
    const buttonWidth = isMobile ? 200 : 180;
    const buttonHeight = isMobile ? 50 : 40;
    const sliderWidth = isMobile ? 250 : 200;
    const sliderHeight = isMobile ? 40 : 30;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    const pulse = Math.sin(time * 0.003) * 0.3 + 0.7;
    ctx.font = 'bold 40px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00FFFF';
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 20 * pulse;
    ctx.fillText('SETTINGS', centerX, 100);

    // Sound toggle (row 0)
    ctx.font = `${isMobile ? 20 : 18}px "Courier New", monospace`;
    ctx.fillStyle = '#AAAAAA';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'right';
    ctx.fillText('SOUND:', centerX - buttonWidth / 2 - 20, startY + buttonHeight / 2 + 6);

    this.renderButton(
      ctx,
      centerX - buttonWidth / 2,
      startY,
      buttonWidth,
      buttonHeight,
      audioManager.muted ? 'OFF' : 'ON',
      audioManager.muted ? '#FF4444' : '#44FF44',
      time
    );

    // Volume slider (row 1)
    const volumeY = startY + rowHeight;
    ctx.fillStyle = '#AAAAAA';
    ctx.textAlign = 'right';
    ctx.fillText('VOLUME:', centerX - sliderWidth / 2 - 20, volumeY + sliderHeight / 2 + 6);

    this.renderSlider(
      ctx,
      centerX - sliderWidth / 2,
      volumeY,
      sliderWidth,
      sliderHeight,
      audioManager.volume,
      time
    );

    // Screen shake toggle (row 2)
    const shakeY = startY + rowHeight * 2;
    ctx.fillStyle = '#AAAAAA';
    ctx.textAlign = 'right';
    ctx.fillText('SHAKE:', centerX - buttonWidth / 2 - 20, shakeY + buttonHeight / 2 + 6);

    this.renderButton(
      ctx,
      centerX - buttonWidth / 2,
      shakeY,
      buttonWidth,
      buttonHeight,
      this.screenShakeEnabled ? 'ON' : 'OFF',
      this.screenShakeEnabled ? '#44FF44' : '#FF4444',
      time
    );

    // Back button (row 3)
    const backY = startY + rowHeight * 3 + 20;
    this.renderButton(
      ctx,
      centerX - buttonWidth / 2,
      backY,
      buttonWidth,
      buttonHeight,
      '< BACK',
      '#00FFFF',
      time
    );

    // Instructions
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#666666';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    const instructionText = isMobile ? 'Tap options to change' : 'Click options to change | ESC to close';
    ctx.fillText(instructionText, centerX, CANVAS_HEIGHT - 40);

    ctx.restore();
  }

  private renderButton(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: string,
    time: number
  ): void {
    ctx.save();

    const pulse = Math.sin(time * 0.005) * 0.2 + 0.8;

    // Button background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 * pulse;

    // Rounded rectangle
    const radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Button text
    ctx.font = `bold ${height * 0.45}px "Courier New", monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);

    ctx.restore();
  }

  private renderSlider(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    time: number
  ): void {
    ctx.save();

    const pulse = Math.sin(time * 0.005) * 0.2 + 0.8;
    const fillWidth = width * value;
    const knobRadius = height / 2 - 2;
    const knobX = x + fillWidth;

    // Track background
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 5;

    // Rounded rectangle track
    const radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Filled portion
    if (value > 0.02) {
      ctx.fillStyle = '#00FFFF';
      ctx.shadowBlur = 10 * pulse;
      ctx.beginPath();
      ctx.moveTo(x + radius, y + 2);
      const clampedWidth = Math.max(radius, fillWidth);
      ctx.lineTo(x + clampedWidth - 2, y + 2);
      ctx.lineTo(x + clampedWidth - 2, y + height - 2);
      ctx.lineTo(x + radius, y + height - 2);
      ctx.quadraticCurveTo(x + 2, y + height - 2, x + 2, y + height / 2);
      ctx.quadraticCurveTo(x + 2, y + 2, x + radius, y + 2);
      ctx.closePath();
      ctx.fill();
    }

    // Knob
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 15 * pulse;
    ctx.beginPath();
    ctx.arc(Math.max(x + knobRadius + 2, Math.min(x + width - knobRadius - 2, knobX)), y + height / 2, knobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Volume percentage text
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText(`${Math.round(value * 100)}%`, x + width / 2, y + height + 18);

    ctx.restore();
  }
}
