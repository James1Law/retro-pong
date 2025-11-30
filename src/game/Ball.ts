import {
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  TRAIL_LENGTH
} from '../utils/constants';
import { TrailPoint } from '../types';
import { Paddle } from './Paddle';

export class Ball {
  x: number;
  y: number;
  radius: number = BALL_RADIUS;
  velocityX: number = 0;
  velocityY: number = 0;
  speed: number = BALL_INITIAL_SPEED;
  color: string = COLORS.ball;
  glowIntensity: number = 20;
  isLaunched: boolean = false;
  trail: TrailPoint[] = [];

  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT - 100;
  }

  launch(): void {
    if (!this.isLaunched) {
      this.isLaunched = true;
      // Random angle between -45 and 45 degrees, going up
      const angle = (Math.random() - 0.5) * Math.PI / 2;
      this.velocityX = Math.sin(angle) * this.speed;
      this.velocityY = -Math.cos(angle) * this.speed;
    }
  }

  update(_dt: number, paddle: Paddle): boolean {
    if (!this.isLaunched) {
      // Ball follows paddle before launch
      this.x = paddle.centerX;
      this.y = paddle.y - this.radius - 2;
      return true;
    }

    // Add current position to trail
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > TRAIL_LENGTH) {
      this.trail.pop();
    }

    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Wall collisions
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.velocityX = Math.abs(this.velocityX);
    } else if (this.x + this.radius >= CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.radius;
      this.velocityX = -Math.abs(this.velocityX);
    }

    if (this.y - this.radius <= 0) {
      this.y = this.radius;
      this.velocityY = Math.abs(this.velocityY);
    }

    // Check if ball fell below screen
    if (this.y - this.radius > CANVAS_HEIGHT) {
      return false; // Lost life
    }

    return true;
  }

  checkPaddleCollision(paddle: Paddle): boolean {
    // Check if ball is in paddle's vertical range
    if (this.y + this.radius >= paddle.y &&
        this.y - this.radius <= paddle.y + paddle.height &&
        this.velocityY > 0) {
      // Check horizontal overlap
      if (this.x + this.radius >= paddle.x &&
          this.x - this.radius <= paddle.x + paddle.width) {

        // Calculate hit position (-1 to 1)
        const hitPosition = (this.x - paddle.centerX) / (paddle.width / 2);

        // Adjust angle based on hit position
        const maxAngle = Math.PI / 3; // 60 degrees
        const angle = hitPosition * maxAngle;

        this.velocityX = Math.sin(angle) * this.speed;
        this.velocityY = -Math.cos(angle) * this.speed;

        // Make sure ball is above paddle
        this.y = paddle.y - this.radius;

        return true;
      }
    }
    return false;
  }

  increaseSpeed(): void {
    if (this.speed < BALL_MAX_SPEED) {
      this.speed += BALL_SPEED_INCREMENT;
      // Normalize velocity to new speed
      const currentSpeed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
      if (currentSpeed > 0) {
        this.velocityX = (this.velocityX / currentSpeed) * this.speed;
        this.velocityY = (this.velocityY / currentSpeed) * this.speed;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render trail
    this.renderTrail(ctx);

    ctx.save();

    // Glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.glowIntensity;

    // Main ball
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderTrail(ctx: CanvasRenderingContext2D): void {
    this.trail.forEach((point, index) => {
      const alpha = 1 - (index / TRAIL_LENGTH);
      const size = this.radius * (1 - index / TRAIL_LENGTH * 0.5);

      ctx.save();
      ctx.globalAlpha = alpha * 0.4;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  reset(paddle: Paddle): void {
    this.isLaunched = false;
    this.speed = BALL_INITIAL_SPEED;
    this.velocityX = 0;
    this.velocityY = 0;
    this.x = paddle.centerX;
    this.y = paddle.y - this.radius - 2;
    this.trail = [];
  }
}
