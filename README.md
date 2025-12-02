# Law's Breakout

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5 Canvas](https://img.shields.io/badge/Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio-FF6B6B?style=for-the-badge&logo=audio&logoColor=white)

**A retro-futuristic take on the classic Breakout arcade game**

*Featuring stunning neon visuals, particle effects, 8-bit sound, and addictive gameplay*

[Play Now](#getting-started) | [Features](#features) | [Controls](#controls) | [Roadmap](#roadmap)

---

</div>

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
|:--------:|--------|:--------:|
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

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/James1Law/retro-pong.git
cd retro-pong

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

---

## Controls

<table>
<tr>
<td width="50%">

### Desktop

| Action | Keys |
|--------|------|
| Move Left | `←` or `A` |
| Move Right | `→` or `D` |
| Launch Ball | `Space` or `Click` |
| Pause | `P` or `Escape` |
| Settings | Click the cog icon |

Or use **mouse movement** to control the paddle.

</td>
<td width="50%">

### Mobile

| Action | Gesture |
|--------|---------|
| Move Paddle | Drag anywhere |
| Launch Ball | Tap |
| Pause/Resume | Tap |
| Settings | Tap cog icon |

Best played in **landscape** orientation.

</td>
</tr>
</table>

---

## Project Structure

```
laws-breakout/
├── src/
│   ├── main.ts                # Entry point
│   ├── audio/
│   │   └── AudioManager.ts    # Procedural 8-bit sound effects
│   ├── game/
│   │   ├── Game.ts            # Main game loop, states & settings UI
│   │   ├── Paddle.ts          # Paddle entity
│   │   ├── Ball.ts            # Ball with trail
│   │   ├── Brick.ts           # Brick types
│   │   ├── Level.ts           # Level layouts
│   │   ├── Collision.ts       # Collision detection
│   │   ├── InputManager.ts    # Keyboard/mouse/touch input
│   │   ├── PowerUp.ts         # Power-up capsules
│   │   └── PowerUpManager.ts  # Power-up system
│   ├── effects/
│   │   └── ParticleSystem.ts  # Explosion particles
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces & enums
│   └── utils/
│       └── constants.ts       # Game settings & colors
├── docs/                      # Documentation
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

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

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe game logic |
| **HTML5 Canvas** | 2D rendering engine |
| **Web Audio API** | Procedural sound generation |
| **Vite** | Fast development & bundling |
| **localStorage** | Settings & high score persistence |

---

## License

MIT

---

## Acknowledgments

- Inspired by Atari's **Breakout** (1976) and Taito's **Arkanoid** (1986)
- Visual style inspired by **Tron** and synthwave aesthetics

---

<div align="center">

Made with neon dreams and 8-bit sounds

</div>
