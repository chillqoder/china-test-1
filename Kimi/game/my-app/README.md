# Space Shooter

A premium top-down 2D space shooter built with Next.js and TypeScript.

## Features

### Visuals
- **Deep parallax starfield** with multiple layers and twinkling stars
- **Nebulae and cosmic dust** creating atmospheric depth
- **Programmatically generated ships** with detailed rendering
- **Dynamic damage states** — ship shows visible damage as health decreases
- **Particle effects** for exhaust, explosions, sparks, and debris
- **Shield bubble** with hexagonal pattern that flares on hit
- **60fps smooth gameplay**

### Player Ship
- WASD or Arrow Keys for movement with inertia-based physics
- Mouse aim with smooth rotation
- Left click / Space to fire
- **6 Weapon Types**:
  - Laser — Standard rapid-fire, infinite ammo
  - Spread — Multi-shot plasma burst
  - Railgun — Devastating piercing beam
  - Missile — Homing projectiles with smoke trails
  - EMP — Expanding ring of electric energy
  - Plasma Cannon — Slow, massive energy orbs

### Enemy Roster (7 Types)
- **Scout** — Fast, weak, agile
- **Fighter** — Balanced combatant
- **Gunship** — Slow but heavily armored
- **Kamikaze** — Rushes the player
- **Sniper** — Stays at distance, precise shots
- **Swarm** — Weak individually, dangerous in groups
- **Elite** — Mini-bosses with enhanced stats

### Systems
- **Wave-based spawning** with increasing difficulty
- **Combo multiplier** for quick successive kills
- **Shield regeneration** (passive)
- **Repair kits** dropped by enemies
- **Weapon pickups** with limited ammo
- **Visual damage degradation** — ship shows cracks, sparks, missing panels

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move ship |
| Mouse | Aim |
| Left Click / Space | Fire weapon |
| 1-3 | Switch to weapon slot |
| Scroll Wheel | Cycle weapons |
| R | Restart (when game over) |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd my-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 15** — React framework with App Router
- **TypeScript** — Type safety
- **Canvas API** — 2D rendering
- **Tailwind CSS** — UI styling

## Architecture

```
lib/
├── game/
│   ├── types.ts          # TypeScript interfaces
│   ├── constants.ts      # Game constants and configs
│   ├── engine.ts         # Main game loop and state management
│   ├── utils.ts          # Math and utility functions
│   ├── renderer.ts       # Canvas rendering functions
│   └── systems/
│       ├── player.ts     # Player logic
│       ├── enemy.ts      # Enemy AI and spawning
│       ├── projectile.ts # Weapon projectiles
│       ├── particles.ts  # Particle effects
│       ├── pickup.ts     # Item drops
│       └── collision.ts  # Collision detection
components/
└── game/
    └── GameCanvas.tsx    # React component wrapper
```

## Performance

- Object pooling for particles
- Efficient spatial queries
- Delta-time based updates for consistent speed
- Optimized rendering with shadow effects

## License

MIT License — feel free to use and modify!

---

Built with passion for smooth, cinematic 2D action. 🚀
