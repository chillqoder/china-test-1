# 🚀 Space Shooter — Next.js 2D Game Prompt

## Overview

Build a **top-down 2D space shooter** game using **Next.js** (App Router). Choose any rendering/game library or combination of libraries you see fit — make the best architectural decision for performance, visual quality, and developer experience. The AI implementing this should select the most appropriate tooling autonomously.

---

## Core Vision

> **Graphics and feel come first.** Every decision — technical and creative — should serve the goal of making the game look and feel extraordinary. Smooth, cinematic, immersive.

The player pilots a **large, detailed spaceship** through a living, breathing cosmos. Enemy ships swarm in from all directions. Combat is fast, fluid, and visually stunning. Weapons are varied and satisfying. The ship takes real damage — it shows, it limps, it struggles.

---

## Visual Direction

### Space World
- Deep, layered **parallax starfield** — multiple layers of stars at different speeds to create depth illusion
- Occasional **nebulae, gas clouds, and cosmic dust** rendered as soft glowing particle systems or layered blended textures
- **Distant planets or moons** slowly drifting in background layers
- Everything should feel vast, cold, and alive
- Subtle **ambient glow effects** — the cosmos softly illuminates the ships

### Player Ship
- Large, **detailed flagship** — find or generate a high-quality top-down spaceship sprite, or construct it from geometric primitives with rich shading and glow effects
- Must look powerful, intricate, and battle-worn
- Ship has **visible damage states** — hull cracks, sparking sections, flickering engine trails, missing panels — all rendered visually as the ship takes damage
- **Engine exhaust** — animated thruster glow with particle trails; intensity changes with speed
- **Shield bubble** — subtle animated hexagonal or circular shield that flares on hit

### Enemy Ships
- **Diverse enemy roster** — at least 5–7 visually distinct enemy types:
  - Small fast scouts (agile, weak)
  - Medium fighters (balanced)
  - Heavy gunships (slow, tanky)
  - Kamikaze drones (rush the player)
  - Sniper frigates (stay at distance, fire precise shots)
  - Swarm units (spawn in large groups, weak individually)
  - Elite mini-bosses (rare, visually impressive, drop rare weapons)
- Each enemy type has a **unique color scheme and silhouette** so they're immediately recognizable
- Enemies have **death animations** — explosions, debris, sparks, hull fragments scattering

### Weapons & Projectiles
- Each weapon type has a **distinct visual signature**:
  - Standard laser — thin cyan/white beam with glow
  - Spread shot — orange plasma bursts in a fan
  - Railgun — a slow-charging, devastating white beam with screen flash
  - Missile volley — homing projectiles with smoke trails
  - EMP pulse — expanding ring of electric distortion
  - Plasma cannon — slow, large, glowing magenta orbs
- Projectiles have **motion blur, glow, and impact particle effects**
- Weapon pickups dropped by enemies are visually distinct glowing items floating in space

---

## Gameplay Mechanics

### Player Ship

- **WASD or Arrow Keys** — movement (smooth acceleration/deceleration, not instant)
- **Mouse aim** — the ship rotates to face the cursor
- **Left click / Space** — fire current weapon
- **Scroll wheel or number keys** — switch between collected weapons
- Movement feels **weighty and physical** — the ship has inertia

### Damage & Repair System

- Player ship has **hull integrity** (HP) displayed as a visual health bar and as visible ship damage
- As HP decreases, the ship **degrades progressively**:
  - 75% HP — minor sparks, slight engine instability
  - 50% HP — visible hull cracks, reduced max speed
  - 25% HP — engine sputtering, erratic thruster visuals, further speed/turn reduction
  - Critical — flickering display overlays, severely impaired movement
- **Repair kits** drop from enemies — collecting them restores hull integrity and visually "heals" the ship (cracks fade, sparks stop)
- **Shield regenerates** passively over time if not hit; hull does not regenerate without pickups

### Weapon System

- Player starts with a basic laser
- **Weapons drop from defeated enemies** as glowing pickups
- Player can carry **up to 3 weapons** simultaneously and switch between them
- Each weapon has **limited ammo** except the starting weapon (which is weak but infinite)
- Weapon pickups display their type visually before collection
- Weapons have **different fire rates, damage, spread, range, and special behaviors**

### Enemies

- Enemies **spawn in waves** — each wave increases in difficulty
- Enemies use **simple but readable AI behaviors**:
  - Flanking, swarming, circling, strafing, retreating to distance
- Enemies have their own HP bars (small, elegant, visible during combat)
- Some enemies **call for reinforcements** if not killed quickly
- **Elite enemies** spawn occasionally — visually distinct, much more dangerous, drop rare weapon types

### Progression

- **Score system** — displayed elegantly in the HUD
- **Wave counter** — current wave shown
- **Combo multiplier** — kills in quick succession increase score multiplier (shown as a visual flourish)
- Game over screen with score summary and restart option

---

## HUD & UI

- **Minimal but informative HUD** — doesn't obscure the action
- Hull integrity bar — bottom left, styled as a glowing segmented display
- Shield indicator — circular glow ring around the ship or in HUD
- Current weapon + ammo — bottom right with visual icon
- Weapon slots — show collected weapons with highlight on active
- Score + wave + combo — top center, clean typographic display
- **All HUD elements should feel sci-fi, not generic** — use custom styling, glows, scan-line effects subtly

---

## Technical Requirements

- **Framework**: Next.js (App Router) — game runs in a single full-screen page/route
- **Library choice**: Fully autonomous — pick whatever rendering approach (canvas, WebGL, declarative, game engine library) produces the best result for this vision
- **Performance target**: Smooth 60fps with many particles and enemies on screen
- **Responsive**: Game fills the browser viewport; adjusts gracefully to different screen sizes
- **No sound required** — focus entirely on visuals and feel
- Component and game logic should be reasonably organized, not monolithic

---

## Aesthetic Priorities (in order)

1. **Visual quality of ships** — player and enemies must look genuinely impressive
2. **Smoothness** — motion, particles, animations must be fluid
3. **Space atmosphere** — the world must feel vast and alive
4. **Visual feedback** — every hit, death, pickup, and ability must feel impactful
5. **Damage system visuals** — the ship's degradation must be clearly visible and dramatic
6. Gameplay balance (important, but secondary to feel)

---

## Deliverables

- Complete, runnable Next.js project
- Game playable in browser at `/` or `/game` route
- All assets either generated programmatically, sourced from open/free resources, or constructed from primitives
- README with setup instructions (`npm install` + `npm run dev`)

---

*Build something that feels like a premium indie game, not a tutorial demo.*
