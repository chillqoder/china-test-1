import { GameState, EnemyState, EnemyType } from '../types';
import { ENEMY_DEFS, MAX_ENEMIES, PICKUP_LIFETIME, PICKUP_RADIUS } from '../constants';
import {
  vec2,
  vecDist,
  vecNorm,
  vecScale,
  vecAdd,
  vecFromAngle,
  angleBetween,
  randRange,
} from '../math';
import { Game } from '../Game';
import { spawnExplosion } from './Player';
import { WeaponType, PickupType } from '../types';

const DROPPABLE_WEAPONS: WeaponType[] = ['spread', 'railgun', 'missile', 'emp', 'plasma'];

const behaviors = {
  scout: updateScout,
  fighter: updateFighter,
  gunship: updateGunship,
  kamikaze: updateKamikaze,
  sniper: updateSniper,
  swarm: updateSwarm,
  elite: updateElite,
};

export function createEnemy(type: EnemyType, pos: { x: number; y: number }, id: number): EnemyState {
  const def = ENEMY_DEFS[type];
  return {
    id,
    type,
    pos: vec2(pos.x, pos.y),
    vel: vec2(0, 0),
    angle: 0,
    hp: def.hp,
    maxHp: def.hp,
    alive: true,
    aiTimer: randRange(0, 2),
    aiState: 'approach',
    fireTimer: randRange(0, def.fireRate || 1),
    alertSent: false,
    radius: def.radius,
    speed: def.speed,
    damage: def.damage,
    scoreValue: def.scoreValue,
    spawnAnimTimer: 0.5,
  };
}

export function updateEnemy(state: GameState, enemy: EnemyState, dt: number, game: Game) {
  if (!enemy.alive) return;

  if (enemy.spawnAnimTimer > 0) {
    enemy.spawnAnimTimer -= dt;
  }

  const fn = behaviors[enemy.type];
  if (fn) fn(state, enemy, dt, game);

  enemy.pos.x += enemy.vel.x * dt;
  enemy.pos.y += enemy.vel.y * dt;

  enemy.pos.x = Math.max(-3500, Math.min(3500, enemy.pos.x));
  enemy.pos.y = Math.max(-3500, Math.min(3500, enemy.pos.y));

  const targetAngle = angleBetween(enemy.pos, state.player.pos);
  let angleDiff = targetAngle - enemy.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  enemy.angle += angleDiff * 5 * dt;
}

export function damageEnemy(state: GameState, enemy: EnemyState, damage: number, game: Game) {
  if (!enemy.alive) return;
  enemy.hp -= damage;

  for (let i = 0; i < 3; i++) {
    const a = Math.random() * Math.PI * 2;
    game.spawnParticle({
      pos: vec2(enemy.pos.x + (Math.random() - 0.5) * 6, enemy.pos.y + (Math.random() - 0.5) * 6),
      vel: vec2(Math.cos(a) * 40, Math.sin(a) * 40),
      color: '#ffaa00',
      alpha: 1,
      size: 2 + Math.random() * 2,
      lifetime: 0.2 + Math.random() * 0.2,
      maxLifetime: 0.4,
      decay: 1,
      glow: true,
    });
  }

  if (enemy.hp <= 0) {
    enemy.alive = false;
    spawnExplosion(enemy.pos, enemy.radius, game);
    state.screenShake = Math.max(state.screenShake, enemy.radius * 0.15);

    state.combo++;
    state.comboTimer = 2;
    state.comboMultiplier = Math.min(8, Math.floor(state.combo / 3) + 1);
    state.score += enemy.scoreValue * state.comboMultiplier;

    const dropChance = enemy.type === 'elite' ? 1.0 : enemy.type === 'gunship' ? 0.4 : 0.15;
    if (Math.random() < dropChance) {
      const isRepair = Math.random() < 0.35;
      const pickupType: PickupType = isRepair ? 'repair' : 'weapon';
      const weaponType = isRepair ? undefined : DROPPABLE_WEAPONS[Math.floor(Math.random() * DROPPABLE_WEAPONS.length)];
      const dropAngle = Math.random() * Math.PI * 2;
      state.pickups.push({
        id: game.getNextId(),
        pos: vec2(enemy.pos.x, enemy.pos.y),
        vel: vec2(Math.cos(dropAngle) * 30, Math.sin(dropAngle) * 30),
        type: pickupType,
        weaponType,
        alive: true,
        lifetime: PICKUP_LIFETIME,
        radius: PICKUP_RADIUS,
        pulseTimer: 0,
      });
    }

    if (!enemy.alertSent && enemy.hp <= 0 && Math.random() < 0.3 && state.enemies.length < MAX_ENEMIES) {
      const alertCount = enemy.type === 'elite' ? 3 : 2;
      for (let i = 0; i < alertCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const dist = 400 + Math.random() * 200;
        const spawnPos = vec2(enemy.pos.x + Math.cos(a) * dist, enemy.pos.y + Math.sin(a) * dist);
        const newEnemy = createEnemy('fighter', spawnPos, game.getNextId());
        newEnemy.alertSent = true;
        state.enemies.push(newEnemy);
      }
    }
  }
}

