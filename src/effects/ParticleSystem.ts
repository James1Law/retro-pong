import { Particle } from '../types';
import { PARTICLE_COUNT, PARTICLE_LIFE, PARTICLE_SPEED } from '../utils/constants';

export class ParticleSystem {
  particles: Particle[] = [];

  emit(x: number, y: number, color: string, count: number = PARTICLE_COUNT): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = PARTICLE_SPEED * (0.5 + Math.random());

      this.particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: PARTICLE_LIFE,
        maxLife: PARTICLE_LIFE,
        color,
        size: 2 + Math.random() * 4
      });
    }
  }

  // Emit particles in an explosion pattern
  emitExplosion(x: number, y: number, color: string, width: number, height: number): void {
    const count = PARTICLE_COUNT + 5;

    for (let i = 0; i < count; i++) {
      // Spawn particles across the brick area
      const spawnX = x + Math.random() * width;
      const spawnY = y + Math.random() * height;

      const angle = Math.random() * Math.PI * 2;
      const speed = PARTICLE_SPEED * (0.3 + Math.random() * 0.7);

      this.particles.push({
        x: spawnX,
        y: spawnY,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - 2, // Slight upward bias
        life: PARTICLE_LIFE * (0.5 + Math.random() * 0.5),
        maxLife: PARTICLE_LIFE,
        color,
        size: 2 + Math.random() * 5
      });
    }

    // Add some brighter sparkle particles
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = PARTICLE_SPEED * 1.5;

      this.particles.push({
        x: x + width / 2,
        y: y + height / 2,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: PARTICLE_LIFE * 0.6,
        maxLife: PARTICLE_LIFE * 0.6,
        color: '#FFFFFF',
        size: 3 + Math.random() * 3
      });
    }
  }

  update(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.velocityY += 0.15; // Gravity
      p.velocityX *= 0.98; // Air resistance
      p.velocityY *= 0.98;
      p.life -= dt / 1000;
      return p.life > 0;
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      const size = p.size * alpha;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  clear(): void {
    this.particles = [];
  }
}
