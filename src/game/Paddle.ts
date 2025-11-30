import {
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  PADDLE_Y_OFFSET,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS
} from '../utils/constants';

export class Paddle {
  x: number;
  y: number;
  width: number = PADDLE_WIDTH;
  height: number = PADDLE_HEIGHT;
  speed: number = PADDLE_SPEED;
  color: string = COLORS.paddle;
  glowIntensity: number = 15;
  hitFlash: number = 0;

  constructor() {
    this.x = (CANVAS_WIDTH - this.width) / 2;
    this.y = CANVAS_HEIGHT - PADDLE_Y_OFFSET;
  }

  get centerX(): number {
    return this.x + this.width / 2;
  }

  get centerY(): number {
    return this.y + this.height / 2;
  }

  moveLeft(): void {
    this.x = Math.max(0, this.x - this.speed);
  }

  moveRight(): void {
    this.x = Math.min(CANVAS_WIDTH - this.width, this.x + this.speed);
  }

  moveTo(mouseX: number): void {
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, mouseX - this.width / 2));
  }

  flash(): void {
    this.hitFlash = 1;
  }

  update(dt: number): void {
    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt / 100);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Glow effect
    const currentGlow = this.glowIntensity + (this.hitFlash * 20);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = currentGlow;

    // Main paddle body
    ctx.fillStyle = this.hitFlash > 0 ? '#FFFFFF' : this.color;

    // Rounded rectangle
    const radius = this.height / 2;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, radius);
    ctx.fill();

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + this.hitFlash * 0.3})`;
    ctx.beginPath();
    ctx.roundRect(this.x + 4, this.y + 2, this.width - 8, this.height / 3, radius / 2);
    ctx.fill();

    ctx.restore();
  }

  reset(): void {
    this.x = (CANVAS_WIDTH - this.width) / 2;
    this.hitFlash = 0;
  }
}
