# Product Requirements Document: Neon Breakout

## Overview

**Project Name:** Neon Breakout
**Version:** 1.0
**Date:** November 2024

### Vision
A modern reimagining of the classic Breakout/Arkanoid arcade game featuring a stunning retro-futuristic aesthetic with neon colors on a black background, complete with explosive visual effects and satisfying gameplay.

---

## Game Description

### Core Concept
Players control a paddle at the bottom of the screen, bouncing a ball upward to destroy a grid of bricks. The game preserves the classic Breakout mechanics while adding modern visual flair through neon aesthetics and particle effects.

### Target Platform
- Web browser (HTML5 Canvas)
- Desktop-first design, responsive for various screen sizes

---

## Gameplay Mechanics

### Core Mechanics

| Mechanic | Description |
|----------|-------------|
| **Paddle Movement** | Player moves paddle left/right using keyboard (Arrow keys or A/D) or mouse |
| **Ball Physics** | Ball bounces off walls, paddle, and bricks at appropriate angles |
| **Brick Destruction** | Bricks are destroyed when hit by the ball |
| **Lives System** | Player starts with 3 lives; loses a life when ball falls below paddle |
| **Scoring** | Points awarded for each brick destroyed (varies by brick type) |
| **Progressive Difficulty** | Ball speed increases as more bricks are destroyed |

### Game Flow
1. **Start Screen** - Title with "Press SPACE to Start"
2. **Gameplay** - Active game with paddle, ball, and bricks
3. **Level Complete** - All bricks destroyed, advance to next level
4. **Game Over** - All lives lost, show final score
5. **Victory** - All levels completed

### Brick Types

| Type | Color | Points | Hits to Destroy | Special |
|------|-------|--------|-----------------|---------|
| Standard | Cyan | 10 | 1 | - |
| Medium | Magenta | 25 | 2 | Glows brighter |
| Strong | Yellow | 50 | 3 | Pulses |
| Indestructible | Gray | 0 | ∞ | Dims on hit |

### Power-ups (Phase 2)
- **Multi-ball** - Splits ball into 3
- **Wide Paddle** - Temporarily expands paddle width
- **Slow Motion** - Temporarily slows ball
- **Laser Paddle** - Shoot lasers to destroy bricks

---

## Visual Design

### Aesthetic: Retro-Futuristic Neon

#### Color Palette

| Element | Primary Color | Hex Code | Effect |
|---------|---------------|----------|--------|
| Background | Pure Black | `#000000` | Base canvas |
| Paddle | Electric Cyan | `#00FFFF` | Glow effect |
| Ball | Hot Pink | `#FF00FF` | Trail effect |
| Brick Row 1 | Neon Cyan | `#00FFFF` | Pulse glow |
| Brick Row 2 | Neon Magenta | `#FF00FF` | Pulse glow |
| Brick Row 3 | Neon Yellow | `#FFFF00` | Pulse glow |
| Brick Row 4 | Neon Green | `#00FF00` | Pulse glow |
| Brick Row 5 | Neon Orange | `#FF6600` | Pulse glow |
| UI Text | White | `#FFFFFF` | Glow effect |
| Grid Lines | Dark Cyan | `#003333` | Subtle background |

#### Visual Effects

1. **Neon Glow** - All game elements have CSS/Canvas glow (shadowBlur)
2. **Brick Explosions** - Particle burst when brick destroyed
3. **Ball Trail** - Fading trail behind moving ball
4. **Paddle Glow** - Intensifies on ball contact
5. **Screen Flash** - Subtle flash on brick destruction
6. **Background Grid** - Subtle perspective grid (Tron-style)
7. **Scanlines** - Optional CRT scanline overlay

### Audio (Phase 2)
- Synthwave-style background music
- Retro sound effects for:
  - Ball bounce (paddle)
  - Ball bounce (wall)
  - Brick destruction
  - Power-up collection
  - Life lost
  - Level complete

---

## Technical Requirements

### Technology Stack
- **Language:** TypeScript
- **Rendering:** HTML5 Canvas API
- **Build Tool:** Vite
- **Package Manager:** npm

### Performance Targets
- 60 FPS minimum on modern browsers
- Smooth animations and particle effects
- < 2 second initial load time

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## User Interface

### HUD Elements
```
┌─────────────────────────────────────────┐
│  SCORE: 00000    LIVES: ♥♥♥    LVL: 1  │
├─────────────────────────────────────────┤
│                                         │
│   ████  ████  ████  ████  ████  ████   │
│   ████  ████  ████  ████  ████  ████   │
│   ████  ████  ████  ████  ████  ████   │
│   ████  ████  ████  ████  ████  ████   │
│                                         │
│                   ○                     │
│                  ╱                      │
│                                         │
│              ▄▄▄▄▄▄▄▄                   │
└─────────────────────────────────────────┘
```

### Screens
1. **Title Screen** - Game logo, start prompt, high score
2. **Game Screen** - HUD + gameplay area
3. **Pause Menu** - Resume, restart, quit options
4. **Game Over Screen** - Final score, restart option
5. **Level Complete** - Score bonus, next level prompt

---

## Development Phases

### Phase 1: Core Game (MVP)
- [x] Project setup (Vite + TypeScript)
- [ ] Canvas rendering setup
- [ ] Paddle with keyboard/mouse controls
- [ ] Ball physics and collision detection
- [ ] Brick grid generation
- [ ] Basic scoring and lives
- [ ] Neon visual styling
- [ ] Basic particle effects on brick destruction
- [ ] Game states (start, play, game over)

### Phase 2: Polish & Features
- [ ] Multiple levels with different layouts
- [ ] Power-up system
- [ ] Sound effects and music
- [ ] Local high score persistence
- [ ] Settings menu (sound, difficulty)
- [ ] Advanced visual effects (scanlines, screen shake)

### Phase 3: Enhancement
- [ ] Mobile touch controls
- [ ] Online leaderboard
- [ ] Custom level editor
- [ ] Additional game modes

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Frame Rate | Consistent 60 FPS |
| Load Time | < 2 seconds |
| Playability | Smooth, responsive controls |
| Visual Appeal | Cohesive neon aesthetic |
| Fun Factor | Addictive "one more game" feeling |

---

## File Structure

```
neon-breakout/
├── docs/
│   ├── PRD.md
│   └── TECHNICAL.md
├── src/
│   ├── main.ts           # Entry point
│   ├── game/
│   │   ├── Game.ts       # Main game class
│   │   ├── Paddle.ts     # Paddle entity
│   │   ├── Ball.ts       # Ball entity
│   │   ├── Brick.ts      # Brick entity
│   │   ├── Level.ts      # Level management
│   │   └── Collision.ts  # Collision detection
│   ├── effects/
│   │   ├── Particle.ts   # Particle system
│   │   ├── Trail.ts      # Ball trail effect
│   │   └── Glow.ts       # Glow effect utilities
│   ├── ui/
│   │   ├── HUD.ts        # Score, lives display
│   │   └── Screens.ts    # Menu screens
│   ├── utils/
│   │   ├── constants.ts  # Game constants
│   │   └── helpers.ts    # Utility functions
│   └── types/
│       └── index.ts      # TypeScript interfaces
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## References

- Original Breakout (Atari, 1976)
- Arkanoid (Taito, 1986)
- Visual inspiration: Tron, Synthwave aesthetic, 80s arcade cabinets