function enemyFire(state: GameState, enemy: EnemyState, game: Game) {
  const angle = angleBetween(enemy.pos, state.player.pos);
  const spread = enemy.type === 'elite' ? 0.1 : 0.15;
  state.projectiles.push({
    id: game.getNextId(),
    pos: vec2(enemy.pos.x, enemy.pos.y),
    vel: vecFromAngle(angle + (Math.random() - 0.5) * spread, 600),
    angle,
    weaponType: 'laser',
    damage: enemy.damage,
    owner: 'enemy',
    alive: true,
    lifetime: 2,
    maxLifetime: 2,
    radius: 3,
  });
}

function approachPlayer(enemy: EnemyState, playerPos: { x: number; y: number }, targetDist: number, speed: number) {
  const dist = vecDist(enemy.pos, playerPos);
  if (dist > targetDist + 30) {
    const dir = vecNorm({ x: playerPos.x - enemy.pos.x, y: playerPos.y - enemy.pos.y });
    enemy.vel.x = dir.x * speed;
    enemy.vel.y = dir.y * speed;
  } else if (dist < targetDist - 30) {
    const dir = vecNorm({ x: enemy.pos.x - playerPos.x, y: enemy.pos.y - playerPos.y });
    enemy.vel.x = dir.x * speed * 0.5;
    enemy.vel.y = dir.y * speed * 0.5;
  } else {
    enemy.vel.x *= 0.95;
    enemy.vel.y *= 0.95;
  }
}

function updateScout(state: GameState, enemy: EnemyState, dt: number, game: Game) {
  const pp = state.player.pos;
  enemy.aiTimer -= dt;

  if (enemy.aiTimer <= 0) {
    const states = ['approach', 'circle', 'strafe'];
    enemy.aiState = states[Math.floor(Math.random() * states.length)];
    enemy.aiTimer = randRange(1, 2.5);
  }

  switch (enemy.aiState) {
    case 'approach':
      approachPlayer(enemy, pp, 150, enemy.speed);
      break;
    case 'circle': {
      const angle = Math.atan2(enemy.pos.y - pp.y, enemy.pos.x - pp.x) + 2 * dt;
      const targetX = pp.x + Math.cos(angle) * 180;
      const targetY = pp.y + Math.sin(angle) * 180;
      enemy.vel.x = (targetX - enemy.pos.x) * 3;
      enemy.vel.y = (targetY - enemy.pos.y) * 3;
      break;
    }
    case 'strafe': {
      const perpAngle = angleBetween(pp, enemy.pos) + Math.PI / 2;
      enemy.vel.x = Math.cos(perpAngle) * enemy.speed;
      enemy.vel.y = Math.sin(perpAngle) * enemy.speed;
      break;
    }
  }

  enemy.fireTimer -= dt;
  if (enemy.fireTimer <= 0 && vecDist(enemy.pos, pp) < 400) {
    enemyFire(state, enemy, game);
    enemy.fireTimer = ENEMY_DEFS.scout.fireRate;
  }
}

function updateFighter(state: GameState, enemy: EnemyState, dt: number, game: Game) {
  const pp = state.player.pos;
  enemy.aiTimer -= dt;

  if (enemy.aiTimer <= 0) {
    enemy.aiState = Math.random() > 0.5 ? 'approach' : 'flank';
    enemy.aiTimer = randRange(1.5, 3);
  }

  switch (enemy.aiState) {
    case 'approach':
      approachPlayer(enemy, pp, 200, enemy.speed);
      break;
    case 'flank': {
      const flankAngle = angleBetween(enemy.pos, pp) + (Math.random() > 0.5 ? 1 : -1) * Math.PI / 3;
      const target = vecAdd(pp, vecFromAngle(flankAngle, 200));
      const dir = vecNorm(vecSub(target, enemy.pos));
      enemy.vel.x = dir.x * enemy.speed;
      enemy.vel.y = dir.y * enemy.speed;
      break;
    }
  }

  enemy.fireTimer -= dt;
  if (enemy.fireTimer <= 0 && vecDist(enemy.pos, pp) < 500) {
    enemyFire(state, enemy, game);
    enemy.fireTimer = ENEMY_DEFS.fighter.fireRate;
  }
}

function updateGunship(state: GameState, enemy: EnemyState, dt: number, game: Game) {
  const pp = state.player.pos;
  approachPlayer(enemy, pp, 250, enemy.speed);

  enemy.fireTimer -= dt;
  if (enemy.fireTimer <= 0 && vecDist(enemy.pos, pp) < 500) {
    for (let i = -1; i <= 1; i++) {
      const angle = angleBetween(enemy.pos, pp) + i * 0.2;
      state.projectiles.push({
        id: game.getNextId(),
        pos: vec2(enemy.pos.x, enemy.pos.y),
        vel: vecFromAngle(angle, 500),
        angle,
        weaponType: 'laser',
        damage: enemy.damage,
        owner: 'enemy',
        alive: true,
        lifetime: 2,
        maxLifetime: 2,
        radius: 4,
      });
    }
    enemy.fireTimer = ENEMY_DEFS.gunship.fireRate;
  }
}

