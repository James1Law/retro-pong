# Law's Breakout

A retro-futuristic take on the classic Breakout arcade game, featuring stunning neon visuals, particle effects, power-ups, and addictive gameplay. Fully playable on desktop and mobile.

## Features

### Core Gameplay
- **Classic Breakout Mechanics** - Paddle, ball, and bricks with authentic physics
- **5 Unique Levels** - Different brick patterns including fortress and checkerboard
- **3 Brick Types** - Standard (1 hit), Medium (2 hits), Strong (3 hits), plus indestructible
- **Progressive Difficulty** - Ball speeds up as you destroy bricks
- **High Score Tracking** - Persisted locally

### Power-Up System
Catch falling power-ups to gain advantages:

| Power-Up | Effect | Duration |
|----------|--------|----------|
| **Multi-Ball** | Splits into 3 balls | Instant |
| **Wide Paddle** | 50% wider paddle | 10 sec |
| **Slow-Mo** | Ball moves at 50% speed | 8 sec |
| **Extra Life** | +1 life | Instant |
| **Fire Ball** | Passes through bricks without bouncing | 6 sec |
| **Sticky Paddle** | Ball sticks on contact, tap to release | 15 sec |

### Visual Effects
- **Neon Glow** - All elements have glowing neon effects
- **Particle Explosions** - Satisfying burst when bricks are destroyed
- **Ball Trail** - Glowing trail follows the ball
- **Screen Shake** - Impact feedback on brick destruction (toggleable)
- **Tron-style Grid** - Pulsing background grid
- **Power-up Indicators** - HUD shows active effects with countdown

### Audio System
- **Retro 8-bit Sound Effects** - All sounds procedurally generated using Web Audio API
- **Chiptune Aesthetic** - Authentic arcade-style bleeps and bloops
- **Sound Effects Include:**
  - Paddle and wall hits
  - Brick damage and destruction (with explosion noise)
  - Ball launch whoosh
  - Power-up collection chimes
  - Level complete fanfare
  - Game over melody
  - New high score celebration

### Settings Menu
- **Settings Cog** - Accessible from menu and pause screens
- **Sound Toggle** - Turn audio on/off
- **Volume Slider** - Adjust volume level (0-100%)
- **Screen Shake Toggle** - Enable/disable screen shake effects
- **Persistent Settings** - All preferences saved to localStorage

### Mobile Support
- **Responsive Design** - Scales to fit any screen size
- **Touch Controls** - Drag to move paddle, tap to launch
- **Portrait Mode Hint** - Suggests landscape for best experience
- **PWA Ready** - Can be added to home screen

## Tech Stack

- TypeScript
- HTML5 Canvas
- Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Controls

### Desktop
| Action | Keys |
|--------|------|
| Move Left | `←` or `A` |
| Move Right | `→` or `D` |
| Launch Ball | `Space` or `Click` |
| Pause | `P` or `Escape` |
| Settings | Click the ⚙️ cog icon |

Or use **mouse movement** to control the paddle.

### Mobile
- **Drag** anywhere to move paddle
- **Tap** to launch ball / interact with menus
- **Tap ⚙️** to access settings

## Project Structure

```
laws-breakout/
├── docs/
│   ├── PRD.md           # Product requirements
│   ├── TECHNICAL.md     # Technical design
│   └── TASKS.md         # Implementation tasks
├── src/
│   ├── main.ts          # Entry point
│   ├── audio/
│   │   └── AudioManager.ts    # Procedural 8-bit sound effects
│   ├── game/
│   │   ├── Game.ts      # Main game loop, states & settings UI
│   │   ├── Paddle.ts    # Paddle entity
│   │   ├── Ball.ts      # Ball with trail
│   │   ├── Brick.ts     # Brick types
│   │   ├── Level.ts     # Level layouts
│   │   ├── Collision.ts # Collision detection
│   │   ├── InputManager.ts    # Keyboard/mouse/touch input
│   │   ├── PowerUp.ts         # Power-up capsules
│   │   └── PowerUpManager.ts  # Power-up system
│   ├── effects/
│   │   └── ParticleSystem.ts  # Explosion particles
│   ├── types/
│   │   └── index.ts     # TypeScript interfaces & enums
│   └── utils/
│       └── constants.ts # Game settings & colors
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development

See [Technical Documentation](docs/TECHNICAL.md) for implementation details.

## Roadmap

- [x] Core game mechanics
- [x] Neon visual effects
- [x] Power-up system (6 types)
- [x] Mobile touch support
- [x] Responsive design
- [x] Retro 8-bit sound effects
- [x] Settings menu (sound, volume, screen shake)
- [ ] Background music
- [ ] More levels
- [ ] Online leaderboard

## License

MIT

## Acknowledgments

- Inspired by Atari's Breakout (1976) and Taito's Arkanoid (1986)
- Visual style inspired by Tron and synthwave aesthetics
