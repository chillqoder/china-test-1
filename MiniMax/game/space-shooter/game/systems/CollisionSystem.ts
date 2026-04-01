import * as PIXI from 'pixi.js';
import { Entity } from '../entities/Entity';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Pickup } from '../entities/Pickup';

export class CollisionSystem {
  checkCollisions(
    player: Player,
    enemies: Enemy[],
    playerProjectiles: Projectile[],
    enemyProjectiles: Projectile[],
    pickups: Pickup[]
  ): {
    playerHits: Enemy[];
    enemyHits: { enemy: Enemy; projectile: Projectile }[];
    projectileHits: { projectile: Projectile; target: Entity }[];
    pickupHits: Pickup[];
    kamikazeCollisions: Enemy[];
  } {
    const playerHits: Enemy[] = [];
    const enemyHits: { enemy: Enemy; projectile: Projectile }[] = [];
    const projectileHits: { projectile: Projectile; target: Entity }[] = [];
    const pickupHits: Pickup[] = [];
    const kamikazeCollisions: Enemy[] = [];

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      if (this.circleCollision(player, enemy)) {
        playerHits.push(enemy);
        if (enemy.type === 'kamikaze') {
          kamikazeCollisions.push(enemy);
        }
      }

      for (const proj of playerProjectiles) {
        if (!proj.alive) continue;
        if (proj.owner !== 'player') continue;
        
        if (this.circleCollision(proj, enemy)) {
          enemyHits.push({ enemy, projectile: proj });
          projectileHits.push({ projectile: proj, target: enemy });
        }
      }

      if (enemy.canFire(Date.now()) && enemy.type !== 'kamikaze' && enemy.type !== 'swarm') {
        if (enemy.distanceTo(player) < 400) {
          const proj = this.createEnemyProjectile(enemy, player);
          if (proj) {
            enemyProjectiles.push(proj);
            enemy.fire(Date.now());
          }
        }
      }
    }

    for (const proj of enemyProjectiles) {
      if (!proj.alive) continue;
      if (this.circleCollision(proj, player)) {
        projectileHits.push({ projectile: proj, target: player });
      }
    }

    for (const pickup of pickups) {
      if (!pickup.alive) continue;
      if (this.circleCollision(pickup, player)) {
        pickupHits.push(pickup);
      }
    }

    return { playerHits, enemyHits, projectileHits, pickupHits, kamikazeCollisions };
  }

  private circleCollision(a: Entity, b: Entity): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < a.colliderRadius + b.colliderRadius;
  }

  private createEnemyProjectile(enemy: Enemy, player: Player): Projectile | null {
    const { EnemyProjectile } = require('../entities/Projectile');
    const angle = enemy.angleTo(player);
    return new EnemyProjectile(enemy.x, enemy.y, angle, enemy.damage);
  }
}

export class EnemyProjectile extends Projectile {
  constructor(x: number, y: number, angle: number, damage: number) {
    const fakeWeaponType = 'laser';
    super(x, y, angle, fakeWeaponType as any, 'enemy');
    this.damage = damage;
  }

  render(): void {
    const g = new PIXI.Graphics();
    g.circle(0, 0, 5);
    g.fill({ color: 0xff4444 });
    g.circle(0, 0, 3);
    g.fill({ color: 0xffaaaa });
    this.sprite.addChild(g);
  }
}
