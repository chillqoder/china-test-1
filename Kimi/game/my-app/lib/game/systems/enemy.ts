import { Enemy, Vector2, Projectile, AIState, EnemyType } from '../types';
import { ENEMY_CONFIGS, WEAPON_CONFIGS } from '../constants';
import { generateId, normalize, angleBetween, distance, magnitude, limitVector, randomRange } from '../utils';
import { createProjectile } from './projectile';

export function createEnemy(x: number, y: number, type: EnemyType, elite: boolean = false): Enemy {
  const config = ENEMY_CONFIGS[type];
  const hpMultiplier = elite ? 2.5 : 1;
  const speedMultiplier = elite ? 1.2 : 1;
  
  let aiState: AIState = 'approach';
  if (type === 'kamikaze') aiState = 'kamikaze';
  if (type === 'sniper') aiState = 'snipe';
  
  return {
    id: generateId(),
    position: { x, y },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    radius: config.radius * (elite ? 1.3 : 1),
    hp: config.hp * hpMultiplier,
    maxHp: config.hp * hpMultiplier,
    active: true,
    type,
    lastShot: 0,
    aiState,
    aiTimer: 0,
    elite,
    value: config.score * (elite ? 2 : 1),
  };
}

export function updateEnemy(enemy: Enemy, player: { position: Vector2 }, dt: number): void {
  const config = ENEMY_CONFIGS[enemy.type];
  const dist = distance(enemy.position, player.position);
  
  // Update AI state
  enemy.aiTimer -= dt * 16.67;
  if (enemy.aiTimer <= 0) {
    enemy.aiState = selectAIState(enemy, dist);
    enemy.aiTimer = randomRange(1000, 3000);
  }
  
  // Execute AI behavior
  const targetDir = normalize({
    x: player.position.x - enemy.position.x,
    y: player.position.y - enemy.position.y,
  });
  
  let desiredVelocity: Vector2 = { x: 0, y: 0 };
  
  switch (enemy.aiState) {
    case 'approach':
      if (dist > 150) {
        desiredVelocity = {
          x: targetDir.x * config.speed,
          y: targetDir.y * config.speed,
        };
      }
      enemy.rotation = angleBetween(enemy.position, player.position);
      break;
      
    case 'retreat':
      if (dist < 300) {
        desiredVelocity = {
          x: -targetDir.x * config.speed * 0.8,
          y: -targetDir.y * config.speed * 0.8,
        };
      }
      enemy.rotation = angleBetween(enemy.position, player.position) + Math.PI;
      break;
      
    case 'strafe':
      const strafeDir = Math.floor(Date.now() / 2000) % 2 === 0 ? 1 : -1;
      desiredVelocity = {
        x: targetDir.x * config.speed * 0.3 - targetDir.y * config.speed * strafeDir,
        y: targetDir.y * config.speed * 0.3 + targetDir.x * config.speed * strafeDir,
      };
      enemy.rotation = angleBetween(enemy.position, player.position);
      break;
      
    case 'circle':
      const circleAngle = Date.now() / 1000;
      desiredVelocity = {
        x: targetDir.x * config.speed * 0.5 - targetDir.y * config.speed * 0.8,
        y: targetDir.y * config.speed * 0.5 + targetDir.x * config.speed * 0.8,
      };
      enemy.rotation = angleBetween(enemy.position, player.position);
      break;
      
    case 'kamikaze':
      desiredVelocity = {
        x: targetDir.x * config.speed * 1.5,
        y: targetDir.y * config.speed * 1.5,
      };
      enemy.rotation = angleBetween(enemy.position, player.position);
      break;
      
    case 'snipe':
      // Stay at optimal range
      const optimalRange = 400;
      const rangeDiff = dist - optimalRange;
      const approachSpeed = Math.sign(rangeDiff) * Math.min(Math.abs(rangeDiff) / 100, 1) * config.speed * 0.5;
      desiredVelocity = {
        x: targetDir.x * approachSpeed,
        y: targetDir.y * approachSpeed,
      };
      enemy.rotation = angleBetween(enemy.position, player.position);
      break;
      
    case 'flee':
      desiredVelocity = {
        x: -targetDir.x * config.speed,
        y: -targetDir.y * config.speed,
      };
      break;
  }
  
  // Apply velocity with smoothing
  enemy.velocity.x += (desiredVelocity.x - enemy.velocity.x) * 0.1 * dt;
  enemy.velocity.y += (desiredVelocity.y - enemy.velocity.y) * 0.1 * dt;
  
  // Apply speed limits
  const maxSpeed = config.speed * (enemy.elite ? 1.2 : 1);
  enemy.velocity = limitVector(enemy.velocity, maxSpeed);
  
  // Update position
  enemy.position.x += enemy.velocity.x * dt;
  enemy.position.y += enemy.velocity.y * dt;
}