function updateKamikaze(state: GameState, enemy: EnemyState, dt: number, game: Game) {
  const pp = state.player.pos;
  const dir = vecNorm(vecSub(pp, enemy.pos));
  enemy.vel.x = dir.x * enemy.speed;
  enemy.vel.y = dir.y * enemy.speed;

  if (vecDist(enemy.pos, pp) < enemy.radius + 28) {
    enemy.alive = false;
    spawnExplosion(enemy.pos, 25, game);
    state.screenShake = Math.max(state.screenShake, 5);
  }
}

function updateSniper(state: GameState, enemy: EnemyState, dt: number, game: Game) {
  const pp = state.player.pos;
  const dist = vecDist(enemy.pos, pp);

  if (dist < 350) {
    const dir = vecNorm(vecSub(enemy.pos, pp));
    enemy.vel.x = dir.x * enemy.speed;
    enemy.vel.y = dir.y * enemy.speed;
  } else if (dist > 500) {
    approachPlayer(enemy, pp, 450, enemy.speed);
  } else {
    enemy.vel.x *= 0.9;
    enemy.vel.y *= 0.9;
  }

  enemy.fireTimer -= dt;
  if (enemy.fireTimer <= 0) {
    const angle = angleBetween(enemy.pos, pp);
    state.projectiles.push({
      id: game.getNextId(),
      pos: vec2(enemy.pos.x, enemy.pos.y),
      vel: vecFromAngle(angle, 1000),
      angle,
      weaponType: 'laser',
      damage: enemy.damage,
      owner: 'enemy',
      alive: true,
      lifetime: 3,
      maxLifetime: 3,
      radius: 3,
    });
    enemy.fireTimer = ENEMY_DEFS.sniper.fireRate;
  }
}

function updateSwarm(state: GameState, enemy: EnemyState, dt: number, game: Game) {
  const pp = state.player.pos;
  const dir = vecNorm(vecSub(pp, enemy.pos));
  const wobble = Math.sin(state.time * 5 + enemy.id * 7) * 1.5;
  const perpAngle = Math.atan2(dir.y, dir.x) + Math.PI / 2;
  enemy.vel.x = (dir.x * enemy.speed + Math.cos(perpAngle) * wobble * 30);
  enemy.vel.y = (dir.y * enemy.speed + Math.sin(perpAngle) * wobble * 30);

  enemy.fireTimer -= dt;
  if (enemy.fireTimer <= 0 && vecDist(enemy.pos, pp) < 300) {
    enemyFire(state, enemy, game);
    enemy.fireTimer = ENEMY_DEFS.swarm.fireRate;
  }
}

function updateElite(state: GameState, enemy: EnemyState, dt: number, game: Game) {
  const pp = state.player.pos;
  enemy.aiTimer -= dt;

  if (enemy.aiTimer <= 0) {
    const states = ['approach', 'circle', 'strafe', 'retreat'];
    enemy.aiState = states[Math.floor(Math.random() * states.length)];
    enemy.aiTimer = randRange(2, 4);
  }

  switch (enemy.aiState) {
    case 'approach':
      approachPlayer(enemy, pp, 250, enemy.speed);
      break;
    case 'circle': {
      const angle = Math.atan2(enemy.pos.y - pp.y, enemy.pos.x - pp.x) + 1.5 * dt;
      const targetX = pp.x + Math.cos(angle) * 250;
      const targetY = pp.y + Math.sin(angle) * 250;
      enemy.vel.x = (targetX - enemy.pos.x) * 2;
      enemy.vel.y = (targetY - enemy.pos.y) * 2;
      break;
    }
    case 'strafe': {
      const perpAngle = angleBetween(pp, enemy.pos) + Math.PI / 2;
      enemy.vel.x = Math.cos(perpAngle) * enemy.speed * 1.2;
      enemy.vel.y = Math.sin(perpAngle) * enemy.speed * 1.2;
      break;
    }
    case 'retreat': {
      const dir = vecNorm(vecSub(enemy.pos, pp));
      enemy.vel.x = dir.x * enemy.speed;
      enemy.vel.y = dir.y * enemy.speed;
      break;
    }
  }

  enemy.fireTimer -= dt;
  if (enemy.fireTimer <= 0) {
    for (let i = 0; i < 3; i++) {
      const angle = angleBetween(enemy.pos, pp) + (i - 1) * 0.15;
      state.projectiles.push({
        id: game.getNextId(),
        pos: vec2(enemy.pos.x, enemy.pos.y),
        vel: vecFromAngle(angle, 550),
        angle,
        weaponType: 'laser',
        damage: enemy.damage,
        owner: 'enemy',
        alive: true,
        lifetime: 2,
        maxLifetime: 2,
        radius: 4,
      });
    }
    enemy.fireTimer = ENEMY_DEFS.elite.fireRate;
  }
}

function vecSub(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: a.x - b.x, y: a.y - b.y };
}
