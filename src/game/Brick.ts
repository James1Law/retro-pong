import { BrickType } from '../types';
import { POINTS } from '../utils/constants';

export class Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  hits: number;
  maxHits: number;
  color: string;
  points: number;
  isDestroyed: boolean = false;
  pulsePhase: number;
  hitFlash: number = 0;
  crackLevel: number = 0;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    type: BrickType,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.color = color;
    this.pulsePhase = Math.random() * Math.PI * 2;

    // Set hits based on type
    switch (type) {
      case BrickType.STANDARD:
        this.maxHits = 1;
        this.points = POINTS.STANDARD;
        break;
      case BrickType.MEDIUM:
        this.maxHits = 2;
        this.points = POINTS.MEDIUM;
        break;
      case BrickType.STRONG:
        this.maxHits = 3;
        this.points = POINTS.STRONG;
        break;
      case BrickType.INDESTRUCTIBLE:
        this.maxHits = Infinity;
        this.points = 0;
        break;
      default:
        this.maxHits = 1;
        this.points = POINTS.STANDARD;
    }
    this.hits = this.maxHits;
  }

  hit(): boolean {
    if (this.type === BrickType.INDESTRUCTIBLE) {
      this.hitFlash = 1;
      return false;
    }

    this.hits--;
    this.hitFlash = 1;
    this.crackLevel = 1 - (this.hits / this.maxHits);

    if (this.hits <= 0) {
      this.isDestroyed = true;
      return true;
    }
    return false;
  }

  update(dt: number, time: number): void {
    this.pulsePhase = time * 0.003;

    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt / 100);
    }
  }

  render(ctx: CanvasRenderingContext2D, time: number): void {
    if (this.isDestroyed) return;

    ctx.save();

    // Pulsing glow intensity
    const pulse = Math.sin(this.pulsePhase + time * 0.002) * 0.3 + 0.7;
    const glowIntensity = 10 + (pulse * 5) + (this.hitFlash * 15);

    // Glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = glowIntensity;

    // Main brick body
    const displayColor = this.hitFlash > 0.5 ? '#FFFFFF' : this.color;
    ctx.fillStyle = displayColor;

    // Rounded corners
    const radius = 4;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, radius);
    ctx.fill();

    // Inner border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4, radius - 1);
    ctx.stroke();

    // Crack overlay for damaged bricks
    if (this.crackLevel > 0 && this.type !== BrickType.INDESTRUCTIBLE) {
      this.renderCracks(ctx);
    }

    // Indestructible indicator
    if (this.type === BrickType.INDESTRUCTIBLE) {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, radius);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderCracks(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = `rgba(0, 0, 0, ${this.crackLevel * 0.7})`;
    ctx.lineWidth = 2;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Draw crack lines based on damage level
    ctx.beginPath();
    if (this.crackLevel >= 0.33) {
      ctx.moveTo(centerX - 10, centerY - 5);
      ctx.lineTo(centerX + 5, centerY + 8);
    }
    if (this.crackLevel >= 0.66) {
      ctx.moveTo(centerX + 10, centerY - 8);
      ctx.lineTo(centerX - 5, centerY + 5);
    }
    ctx.stroke();
    ctx.restore();
  }

  get centerX(): number {
    return this.x + this.width / 2;
  }

  get centerY(): number {
    return this.y + this.height / 2;
  }
}
