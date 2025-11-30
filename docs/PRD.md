# Product Requirements Document: Law's Breakout

## Overview

**Project Name:** Law's Breakout
**Version:** 1.0
**Date:** November 2024

### Vision
A modern reimagining of the classic Breakout/Arkanoid arcade game featuring a stunning retro-futuristic aesthetic with neon colors on a black background, complete with explosive visual effects, power-ups, and satisfying gameplay. Fully playable on desktop and mobile.

---

## Game Description

### Core Concept
Players control a paddle at the bottom of the screen, bouncing a ball upward to destroy a grid of bricks. The game preserves the classic Breakout mechanics while adding modern visual flair through neon aesthetics, particle effects, and an engaging power-up system.

### Target Platform
- Web browser (HTML5 Canvas)
- Desktop and mobile responsive design
- Touch controls for mobile devices

---

## Gameplay Mechanics

### Core Mechanics

| Mechanic | Description |
|----------|-------------|
| **Paddle Movement** | Player moves paddle left/right using keyboard (Arrow keys or A/D), mouse, or touch |
| **Ball Physics** | Ball bounces off walls, paddle, and bricks at appropriate angles |
| **Brick Destruction** | Bricks are destroyed when hit by the ball |
| **Lives System** | Player starts with 3 lives; loses a life when all balls fall below paddle |
| **Scoring** | Points awarded for each brick destroyed (varies by brick type) |
| **Progressive Difficulty** | Ball speed increases as more bricks are destroyed |
| **Power-ups** | Catch falling capsules to gain temporary advantages |

### Game Flow
1. **Start Screen** - Title with "Press SPACE to Start" / "Tap to Start"
2. **Gameplay** - Active game with paddle, ball(s), and bricks
3. **Level Complete** - All destructible bricks destroyed, advance to next level
4. **Game Over** - All lives lost, show final score
5. **Victory** - All 5 levels completed

### Brick Types

| Type | Color | Points | Hits to Destroy | Special |
|------|-------|--------|-----------------|---------|
| Standard | Cyan | 10 | 1 | - |
| Medium | Magenta | 25 | 2 | Glows brighter |
| Strong | Yellow | 50 | 3 | Pulses |
| Indestructible | Gray | 0 | ∞ | Dims on hit |

### Power-up System

Power-ups drop from destroyed bricks with a configurable spawn chance. Catch them with the paddle to activate.

| Power-Up | Color | Effect | Duration |
|----------|-------|--------|----------|
| **Multi-Ball** | Cyan | Splits into 3 balls | Instant |
| **Wide Paddle** | Yellow | 50% wider paddle | 10 sec |
| **Slow-Mo** | Blue | Ball moves at 50% speed | 8 sec |
| **Extra Life** | Red | +1 life | Instant |
| **Fire Ball** | Orange | Passes through bricks without bouncing | 6 sec |
| **Sticky Paddle** | Green | Ball sticks on contact, tap to release | 15 sec |

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
5. **Screen Shake** - Subtle shake on brick destruction
6. **Background Grid** - Subtle perspective grid (Tron-style) with pulse animation
7. **Power-up HUD** - Active effects displayed with countdown timers

---

## Mobile Support

### Touch Controls
- **Drag** anywhere on screen to move paddle
- **Tap** to launch ball / interact with menus
- Touch position is tracked and paddle follows smoothly

### Responsive Design
- Canvas scales to fit any screen size while maintaining aspect ratio
- Portrait mode hint suggests landscape orientation
- Safe area insets respected for notched devices
- Touch actions configured to prevent scroll/zoom interference

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
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## User Interface

### HUD Elements
```
┌─────────────────────────────────────────┐
│  SCORE: 00000    LIVES: ♥♥♥    LVL: 1  │
│  [WIDE 8s] [FIRE 4s]                    │
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
2. **Game Screen** - HUD + gameplay area + active power-up indicators
3. **Pause Menu** - Resume, restart prompts
4. **Game Over Screen** - Final score, high score, restart option
5. **Level Complete** - Score bonus, next level prompt
6. **Victory Screen** - Congratulations, final score, restart option

---

## Development Phases

### Phase 1: Core Game (MVP) ✅
- [x] Project setup (Vite + TypeScript)
- [x] Canvas rendering setup
- [x] Paddle with keyboard/mouse controls
- [x] Ball physics and collision detection
- [x] Brick grid generation
- [x] Basic scoring and lives
- [x] Neon visual styling
- [x] Basic particle effects on brick destruction
- [x] Game states (start, play, pause, game over)

### Phase 2: Polish & Features ✅
- [x] Multiple levels with different layouts (5 levels)
- [x] Power-up system (6 types)
- [x] Local high score persistence
- [x] Screen shake effects
- [x] Ball trail effects
- [ ] Sound effects and music
- [ ] Settings menu (sound, difficulty)

### Phase 3: Mobile & Enhancement ✅
- [x] Mobile touch controls
- [x] Responsive canvas scaling
- [x] Portrait mode orientation hint
- [ ] Online leaderboard
- [ ] Custom level editor
- [ ] Additional game modes

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Frame Rate | Consistent 60 FPS | ✅ |
| Load Time | < 2 seconds | ✅ |
| Playability | Smooth, responsive controls | ✅ |
| Visual Appeal | Cohesive neon aesthetic | ✅ |
| Mobile Support | Touch controls work smoothly | ✅ |
| Fun Factor | Addictive "one more game" feeling | ✅ |

---

## File Structure

```
laws-breakout/
├── docs/
│   ├── PRD.md           # Product requirements
│   ├── TECHNICAL.md     # Technical design
│   └── TASKS.md         # Implementation tasks
├── src/
│   ├── main.ts          # Entry point
│   ├── game/
│   │   ├── Game.ts      # Main game class
│   │   ├── Paddle.ts    # Paddle entity
│   │   ├── Ball.ts      # Ball entity
│   │   ├── Brick.ts     # Brick entity
│   │   ├── Level.ts     # Level management
│   │   ├── Collision.ts # Collision detection
│   │   ├── InputManager.ts    # Keyboard/mouse/touch input
│   │   ├── PowerUp.ts         # Power-up capsule entity
│   │   └── PowerUpManager.ts  # Power-up system manager
│   ├── effects/
│   │   └── ParticleSystem.ts  # Particle effects
│   ├── types/
│   │   └── index.ts     # TypeScript interfaces
│   └── utils/
│       └── constants.ts # Game constants
├── index.html
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
