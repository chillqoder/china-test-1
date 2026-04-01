# 🚀 Space Shooter

A top-down 2D space shooter built with Next.js and PixiJS. Pilot your flagship through waves of increasingly dangerous enemies in a living, breathing cosmos.

## Features

- **Procedural graphics** — all ships, weapons, effects, and backgrounds are generated programmatically
- **6 weapon types** — Pulse Laser, Plasma Spread, Railgun, Missile Volley, EMP Pulse, Plasma Cannon
- **7 enemy types** — Scouts, Fighters, Gunships, Kamikaze Drones, Snipers, Swarm units, and Elite mini-bosses
- **Progressive damage system** — your ship visually degrades as hull integrity drops
- **Shield regeneration** — shields regenerate passively when not taking damage
- **Wave progression** — escalating difficulty with combo multiplier scoring
- **Particle effects** — explosions, sparks, engine trails, muzzle flash, shield impacts
- **Parallax starfield** — layered stars, nebulae, and distant planets

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrow Keys | Move ship |
| Mouse | Aim (ship rotates to cursor) |
| Left Click / Space | Fire weapon |
| Scroll Wheel / 1-3 | Switch weapons |

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 16** — App Router, React 19
- **PixiJS 8** — WebGL 2D rendering
- **TypeScript** — Full type safety
