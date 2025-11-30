# Technical Design Document: Neon Breakout

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
  GAME_OVER = 'game_over'
}

interface StateHandler {
  enter(): void;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  exit(): void;
}
```

### 3. Collision Detection

#### Ball-Brick Collision (AABB)
```typescript
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

function checkCollision(ball: Circle, brick: Rectangle): CollisionResult | null {
  // Find closest point on brick to ball center
  const closestX = clamp(ball.x, brick.x, brick.x + brick.width);
  const closestY = clamp(ball.y, brick.y, brick.y + brick.height);

  // Calculate distance
  const distX = ball.x - closestX;
  const distY = ball.y - closestY;
  const distance = Math.sqrt(distX * distX + distY * distY);

  if (distance < ball.radius) {
    // Determine collision side for bounce direction
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

  // Neon colors
  color: string = '#FF00FF';
  glowColor: string = '#FF00FF';
  glowIntensity: number = 20;
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

  // Neon styling
  color: string = '#00FFFF';
  glowColor: string = '#00FFFF';
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

  // Draw multiple times for stronger glow
  drawFn();
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
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 4
      });
    }
  }

  update(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.velocityY += 0.1; // Gravity
      p.life -= dt / 1000;
      return p.life > 0;
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
```

### 3. Ball Trail Effect

```typescript
interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

class Trail {
  points: TrailPoint[] = [];
  maxLength: number = 15;

  addPoint(x: number, y: number): void {
    this.points.unshift({ x, y, alpha: 1 });
    if (this.points.length > this.maxLength) {
      this.points.pop();
    }
  }

  render(ctx: CanvasRenderingContext2D, color: string): void {
    this.points.forEach((point, index) => {
      const alpha = 1 - (index / this.maxLength);
      const radius = 8 * (1 - index / this.maxLength * 0.5);

      ctx.save();
      ctx.globalAlpha = alpha * 0.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
```

### 4. Background Grid (Tron-style)

```typescript
function drawBackgroundGrid(ctx: CanvasRenderingContext2D): void {
  const gridColor = '#003333';
  const gridSpacing = 40;

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x < canvas.width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Horizontal lines with perspective effect
  for (let y = 0; y < canvas.height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}
```

---

## Level Design

### Level Data Format

```typescript
interface LevelData {
  id: number;
  name: string;
  bricks: BrickConfig[][];
  speedMultiplier: number;
}

// 0 = empty, 1 = standard, 2 = medium, 3 = strong, -1 = indestructible
const LEVEL_1: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
];
```

### Color Assignment by Row

```typescript
const ROW_COLORS: string[] = [
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#FF6600', // Orange
  '#FF0066', // Pink
];

function getBrickColor(row: number): string {
  return ROW_COLORS[row % ROW_COLORS.length];
}
```

---

## Input Handling

```typescript
class InputManager {
  private keys: Set<string> = new Set();
  private mouseX: number = 0;
  private useMouseControl: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        this.useMouseControl = false;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.useMouseControl = true;
    });
  }

  getHorizontalInput(): number {
    if (this.useMouseControl) {
      return this.mouseX;
    }

    let direction = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A')) {
      direction -= 1;
    }
    if (this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D')) {
      direction += 1;
    }
    return direction;
  }

  isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }
}
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
export const PADDLE_Y_OFFSET = 50; // From bottom

// Ball settings
export const BALL_RADIUS = 8;
export const BALL_INITIAL_SPEED = 5;
export const BALL_MAX_SPEED = 12;
export const BALL_SPEED_INCREMENT = 0.5;

// Brick settings
export const BRICK_ROWS = 5;
export const BRICK_COLS = 10;
export const BRICK_WIDTH = 70;
export const BRICK_HEIGHT = 25;
export const BRICK_PADDING = 5;
export const BRICK_OFFSET_TOP = 80;
export const BRICK_OFFSET_LEFT = 35;

// Game settings
export const INITIAL_LIVES = 3;
export const POINTS_PER_BRICK = 10;

// Colors
export const COLORS = {
  background: '#000000',
  paddle: '#00FFFF',
  ball: '#FF00FF',
  text: '#FFFFFF',
  grid: '#003333',
  bricks: ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF6600']
};
```

---

## Implementation Order

### Sprint 1: Foundation
1. Project setup (Vite + TypeScript + Canvas)
2. Game loop implementation
3. Basic rendering (black background, grid)
4. Paddle entity with keyboard controls

### Sprint 2: Core Mechanics
5. Ball entity with physics
6. Wall collision detection
7. Paddle-ball collision with angle variation
8. Brick grid generation and rendering

### Sprint 3: Gameplay
9. Brick-ball collision detection
10. Brick destruction and scoring
11. Lives system
12. Game state management (start, play, game over)

### Sprint 4: Visual Polish
13. Neon glow effects on all entities
14. Particle explosion system
15. Ball trail effect
16. Brick pulse animations
17. HUD with neon styling

### Sprint 5: Game Loop Polish
18. Progressive difficulty (speed increase)
19. Multiple levels
20. Level transitions
21. Final polish and bug fixes

---

## Performance Considerations

1. **Object Pooling** - Reuse particle objects instead of creating new ones
2. **Dirty Rectangle Rendering** - Only redraw changed areas (optional)
3. **RequestAnimationFrame** - Sync with browser refresh rate
4. **Canvas Optimization** - Use `willReadFrequently: false` context option
5. **Glow Effect Limit** - Cap shadowBlur to prevent performance issues

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Ball bounces correctly off all walls
- [ ] Ball bounces off paddle at correct angles
- [ ] Bricks are destroyed on contact
- [ ] Score increments correctly
- [ ] Lives decrement when ball is lost
- [ ] Game over triggers when lives = 0
- [ ] All neon effects render properly
- [ ] Particle effects spawn on brick destruction
- [ ] Controls feel responsive
- [ ] 60 FPS maintained during gameplay
