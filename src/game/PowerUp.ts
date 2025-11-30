import { PowerUpType } from '../types';
import {
  POWERUP_FALL_SPEED,
  POWERUP_WIDTH,
  POWERUP_HEIGHT,
  POWERUP_COLORS,
  CANVAS_HEIGHT
} from '../utils/constants';

interface PowerUpVisuals {
  color: string;
  glow: string;
  symbol: string;
}

export class PowerUp {
  x: number;
  y: number;
  width: number = POWERUP_WIDTH;
  height: number = POWERUP_HEIGHT;
  type: PowerUpType;
  velocityY: number = POWERUP_FALL_SPEED;
  isCollected: boolean = false;
  isExpired: boolean = false;

  private visuals: PowerUpVisuals;
  private pulsePhase: number = Math.random() * Math.PI * 2;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x - this.width / 2;
    this.y = y;
    this.type = type;
    this.visuals = this.getVisuals(type);
  }

  private getVisuals(type: PowerUpType): PowerUpVisuals {
    switch (type) {
      case PowerUpType.MULTI_BALL:
        return POWERUP_COLORS.MULTI_BALL;
      case PowerUpType.WIDE_PADDLE:
        return POWERUP_COLORS.WIDE_PADDLE;
      case PowerUpType.SLOW_MO:
        return POWERUP_COLORS.SLOW_MO;
      case PowerUpType.EXTRA_LIFE:
        return POWERUP_COLORS.EXTRA_LIFE;
      case PowerUpType.FIRE_BALL:
        return POWERUP_COLORS.FIRE_BALL;
      case PowerUpType.STICKY_PADDLE:
        return POWERUP_COLORS.STICKY_PADDLE;
      default:
        return POWERUP_COLORS.MULTI_BALL;
    }
  }

  update(_dt: number, time: number): void {
    this.y += this.velocityY;
    this.pulsePhase = time * 0.005;

    // Check if fallen off screen
    if (this.y > CANVAS_HEIGHT) {
      this.isExpired = true;
    }
  }

  checkPaddleCollision(paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number): boolean {
    if (this.isCollected || this.isExpired) return false;

    // Simple AABB collision
    if (this.x < paddleX + paddleWidth &&
        this.x + this.width > paddleX &&
        this.y < paddleY + paddleHeight &&
        this.y + this.height > paddleY) {
      this.isCollected = true;
      return true;
    }
    return false;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.isCollected || this.isExpired) return;

    ctx.save();

    const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    const glowIntensity = 15 + pulse * 10;

    // Glow effect
    ctx.shadowColor = this.visuals.glow;
    ctx.shadowBlur = glowIntensity;

    // Capsule shape background
    const radius = this.height / 2;
    ctx.fillStyle = this.visuals.color;
    ctx.globalAlpha = 0.9;

    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, radius);
    ctx.fill();

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * pulse})`;
    ctx.beginPath();
    ctx.roundRect(this.x + 3, this.y + 2, this.width - 6, this.height / 3, radius / 2);
    ctx.fill();

    // Symbol text
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.visuals.symbol, this.x + this.width / 2, this.y + this.height / 2 + 1);

    ctx.restore();
  }

  static getRandomType(): PowerUpType {
    const types = Object.values(PowerUpType);
    return types[Math.floor(Math.random() * types.length)];
  }
}
