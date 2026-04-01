import { Projectile, Vector2 } from '../types';
import { WEAPON_CONFIGS } from '../constants';
import { generateId, normalize, distance, rotateVector } from '../utils';

export function createProjectile(
  x: number,
  y: number,
  angle: number,
  owner: 'player' | 'enemy',
  type: string
): Projectile {
  const config = WEAPON_CONFIGS[type] || {
    damage: 10,
    speed: 8,
    cooldown: 500,
    spread: 0,
    count: 1,
    homing: false,
    color: '#ff4444',
    glowColor: '#cc2222',
    maxAmmo: 0,
    infinite: false,
  };
  
  return {
    id: generateId(),
    position: { x, y },
    velocity: {
      x: Math.cos(angle) * config.speed,
      y: Math.sin(angle) * config.speed,
    },
    rotation: angle,
    radius: type === 'plasma' ? 12 : (type === 'railgun' ? 6 : 4),
    hp: type === 'railgun' ? 10 : 1, // Railgun pierces through enemies
    maxHp: 1,
    active: true,
    damage: config.damage,
    owner,
    type: type as any,
    lifetime: type === 'missile' ? 3000 : 2000,
    homing: config.homing,
  };
}

export function updateProjectile(
  projectile: Projectile,
  playerPosition: Vector2,
  dt: number
): void {
  // Homing behavior for missiles
  if (projectile.homing && projectile.type === 'missile') {
    const targetDir = normalize({
      x: playerPosition.x - projectile.position.x,
      y: playerPosition.y - projectile.position.y,
    });
    
    const currentDir = normalize(projectile.velocity);
    
    // Smoothly turn towards target
    const turnSpeed = 0.08 * dt;
    const newDir = {
      x: currentDir.x + (targetDir.x - currentDir.x) * turnSpeed,
      y: currentDir.y + (targetDir.y - currentDir.y) * turnSpeed,
    };
    
    const normalized = normalize(newDir);
    const speed = Math.sqrt(projectile.velocity.x ** 2 + projectile.velocity.y ** 2);
    
    projectile.velocity.x = normalized.x * speed;
    projectile.velocity.y = normalized.y * speed;
    projectile.rotation = Math.atan2(projectile.velocity.y, projectile.velocity.x);
  }
  
  // Update position
  projectile.position.x += projectile.velocity.x * dt;
  projectile.position.y += projectile.velocity.y * dt;
  
  // Decrease lifetime
  projectile.lifetime -= dt * 16.67;
}

export function getProjectileColor(type: string): string {
  const config = WEAPON_CONFIGS[type];
  return config?.color || '#ff4444';
}

export function getProjectileGlowColor(type: string): string {
  const config = WEAPON_CONFIGS[type];
  return config?.glowColor || '#cc2222';
}

export function getProjectileSize(type: string): number {
  switch (type) {
    case 'plasma': return 12;
    case 'railgun': return 6;
    case 'missile': return 8;
    case 'emp': return 10;
    case 'enemyLaser': return 4;
    default: return 4;
  }
}
