import { PowerUpType } from '../types';
import { PowerUp } from './PowerUp';
import { POWERUP_DROP_CHANCE, POWERUP_DURATIONS } from '../utils/constants';

interface ActiveEffect {
  type: PowerUpType;
  endTime: number;
}

export class PowerUpManager {
  powerUps: PowerUp[] = [];
  activeEffects: ActiveEffect[] = [];

  // Callbacks to be set by Game
  onWidePaddle: ((active: boolean) => void) | null = null;
  onSlowMo: ((active: boolean) => void) | null = null;
  onFireBall: ((active: boolean) => void) | null = null;
  onStickyPaddle: ((active: boolean) => void) | null = null;
  onMultiBall: (() => void) | null = null;
  onExtraLife: (() => void) | null = null;
  onPowerUpCollect: ((type: PowerUpType) => void) | null = null;

  spawnPowerUp(x: number, y: number): void {
    // Random chance to spawn
    if (Math.random() > POWERUP_DROP_CHANCE) return;

    const type = PowerUp.getRandomType();
    const powerUp = new PowerUp(x, y, type);
    this.powerUps.push(powerUp);
  }

  update(dt: number, time: number, paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number): void {
    // Update falling power-ups
    this.powerUps.forEach(powerUp => {
      powerUp.update(dt, time);

      // Check collision with paddle
      if (powerUp.checkPaddleCollision(paddleX, paddleY, paddleWidth, paddleHeight)) {
        this.activatePowerUp(powerUp.type, time);
      }
    });

    // Remove collected or expired power-ups
    this.powerUps = this.powerUps.filter(p => !p.isCollected && !p.isExpired);

    // Update active effects timers
    this.updateActiveEffects(time);
  }

  private activatePowerUp(type: PowerUpType, time: number): void {
    // Notify for sound effect
    this.onPowerUpCollect?.(type);

    switch (type) {
      case PowerUpType.MULTI_BALL:
        this.onMultiBall?.();
        break;

      case PowerUpType.EXTRA_LIFE:
        this.onExtraLife?.();
        break;

      case PowerUpType.WIDE_PADDLE:
        this.addTimedEffect(type, time, POWERUP_DURATIONS.WIDE_PADDLE);
        this.onWidePaddle?.(true);
        break;

      case PowerUpType.SLOW_MO:
        this.addTimedEffect(type, time, POWERUP_DURATIONS.SLOW_MO);
        this.onSlowMo?.(true);
        break;

      case PowerUpType.FIRE_BALL:
        this.addTimedEffect(type, time, POWERUP_DURATIONS.FIRE_BALL);
        this.onFireBall?.(true);
        break;

      case PowerUpType.STICKY_PADDLE:
        this.addTimedEffect(type, time, POWERUP_DURATIONS.STICKY_PADDLE);
        this.onStickyPaddle?.(true);
        break;
    }
  }

  private addTimedEffect(type: PowerUpType, currentTime: number, duration: number): void {
    // Check if effect is already active - extend it
    const existing = this.activeEffects.find(e => e.type === type);
    if (existing) {
      existing.endTime = currentTime + duration;
    } else {
      this.activeEffects.push({
        type,
        endTime: currentTime + duration
      });
    }
  }

  private updateActiveEffects(currentTime: number): void {
    this.activeEffects = this.activeEffects.filter(effect => {
      if (currentTime >= effect.endTime) {
        // Effect expired - deactivate
        this.deactivateEffect(effect.type);
        return false;
      }
      return true;
    });
  }

  private deactivateEffect(type: PowerUpType): void {
    switch (type) {
      case PowerUpType.WIDE_PADDLE:
        this.onWidePaddle?.(false);
        break;
      case PowerUpType.SLOW_MO:
        this.onSlowMo?.(false);
        break;
      case PowerUpType.FIRE_BALL:
        this.onFireBall?.(false);
        break;
      case PowerUpType.STICKY_PADDLE:
        this.onStickyPaddle?.(false);
        break;
    }
  }

  isEffectActive(type: PowerUpType): boolean {
    return this.activeEffects.some(e => e.type === type);
  }

  getEffectTimeRemaining(type: PowerUpType, currentTime: number): number {
    const effect = this.activeEffects.find(e => e.type === type);
    if (!effect) return 0;
    return Math.max(0, effect.endTime - currentTime);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.powerUps.forEach(powerUp => powerUp.render(ctx));
  }

  clear(): void {
    this.powerUps = [];
    // Deactivate all effects
    this.activeEffects.forEach(effect => this.deactivateEffect(effect.type));
    this.activeEffects = [];
  }

  clearFallingPowerUps(): void {
    this.powerUps = [];
  }
}
