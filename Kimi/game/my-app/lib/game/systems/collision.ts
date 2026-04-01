import { GameState, Player, Enemy, Projectile, Pickup } from '../types';
import { GAME_CONFIG, ENEMY_CONFIGS, WEAPON_CONFIGS } from '../constants';
import { distance } from '../utils';
import { applyDamageToPlayer, repairPlayer, rechargeShield, addWeapon } from './player';
import { createExplosion, createShieldHit, createWeaponPickupEffect } from './particles';

export function checkCollisions(state: GameState, now: number): void {
  // Projectile collisions
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const projectile = state.projectiles[i];
    
    if (projectile.owner === 'player') {
      // Player projectile hitting enemies
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const enemy = state.enemies[j];
        if (checkEntityCollision(projectile, enemy)) {
          enemy.hp -= projectile.damage;
          
          // Create hit effect
          createExplosion(state, projectile.position.x, projectile.position.y, projectile.type === 'railgun' ? '#ffffff' : WEAPON_CONFIGS[projectile.type]?.color || '#ffffff', 5);
          
          // Railgun pierces, others are destroyed
          if (projectile.type !== 'railgun') {
            state.projectiles.splice(i, 1);
            break;
          } else {
            projectile.hp--;
            if (projectile.hp <= 0) {
              state.projectiles.splice(i, 1);
              break;
            }
          }
        }
      }
    } else {
      // Enemy projectile hitting player
      if (checkEntityCollision(projectile, state.player)) {
        const damage = ENEMY_CONFIGS[state.enemies.find(e => e.type)?.type || 'scout']?.damage || 10;
        
        if (state.player.shield > 0) {
          createShieldHit(state, projectile.position.x, projectile.position.y, Math.atan2(
            state.player.position.y - projectile.position.y,
            state.player.position.x - projectile.position.x
          ));
        }
        
        applyDamageToPlayer(state.player, damage);
        state.projectiles.splice(i, 1);
        continue;
      }
    }
  }
  
  // Enemy colliding with player (ramming damage)
  for (const enemy of state.enemies) {
    if (checkEntityCollision(enemy, state.player)) {
      const ramDamage = ENEMY_CONFIGS[enemy.type].damage * 0.5;
      
      if (state.player.shield > 0) {
        createShieldHit(state, 
          (enemy.position.x + state.player.position.x) / 2,
          (enemy.position.y + state.player.position.y) / 2,
          Math.atan2(state.player.position.y - enemy.position.y, state.player.position.x - enemy.position.x)
        );
      }
      
      applyDamageToPlayer(state.player, ramDamage);
      enemy.hp -= 10; // Enemy takes some damage too
    }
  }
  
  // Player collecting pickups
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const pickup = state.pickups[i];
    if (checkEntityCollision(pickup, state.player)) {
      collectPickup(state, pickup);
      state.pickups.splice(i, 1);
    }
  }
}

function checkEntityCollision(a: { position: { x: number; y: number }; radius: number }, 
                               b: { position: { x: number; y: number }; radius: number }): boolean {
  const dist = distance(a.position, b.position);
  return dist < a.radius + b.radius;
}

function collectPickup(state: GameState, pickup: Pickup): void {
  switch (pickup.type) {
    case 'weapon':
      if (pickup.weaponType) {
        addWeapon(state.player, pickup.weaponType);
        createWeaponPickupEffect(state, pickup.position.x, pickup.position.y, WEAPON_CONFIGS[pickup.weaponType]?.color || '#ffffff');
      }
      break;
      
    case 'repair':
      repairPlayer(state.player, 25);
      createWeaponPickupEffect(state, pickup.position.x, pickup.position.y, '#44ff44');
      break;
      
    case 'shield':
      rechargeShield(state.player, 25);
      createWeaponPickupEffect(state, pickup.position.x, pickup.position.y, '#44aaff');
      break;
  }
}
