import { GameState, Projectile } from '../types';
import { vec2, vecDist, vecNorm, vecSub, vecFromAngle } from '../math';
import { Game } from '../Game';

export function updateProjectile(state: GameState, proj: Projectile, dt: number, game: Game) {
  if (!proj.alive) return;

  if (proj.weaponType === 'missile' && proj.owner === 'player') {
    const targets = state.enemies.filter(e => e.alive);
    if (targets.length > 0) {
      let closest = targets[0];
      let closestDist = vecDist(proj.pos, closest.pos);
      for (let i = 1; i < targets.length; i++) {
        const d = vecDist(proj.pos, targets[i].pos);
        if (d < closestDist) {
          closestDist = d;
          closest = targets[i];
        }
      }

      const targetAngle = Math.atan2(closest.pos.y - proj.pos.y, closest.pos.x - proj.pos.x);
      let angleDiff = targetAngle - proj.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      proj.angle += angleDiff * 4 * dt;

      const speed = Math.sqrt(proj.vel.x * proj.vel.x + proj.vel.y * proj.vel.y);
      proj.vel.x = Math.cos(proj.angle) * speed;
      proj.vel.y = Math.sin(proj.angle) * speed;
    }
  }

  proj.pos.x += proj.vel.x * dt;
  proj.pos.y += proj.vel.y * dt;
  proj.lifetime -= dt;

  if (proj.weaponType === 'missile' && proj.owner === 'player') {
    if (Math.random() < 0.5) {
      game.spawnParticle({
        pos: vec2(proj.pos.x, proj.pos.y),
        vel: vec2((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20),
        color: '#888888',
        alpha: 0.4,
        size: 2 + Math.random() * 2,
        lifetime: 0.3 + Math.random() * 0.3,
        maxLifetime: 0.6,
        decay: 1,
        glow: false,
      });
    }
  }

  if (proj.weaponType === 'plasma' && proj.owner === 'player') {
    if (Math.random() < 0.3) {
      game.spawnParticle({
        pos: vec2(proj.pos.x + (Math.random() - 0.5) * 8, proj.pos.y + (Math.random() - 0.5) * 8),
        vel: vec2((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15),
        color: '#ff44ff',
        alpha: 0.5,
        size: 2 + Math.random() * 2,
        lifetime: 0.2,
        maxLifetime: 0.2,
        decay: 1,
        glow: true,
      });
    }
  }

  if (proj.lifetime <= 0) {
    proj.alive = false;
  }

  const distFromCenter = Math.sqrt(proj.pos.x * proj.pos.x + proj.pos.y * proj.pos.y);
  if (distFromCenter > 4000) {
    proj.alive = false;
  }
}
