export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LEVEL_COMPLETE = 'level_complete',
  GAME_OVER = 'game_over'
}

export enum BrickType {
  STANDARD = 1,
  MEDIUM = 2,
  STRONG = 3,
  INDESTRUCTIBLE = -1
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface TrailPoint {
  x: number;
  y: number;
}

export interface CollisionResult {
  hit: boolean;
  side: 'top' | 'bottom' | 'left' | 'right';
}

// Power-up types
export enum PowerUpType {
  MULTI_BALL = 'multi_ball',
  WIDE_PADDLE = 'wide_paddle',
  SLOW_MO = 'slow_mo',
  EXTRA_LIFE = 'extra_life',
  FIRE_BALL = 'fire_ball',
  STICKY_PADDLE = 'sticky_paddle'
}

export interface PowerUpConfig {
  type: PowerUpType;
  color: string;
  glowColor: string;
  symbol: string;
  duration: number; // 0 = instant effect
}
