import { Enemy, EnemyType, Vector2 } from './types';
import { ENEMIES, WAVES } from './constants';

let nextId = 0;

export function createEnemy(type: EnemyType, x: number, y: number): Enemy {
  const e = ENEMIES[type];
  return {
    id: nextId++,
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: e.hp,
    maxHp: e.hp,
    speed: e.speed,
    fireRate: e.fireRate,
    fireCooldown: Math.random() * e.fireRate,
    color: e.color,
    size: e.size,
    scoreValue: e.score,
    angle: 0,
    behaviorTimer: 0,
    behaviorState: 0,
    reinforcementTimer: 0,
    callsReinforcements: e.callsReinforcements,
  };
}

export function updateEnemyAI(
  enemy: Enemy,
  playerX: number,
  playerY: number,
  dt: number,
  enemies: Enemy[]
): { dx: number; dy: number; angle: number } {
  enemy.behaviorTimer -= dt;
  enemy.reinforcementTimer -= dt;

  const dx = playerX - enemy.x;
  const dy = playerY - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angleToPlayer = Math.atan2(dy, dx);

  let moveX = 0;
  let moveY = 0;
  let targetAngle = enemy.angle;

  switch (enemy.type) {
    case 'scout': {
      if (enemy.behaviorTimer <= 0) {
        enemy.behaviorState = Math.floor(Math.random() * 3);
        enemy.behaviorTimer = 1 + Math.random() * 2;
      }
      if (enemy.behaviorState === 0) {
        moveX = Math.cos(angleToPlayer) * enemy.speed;
        moveY = Math.sin(angleToPlayer) * enemy.speed;
        targetAngle = angleToPlayer;
      } else if (enemy.behaviorState === 1) {
        const strafeAngle = angleToPlayer + Math.PI / 2;
        moveX = Math.cos(strafeAngle) * enemy.speed;
        moveY = Math.sin(strafeAngle) * enemy.speed;
        targetAngle = strafeAngle;
      } else {
        const retreatAngle = angleToPlayer + Math.PI;
        moveX = Math.cos(retreatAngle) * enemy.speed * 0.5;
        moveY = Math.sin(retreatAngle) * enemy.speed * 0.5;
        targetAngle = angleToPlayer;
      }
      break;
    }
    case 'fighter': {
      if (enemy.behaviorTimer <= 0) {
        enemy.behaviorState = Math.random() < 0.5 ? 0 : 1;
        enemy.behaviorTimer = 1.5 + Math.random() * 2;
      }
      if (enemy.behaviorState === 0) {
        moveX = Math.cos(angleToPlayer) * enemy.speed;
        moveY = Math.sin(angleToPlayer) * enemy.speed;
        targetAngle = angleToPlayer;
      } else {
        const circleAngle = angleToPlayer + Math.PI / 2;
        moveX = Math.cos(circleAngle) * enemy.speed;
        moveY = Math.sin(circleAngle) * enemy.speed;
        targetAngle = circleAngle;
      }
      break;
    }
    case 'gunship': {
      if (dist > 250) {
        moveX = Math.cos(angleToPlayer) * enemy.speed;
        moveY = Math.sin(angleToPlayer) * enemy.speed;
        targetAngle = angleToPlayer;
      } else if (dist < 150) {
        const retreatAngle = angleToPlayer + Math.PI;
        moveX = Math.cos(retreatAngle) * enemy.speed * 0.3;
        moveY = Math.sin(retreatAngle) * enemy.speed * 0.3;
        targetAngle = angleToPlayer;
      } else {
        const strafeAngle = angleToPlayer + Math.PI / 2;
        moveX = Math.cos(strafeAngle) * enemy.speed * 0.5;
        moveY = Math.sin(strafeAngle) * enemy.speed * 0.5;
        targetAngle = strafeAngle;
      }
      break;
    }
    case 'kamikaze': {
      moveX = Math.cos(angleToPlayer) * enemy.speed;
      moveY = Math.sin(angleToPlayer) * enemy.speed;
      targetAngle = angleToPlayer;
      break;
    }
    case 'sniper': {
      if (dist > 350) {
        moveX = Math.cos(angleToPlayer) * enemy.speed;
        moveY = Math.sin(angleToPlayer) * enemy.speed;
        targetAngle = angleToPlayer;
      } else if (dist < 280) {
        const retreatAngle = angleToPlayer + Math.PI;
        moveX = Math.cos(retreatAngle) * enemy.speed;
        moveY = Math.sin(retreatAngle) * enemy.speed;
        targetAngle = retreatAngle;
      } else {
        const strafeAngle = angleToPlayer + Math.PI / 2;
        moveX = Math.cos(strafeAngle) * enemy.speed * 0.3;
        moveY = Math.sin(strafeAngle) * enemy.speed * 0.3;
        targetAngle = angleToPlayer + Math.PI;
      }
      break;
    }
    case 'swarm': {
      const separationX: number[] = [];
      const separationY: number[] = [];
      for (const other of enemies) {
        if (other.id === enemy.id) continue;
        const sdx = enemy.x - other.x;
        const sdy = enemy.y - other.y;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
        if (sdist < 40 && sdist > 0) {
          separationX.push(sdx / sdist);
          separationY.push(sdy / sdist);
        }
      }
      let sepX = 0, sepY = 0;
      if (separationX.length > 0) {
        sepX = separationX.reduce((a, b) => a + b, 0) / separationX.length * 100;
        sepY = separationY.reduce((a, b) => a + b, 0) / separationY.length * 100;
      }
      moveX = Math.cos(angleToPlayer) * enemy.speed + sepX;
      moveY = Math.sin(angleToPlayer) * enemy.speed + sepY;
      targetAngle = angleToPlayer;
      break;
    }
    case 'elite': {
      if (enemy.behaviorTimer <= 0) {
        enemy.behaviorState = Math.floor(Math.random() * 4);
        enemy.behaviorTimer = 1.5 + Math.random() * 2;
      }
      if (enemy.behaviorState === 0) {
        moveX = Math.cos(angleToPlayer) * enemy.speed;
        moveY = Math.sin(angleToPlayer) * enemy.speed;
        targetAngle = angleToPlayer;
      } else if (enemy.behaviorState === 1) {
        const circleAngle = angleToPlayer + Math.PI / 2;
        moveX = Math.cos(circleAngle) * enemy.speed;
        moveY = Math.sin(circleAngle) * enemy.speed;
        targetAngle = circleAngle;
      } else if (enemy.behaviorState === 2) {
        const retreatAngle = angleToPlayer + Math.PI;
        moveX = Math.cos(retreatAngle) * enemy.speed * 0.5;
        moveY = Math.sin(retreatAngle) * enemy.speed * 0.5;
        targetAngle = angleToPlayer;
      } else {
        moveX = Math.cos(angleToPlayer) * enemy.speed;
        moveY = Math.sin(angleToPlayer) * enemy.speed;
        targetAngle = angleToPlayer;
      }
      break;
    }
  }

  return { dx: moveX, dy: moveY, angle: targetAngle };
}

export function shouldEnemyFire(enemy: Enemy, playerX: number, playerY: number, dt: number): boolean {
  enemy.fireCooldown -= dt;
  if (enemy.fireCooldown > 0) return false;

  const dx = playerX - enemy.x;
  const dy = playerY - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const fireRange = enemy.type === 'sniper' ? 500 : enemy.type === 'kamikaze' ? 9999 : 350;

  if (dist < fireRange) {
    enemy.fireCooldown = enemy.fireRate;
    return true;
  }
  return false;
}

export function shouldCallReinforcements(enemy: Enemy, dt: number): boolean {
  if (!enemy.callsReinforcements) return false;
  enemy.reinforcementTimer -= dt;
  if (enemy.reinforcementTimer <= 0 && enemy.hp < enemy.maxHp * 0.6) {
    enemy.reinforcementTimer = 999;
    return true;
  }
  return false;
}
