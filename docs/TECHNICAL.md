# Technical Design Document: Law's Breakout

## Architecture Overview

### Tech Stack
- **TypeScript** - Type-safe game logic
- **HTML5 Canvas** - Rendering engine
- **Vite** - Fast development and building
- **CSS** - UI styling and effects

### Design Principles
1. **Entity-Component Pattern** - Game objects are self-contained entities
2. **Game Loop** - Fixed timestep update, variable render
3. **State Machine** - Clean game state transitions
4. **Separation of Concerns** - Logic, rendering, and input handling separated
5. **Callback Pattern** - Power-up effects use callbacks for clean integration

---

## Core Systems

### 1. Game Loop

```typescript
class Game {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly FIXED_TIMESTEP: number = 1000 / 60; // 60 updates/sec

  gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.FIXED_TIMESTEP) {
      this.update(this.FIXED_TIMESTEP);
      this.accumulator -= this.FIXED_TIMESTEP;
    }

    // Variable timestep render
    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
```

### 2. State Machine

```typescript
enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LEVEL_COMPLETE = 'level_complete',
  GAME_OVER = 'game_over',
  VICTORY = 'victory'
}
```

### 3. Collision Detection

#### Ball-Brick Collision (AABB)
```typescript
function checkCollision(ball: Circle, brick: Rectangle): CollisionResult | null {
  // Find closest point on brick to ball center
  const closestX = clamp(ball.x, brick.x, brick.x + brick.width);
  const closestY = clamp(ball.y, brick.y, brick.y + brick.height);

  // Calculate distance
  const distX = ball.x - closestX;
  const distY = ball.y - closestY;
  const distance = Math.sqrt(distX * distX + distY * distY);

  if (distance < ball.radius) {
    return {
      hit: true,
      side: determineSide(ball, brick, closestX, closestY)
    };
  }
  return null;
}
```

#### Ball-Paddle Collision
```typescript
function handlePaddleCollision(ball: Ball, paddle: Paddle): void {
  // Calculate hit position relative to paddle center (-1 to 1)
  const hitPosition = (ball.x - paddle.centerX) / (paddle.width / 2);

  // Adjust ball angle based on where it hit the paddle
  const maxAngle = Math.PI / 3; // 60 degrees max
  const angle = hitPosition * maxAngle;

  const speed = ball.speed;
  ball.velocityX = speed * Math.sin(angle);
  ball.velocityY = -speed * Math.cos(angle); // Always bounce up
}
```

---

## Entity Classes

### Ball

```typescript
class Ball {
  x: number;
  y: number;
  radius: number = 8;
  velocityX: number = 0;
  velocityY: number = 0;
  speed: number = 5;
  trail: TrailPoint[] = [];

  // Power-up states
  isOnFire: boolean = false;
  isSlowMo: boolean = false;
  isStuck: boolean = false;
  stuckOffset: number = 0;

  // Neon colors
  color: string = '#FF00FF';
  glowColor: string = '#FF00FF';
  glowIntensity: number = 20;

  clone(): Ball {
    // Creates a copy for multi-ball power-up
  }
}
```

### Paddle

```typescript
class Paddle {
  x: number;
  y: number;
  width: number = 100;
  height: number = 15;
  speed: number = 8;

  // Power-up states
  isWide: boolean = false;
  isSticky: boolean = false;

  // Neon styling
  color: string = '#00FFFF';
  glowIntensity: number = 15;
}
```

### Brick

```typescript
enum BrickType {
  STANDARD = 1,
  MEDIUM = 2,
  STRONG = 3,
  INDESTRUCTIBLE = -1
}

class Brick {
  x: number;
  y: number;
  width: number = 75;
  height: number = 25;
  type: BrickType;
  hits: number;
  maxHits: number;
  color: string;
  points: number;
  isDestroyed: boolean = false;

  // Animation state
  pulsePhase: number = Math.random() * Math.PI * 2;
  hitFlash: number = 0;
}
```

---

## Power-Up System

### PowerUp Entity

