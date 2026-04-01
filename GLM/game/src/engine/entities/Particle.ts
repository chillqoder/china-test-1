import { GameState, Particle } from '../types';

export function updateParticles(state: GameState, dt: number) {
  for (const p of state.particles) {
    if (!p.alive) continue;
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.lifetime -= dt * p.decay;
    if (p.lifetime <= 0) {
      p.alive = false;
    }
  }
}
