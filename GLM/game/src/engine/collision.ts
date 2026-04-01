import { GameState } from './types';
import { circleCollision, vec2, vecFromAngle, randRange } from './math';
import { PLAYER_RADIUS } from './constants';
import { damagePlayer } from './entities/Player';
import { damageEnemy } from './entities/Enemy';
import { Game } from './Game';
import { WEAPON_DEFS, PICKUP_RADIUS } from './constants';

export function resolveCollisions(state: GameState, game: Game) {
  const { player, enemies, projectiles, pickups } = state;

  if (!player.alive) return;

  for (const proj of projectiles) {
    if (!proj.alive) continue;

    if (proj.owner === 'player') {
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (circleCollision(proj.pos, proj.radius, enemy.pos, enemy.radius)) {
          proj.alive = false;
          damageEnemy(state, enemy, proj.damage, game);

          if (proj.weaponType === 'emp') {
            for (const other of enemies) {
              if (other.alive && other !== enemy) {
                const dist = Math.sqrt(
                  (other.pos.x - proj.pos.x) ** 2 + (other.pos.y - proj.pos.y) ** 2
                );
                if (dist < 150) {
                  damageEnemy(state, other, proj.damage * 0.5, game);
                }
              }
            }
          }
          break;
        }
      }
    } else {
      if (circleCollision(proj.pos, proj.radius, player.pos, PLAYER_RADIUS)) {
        proj.alive = false;
        damagePlayer(state, proj.damage, game);
      }
    }
  }

  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    if (circleCollision(enemy.pos, enemy.radius, player.pos, PLAYER_RADIUS)) {
      if (enemy.type !== 'kamikaze') {
        damagePlayer(state, enemy.damage * 0.5, game);
        const pushDir = {
          x: player.pos.x - enemy.pos.x,
          y: player.pos.y - enemy.pos.y,
        };
        const len = Math.sqrt(pushDir.x * pushDir.x + pushDir.y * pushDir.y) || 1;
        player.vel.x += (pushDir.x / len) * 100;
        player.vel.y += (pushDir.y / len) * 100;
      }
    }
  }

  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    for (const other of enemies) {
      if (!other.alive || other === enemy) continue;
      if (circleCollision(enemy.pos, enemy.radius, other.pos, other.radius)) {
        const dx = other.pos.x - enemy.pos.x;
        const dy = other.pos.y - enemy.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const overlap = (enemy.radius + other.radius - dist) * 0.5;
        enemy.pos.x -= (dx / dist) * overlap;
        enemy.pos.y -= (dy / dist) * overlap;
        other.pos.x += (dx / dist) * overlap;
        other.pos.y += (dy / dist) * overlap;
      }
    }
  }
}
