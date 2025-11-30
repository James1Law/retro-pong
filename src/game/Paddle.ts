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

  // Power-up states
  isWide: boolean = false;
  isSticky: boolean = false;
  private baseWidth: number = PADDLE_WIDTH;
  private targetWidth: number = PADDLE_WIDTH;
  private widthTransitionSpeed: number = 0.15;

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

  setWide(wide: boolean): void {
    this.isWide = wide;
    this.targetWidth = wide ? this.baseWidth * 1.5 : this.baseWidth;
  }

  setSticky(sticky: boolean): void {
    this.isSticky = sticky;
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

    // Smooth width transition
    if (Math.abs(this.width - this.targetWidth) > 0.5) {
      const oldCenterX = this.centerX;
      this.width += (this.targetWidth - this.width) * this.widthTransitionSpeed;
      // Keep paddle centered during width change
      this.x = oldCenterX - this.width / 2;
      // Clamp to screen bounds
      this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Determine color based on power-up state
    let displayColor = this.color;
    if (this.isSticky) {
      displayColor = '#00FF66'; // Green for sticky
    } else if (this.isWide) {
      displayColor = '#00FFFF'; // Brighter cyan for wide
    }

    // Glow effect
    const currentGlow = this.glowIntensity + (this.hitFlash * 20) + (this.isWide || this.isSticky ? 10 : 0);
    ctx.shadowColor = displayColor;
    ctx.shadowBlur = currentGlow;

    // Main paddle body
    ctx.fillStyle = this.hitFlash > 0 ? '#FFFFFF' : displayColor;

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

    // Sticky indicator - small dots on paddle
    if (this.isSticky) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const dotSpacing = this.width / 6;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(this.x + dotSpacing * i, this.y + this.height / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  reset(): void {
    this.width = PADDLE_WIDTH;
    this.targetWidth = PADDLE_WIDTH;
    this.x = (CANVAS_WIDTH - this.width) / 2;
    this.hitFlash = 0;
    this.isWide = false;
    this.isSticky = false;
  }
}