```typescript
enum PowerUpType {
  MULTI_BALL = 'multi_ball',
  WIDE_PADDLE = 'wide_paddle',
  SLOW_MO = 'slow_mo',
  EXTRA_LIFE = 'extra_life',
  FIRE_BALL = 'fire_ball',
  STICKY_PADDLE = 'sticky_paddle'
}

class PowerUp {
  x: number;
  y: number;
  width: number = 50;
  height: number = 20;
  type: PowerUpType;
  velocityY: number = 2;
  color: string;
  label: string;
}
```

### PowerUpManager

```typescript
interface PowerUpCallbacks {
  onMultiBall: () => void;
  onWidePaddle: (active: boolean) => void;
  onSlowMo: (active: boolean) => void;
  onExtraLife: () => void;
  onFireBall: (active: boolean) => void;
  onStickyPaddle: (active: boolean) => void;
}

class PowerUpManager {
  private activePowerUps: PowerUp[] = [];
  private activeTimers: Map<PowerUpType, number> = new Map();
  private callbacks: PowerUpCallbacks;

  // Spawn chance configurable
  private spawnChance: number = 0.15;

  maybeSpawn(x: number, y: number): void {
    if (Math.random() < this.spawnChance) {
      const type = this.randomType();
      this.activePowerUps.push(new PowerUp(x, y, type));
    }
  }

  activate(type: PowerUpType): void {
    // Handle instant effects (multi-ball, extra life)
    // Start timers for timed effects
    // Call appropriate callback
  }

  getActiveEffects(): { type: PowerUpType; timeRemaining: number }[] {
    // Returns active timed effects for HUD display
  }
}
```

### Power-Up Durations

```typescript
export const POWER_UP_DURATIONS: Record<PowerUpType, number> = {
  [PowerUpType.MULTI_BALL]: 0,      // Instant
  [PowerUpType.WIDE_PADDLE]: 10000,  // 10 seconds
  [PowerUpType.SLOW_MO]: 8000,       // 8 seconds
  [PowerUpType.EXTRA_LIFE]: 0,       // Instant
  [PowerUpType.FIRE_BALL]: 6000,     // 6 seconds
  [PowerUpType.STICKY_PADDLE]: 15000 // 15 seconds
};
```

---

## Visual Effects System

### 1. Neon Glow Effect

```typescript
function drawWithGlow(
  ctx: CanvasRenderingContext2D,
  drawFn: () => void,
  glowColor: string,
  intensity: number
): void {
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = intensity;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  drawFn();
  ctx.restore();
}
```

### 2. Particle System

```typescript
interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

class ParticleSystem {
  particles: Particle[] = [];

  emit(x: number, y: number, color: string, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x, y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 4
      });
    }
  }
}
```

### 3. Ball Trail Effect

```typescript
class Ball {
  private trail: { x: number; y: number }[] = [];
  private maxTrailLength: number = 10;

  updateTrail(): void {
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }
  }

  renderTrail(ctx: CanvasRenderingContext2D): void {
    this.trail.forEach((point, i) => {
      const alpha = 1 - i / this.trail.length;
      const radius = this.radius * (1 - i / this.trail.length * 0.5);
      // Render fading circles
    });
  }
}
```

### 4. Screen Shake

```typescript
class Game {
  private screenShake: number = 0;

  triggerShake(intensity: number = 5): void {
    this.screenShake = intensity;
  }

  render(): void {
    if (this.screenShake > 0) {
      const offsetX = (Math.random() - 0.5) * this.screenShake;
      const offsetY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(offsetX, offsetY);
      this.screenShake *= 0.9;
    }
    // ... render game
  }
}
```

---

## Input Handling

### Multi-Input Support

```typescript
class InputManager {
  private keys: Set<string> = new Set();
  private mouseX: number = 0;
  private touchX: number | null = null;
  private useMouseControl: boolean = false;
  public isMobile: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.isMobile = 'ontouchstart' in window;
    this.setupKeyboardListeners();
    this.setupMouseListeners(canvas);
    this.setupTouchListeners(canvas);
  }

  getTargetX(): number | null {
    if (this.touchX !== null) return this.touchX;
    if (this.useMouseControl) return this.mouseX;
    return null;
  }

  getKeyboardDirection(): number {
    let direction = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('a')) direction -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('d')) direction += 1;
    return direction;
  }
}
```

