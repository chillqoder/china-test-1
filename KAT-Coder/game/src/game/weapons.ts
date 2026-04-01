import { Weapon, WeaponType, Projectile, Vector2 } from './types';
import { WEAPONS } from './constants';

export function createWeapon(type: WeaponType): Weapon {
  const w = WEAPONS[type];
  return {
    type,
    name: w.name,
    ammo: w.ammo,
    maxAmmo: w.maxAmmo,
    fireRate: w.fireRate,
    damage: w.damage,
    cooldown: 0,
    color: w.color,
  };
}

export function fireWeapon(
  weapon: Weapon,
  x: number,
  y: number,
  angle: number,
  mousePos: Vector2,
  dt: number
): Projectile[] {
  weapon.cooldown -= dt;
  if (weapon.cooldown > 0) return [];
  if (weapon.ammo === 0) return [];

  weapon.cooldown = weapon.fireRate;
  if (weapon.ammo > 0) weapon.ammo--;

  const projectiles: Projectile[] = [];

  switch (weapon.type) {
    case 'laser': {
      projectiles.push({
        x, y,
        vx: Math.cos(angle) * 600,
        vy: Math.sin(angle) * 600,
        damage: weapon.damage,
        owner: 'player',
        type: 'laser',
        life: 1.2,
        color: weapon.color,
        size: 3,
      });
      break;
    }
    case 'spread': {
      for (let i = -2; i <= 2; i++) {
        const a = angle + i * 0.15;
        projectiles.push({
          x, y,
          vx: Math.cos(a) * 450,
          vy: Math.sin(a) * 450,
          damage: weapon.damage,
          owner: 'player',
          type: 'spread',
          life: 0.8,
          color: weapon.color,
          size: 4,
        });
      }
      break;
    }
    case 'railgun': {
      projectiles.push({
        x, y,
        vx: Math.cos(angle) * 1200,
        vy: Math.sin(angle) * 1200,
        damage: weapon.damage,
        owner: 'player',
        type: 'railgun',
        life: 1.5,
        color: weapon.color,
        size: 5,
      });
      break;
    }
    case 'missile': {
      const speed = 250;
      projectiles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: weapon.damage,
        owner: 'player',
        type: 'missile',
        life: 3,
        color: weapon.color,
        size: 5,
        homing: true,
        target: mousePos ? { ...mousePos } : undefined,
      });
      break;
    }
    case 'emp': {
      projectiles.push({
        x, y,
        vx: 0,
        vy: 0,
        damage: weapon.damage,
        owner: 'player',
        type: 'emp',
        life: 0.6,
        color: weapon.color,
        size: 40,
      });
      break;
    }
    case 'plasma': {
      const speed = 300;
      projectiles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: weapon.damage,
        owner: 'player',
        type: 'plasma',
        life: 1.5,
        color: weapon.color,
        size: 8,
      });
      break;
    }
  }

  return projectiles;
}

export function fireEnemyWeapon(
  type: WeaponType,
  x: number,
  y: number,
  angle: number,
  targetX?: number,
  targetY?: number
): Projectile[] {
  const projectiles: Projectile[] = [];
  const speed = 280;

  switch (type) {
    case 'laser':
    case 'spread':
      projectiles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: 5,
        owner: 'enemy',
        type: 'laser',
        life: 1.5,
        color: '#ff4444',
        size: 3,
      });
      break;
    case 'railgun':
      projectiles.push({
        x, y,
        vx: Math.cos(angle) * 500,
        vy: Math.sin(angle) * 500,
        damage: 15,
        owner: 'enemy',
        type: 'railgun',
        life: 2,
        color: '#ff88ff',
        size: 4,
      });
      break;
    default:
      projectiles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: 8,
        owner: 'enemy',
        type: 'laser',
        life: 1.5,
        color: '#ff4444',
        size: 3,
      });
  }

  return projectiles;
}