function selectAIState(enemy: Enemy, dist: number): AIState {
  switch (enemy.type) {
    case 'scout':
      if (dist < 100) return 'retreat';
      if (dist > 400) return 'approach';
      return Math.random() < 0.5 ? 'strafe' : 'circle';
      
    case 'fighter':
      if (dist < 150) return Math.random() < 0.5 ? 'strafe' : 'retreat';
      if (dist > 350) return 'approach';
      return 'strafe';
      
    case 'gunship':
      if (dist < 200) return 'retreat';
      if (dist > 500) return 'approach';
      return 'circle';
      
    case 'kamikaze':
      return 'kamikaze';
      
    case 'sniper':
      if (dist < 250) return 'flee';
      return 'snipe';
      
    case 'swarm':
      if (dist < 80) return 'retreat';
      return 'approach';
      
    case 'elite':
      if (dist < 200) return 'strafe';
      if (dist > 450) return 'approach';
      return Math.random() < 0.4 ? 'strafe' : 'circle';
      
    default:
      return 'approach';
  }
}

export function enemyShoot(enemy: Enemy, player: { position: Vector2 }): Projectile | null {
  const config = ENEMY_CONFIGS[enemy.type];
  if (config.fireRate <= 0) return null;
  
  // Check if player is roughly in front
  const angleToPlayer = angleBetween(enemy.position, player.position);
  let rotationDiff = angleToPlayer - enemy.rotation;
  while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
  while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
  
  if (Math.abs(rotationDiff) > 0.5) return null;
  
  enemy.lastShot = Date.now();
  
  return createProjectile(
    enemy.position.x + Math.cos(enemy.rotation) * enemy.radius,
    enemy.position.y + Math.sin(enemy.rotation) * enemy.radius,
    enemy.rotation + randomRange(-0.1, 0.1),
    'enemy',
    'enemyLaser'
  );
}

export function getSpawnPosition(canvasSize: Vector2, playerPosition: Vector2): Vector2 {
  const margin = 100;
  const side = Math.floor(Math.random() * 4);
  let x, y;
  
  switch (side) {
    case 0: // Top
      x = Math.random() * canvasSize.x;
      y = -margin;
      break;
    case 1: // Right
      x = canvasSize.x + margin;
      y = Math.random() * canvasSize.y;
      break;
    case 2: // Bottom
      x = Math.random() * canvasSize.x;
      y = canvasSize.y + margin;
      break;
    case 3: // Left
    default:
      x = -margin;
      y = Math.random() * canvasSize.y;
      break;
  }
  
  // Ensure minimum distance from player
  const dist = Math.sqrt((x - playerPosition.x) ** 2 + (y - playerPosition.y) ** 2);
  if (dist < 300) {
    const angle = Math.atan2(y - playerPosition.y, x - playerPosition.x);
    const minDist = 400;
    x = playerPosition.x + Math.cos(angle) * minDist;
    y = playerPosition.y + Math.sin(angle) * minDist;
  }
  
  return { x, y };
}