---

## Responsive Canvas

### Scaling System

```typescript
function resizeCanvas(): void {
  const container = document.getElementById('gameContainer');
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  const scale = Math.min(
    containerWidth / CANVAS_WIDTH,
    containerHeight / CANVAS_HEIGHT
  );

  canvas.style.width = `${CANVAS_WIDTH * scale}px`;
  canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
}

// Convert screen coordinates to canvas coordinates
function screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (screenX - rect.left) * (CANVAS_WIDTH / rect.width),
    y: (screenY - rect.top) * (CANVAS_HEIGHT / rect.height)
  };
}
```

---

## Level Design

### Level Data Format

```typescript
// 0 = empty, 1 = standard, 2 = medium, 3 = strong, -1 = indestructible
const LEVELS: number[][][] = [
  // Level 1: Classic rows
  [[1,1,1,1,1,1,1,1,1,1], [2,2,2,2,2,2,2,2,2,2], ...],
  // Level 2: Pyramid
  [...],
  // Level 3: Fortress
  [...],
  // Level 4: Checkerboard
  [...],
  // Level 5: Final challenge
  [...]
];
```

---

## Constants

```typescript
// Game dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Paddle settings
export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 15;
export const PADDLE_SPEED = 8;
export const PADDLE_Y_OFFSET = 50;

// Ball settings
export const BALL_RADIUS = 8;
export const BALL_INITIAL_SPEED = 5;
export const BALL_MAX_SPEED = 12;
export const BALL_SPEED_INCREMENT = 0.1;

// Brick settings
export const BRICK_WIDTH = 70;
export const BRICK_HEIGHT = 25;
export const BRICK_PADDING = 5;
export const BRICK_OFFSET_TOP = 80;
export const BRICK_OFFSET_LEFT = 35;

// Game settings
export const INITIAL_LIVES = 3;

// Colors
export const COLORS = {
  background: '#000000',
  paddle: '#00FFFF',
  ball: '#FF00FF',
  text: '#FFFFFF',
  grid: '#003333',
  powerUps: {
    multi_ball: '#00FFFF',
    wide_paddle: '#FFFF00',
    slow_mo: '#0088FF',
    extra_life: '#FF0066',
    fire_ball: '#FF6600',
    sticky_paddle: '#00FF66'
  }
};
```

---

## Performance Considerations

1. **Object Pooling** - Reuse particle objects instead of creating new ones
2. **RequestAnimationFrame** - Sync with browser refresh rate
3. **Canvas Optimization** - Use `willReadFrequently: false` context option
4. **Glow Effect Limit** - Cap shadowBlur to prevent performance issues
5. **Mobile Optimization** - Touch events use passive listeners where possible

---

## Testing Checklist

### Core Mechanics
- [x] Ball bounces correctly off all walls
- [x] Ball bounces off paddle at correct angles
- [x] Bricks are destroyed on contact
- [x] Score increments correctly
- [x] Lives decrement when all balls are lost
- [x] Game over triggers when lives = 0
- [x] All 5 levels are playable

### Visual Effects
- [x] All neon effects render properly
- [x] Particle effects spawn on brick destruction
- [x] Ball trail renders correctly
- [x] Screen shake activates on brick destruction
- [x] Power-up HUD shows active effects

### Power-ups
- [x] Multi-ball spawns 3 balls
- [x] Wide paddle increases paddle size
- [x] Slow-mo reduces ball speed
- [x] Extra life adds a life
- [x] Fire ball passes through bricks
- [x] Sticky paddle catches ball
- [x] Timed effects expire correctly

### Mobile
- [x] Touch controls move paddle
- [x] Canvas scales to screen size
- [x] Touch to launch works
- [x] No unwanted scroll/zoom on touch
- [x] 60 FPS maintained on mobile devices
