# Neon Breakout 🎮

A retro-futuristic take on the classic Breakout arcade game, featuring stunning neon visuals, particle effects, and addictive gameplay.

![Game Preview](docs/preview.png)

## Features

- **Classic Breakout Gameplay** - Paddle, ball, and bricks with authentic physics
- **Retro-Futuristic Aesthetic** - Neon colors on black background with glow effects
- **Explosive Visual Effects** - Particle explosions when bricks are destroyed
- **Ball Trail Effect** - Glowing trail follows the ball
- **Progressive Difficulty** - Ball speeds up as you progress
- **Multiple Brick Types** - Standard, medium, strong, and indestructible
- **Responsive Controls** - Keyboard (Arrow/WASD) or mouse support

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
# Clone the repository
git clone https://github.com/yourusername/neon-breakout.git
cd neon-breakout

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

| Action | Keys |
|--------|------|
| Move Left | `←` or `A` |
| Move Right | `→` or `D` |
| Launch Ball | `Space` |
| Pause | `P` or `Escape` |

Or use **mouse movement** to control the paddle.

## Project Structure

```
neon-breakout/
├── docs/           # Documentation
│   ├── PRD.md      # Product requirements
│   └── TECHNICAL.md # Technical design
├── src/
│   ├── main.ts     # Entry point
│   ├── game/       # Game entities and logic
│   ├── effects/    # Visual effects (particles, trails)
│   ├── ui/         # HUD and menu screens
│   ├── utils/      # Constants and helpers
│   └── types/      # TypeScript interfaces
├── public/         # Static assets
└── index.html      # HTML entry
```

## Development

See [Technical Documentation](docs/TECHNICAL.md) for implementation details.

## Roadmap

- [x] Phase 1: Core game mechanics
- [ ] Phase 2: Power-ups and sound
- [ ] Phase 3: Mobile support and leaderboards

## License

MIT

## Acknowledgments

- Inspired by Atari's Breakout (1976) and Taito's Arkanoid (1986)
- Visual style inspired by Tron and synthwave aesthetics
