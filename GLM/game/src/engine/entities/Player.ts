import { GameState, PlayerState, InputState } from '../types';
import {
  PLAYER_ACCELERATION,
  PLAYER_MAX_SPEED,
  PLAYER_FRICTION,
  PLAYER_SHIELD_REGEN_DELAY,
  PLAYER_SHIELD_REGEN_RATE,
  PLAYER_MAX_SHIELD,
  PLAYER_RADIUS,
  PLAYER_INVULN_TIME,
  PICKUP_RADIUS,
  REPAIR_AMOUNT,
} from '../constants';
import {
  vecAdd,
  vecScale,
  vecNorm,
  vecLen,
  vecFromAngle,
  angleBetween,
  lerpAngle,
  clamp,
  vec2,
  circleCollision,
} from '../math';
import { Game } from '../Game';

export function updatePlayer(state: GameState, input: InputState, dt: number, game: Game) {
  const p = state.player;
  if (!p.alive) return;

  const cam = state.camera;
  const mouseWorld = vec2(input.mouseX + cam.x - game.width / 2, input.mouseY + cam.y - game.height / 2);
  const targetAngle = angleBetween(p.pos, mouseWorld);
  p.angle = lerpAngle(p.angle, targetAngle, 12 * dt);

  let ax = 0, ay = 0;
  if (input.keys.has('w') || input.keys.has('arrowup')) ay -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) ay += 1;
  if (input.keys.has('a') || input.keys.has('arrowleft')) ax -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) ax += 1;

  const inputLen = Math.sqrt(ax * ax + ay * ay);
  if (inputLen > 0) {
    ax /= inputLen;
    ay /= inputLen;
    p.vel.x += ax * PLAYER_ACCELERATION * dt;
    p.vel.y += ay * PLAYER_ACCELERATION * dt;
  }

  p.vel.x -= p.vel.x * PLAYER_FRICTION * dt;
  p.vel.y -= p.vel.y * PLAYER_FRICTION * dt;

  const hpPct = p.hp / p.maxHp;
  let currentMaxSpeed = PLAYER_MAX_SPEED;
  if (hpPct < 0.5) currentMaxSpeed *= 0.8;
  if (hpPct < 0.25) currentMaxSpeed *= 0.6;
  p.maxSpeed = currentMaxSpeed;

  const speed = vecLen(p.vel);
  if (speed > currentMaxSpeed) {
    p.vel.x = (p.vel.x / speed) * currentMaxSpeed;
    p.vel.y = (p.vel.y / speed) * currentMaxSpeed;
  }
  p.speed = vecLen(p.vel);

  p.pos.x += p.vel.x * dt;
  p.pos.y += p.vel.y * dt;

  p.pos.x = clamp(p.pos.x, -3000, 3000);
  p.pos.y = clamp(p.pos.y, -3000, 3000);

  if (p.shieldRegenTimer > 0) {
    p.shieldRegenTimer -= dt;
  } else if (p.shield < PLAYER_MAX_SHIELD) {
    p.shield = Math.min(PLAYER_MAX_SHIELD, p.shield + PLAYER_SHIELD_REGEN_RATE * dt);
  }

  if (p.invulnTimer > 0) {
    p.invulnTimer -= dt;
  }

  state.camera.x = p.pos.x;
  state.camera.y = p.pos.y;

  if (p.speed > 10) {
    const backAngle = p.angle + Math.PI;
    for (let i = 0; i < 2; i++) {
      game.spawnParticle({
        pos: vec2(
          p.pos.x + Math.cos(backAngle) * 20 + (Math.random() - 0.5) * 10,
          p.pos.y + Math.sin(backAngle) * 20 + (Math.random() - 0.5) * 10
        ),
        vel: vec2(
          Math.cos(backAngle) * 40 + (Math.random() - 0.5) * 20,
          Math.sin(backAngle) * 40 + (Math.random() - 0.5) * 20
        ),
        color: '#ff6622',
        alpha: 0.6,
        size: Math.random() * 2 + 1,
        lifetime: 0.3 + Math.random() * 0.2,
        maxLifetime: 0.5,
        decay: 1,
        glow: true,
      });
    }
  }

  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const pk = state.pickups[i];
    if (!pk.alive) continue;
    if (circleCollision(p.pos, PLAYER_RADIUS, pk.pos, PICKUP_RADIUS)) {
      if (pk.type === 'repair') {
        p.hp = Math.min(p.maxHp, p.hp + REPAIR_AMOUNT);
      } else if (pk.weaponType) {
        game.weaponManager.collectWeapon(state, pk.weaponType);
      }
      pk.alive = false;

      for (let j = 0; j < 10; j++) {
        const a = Math.random() * Math.PI * 2;
        game.spawnParticle({
          pos: vec2(pk.pos.x, pk.pos.y),
          vel: vec2(Math.cos(a) * 60, Math.sin(a) * 60),
          color: pk.type === 'repair' ? '#44ff44' : '#ffaa00',
          alpha: 1,
          size: 2 + Math.random() * 2,
          lifetime: 0.4,
          maxLifetime: 0.4,
          decay: 1,
          glow: true,
        });
      }
    }
  }
}

export function damagePlayer(state: GameState, damage: number, game: Game) {
  const p = state.player;
  if (!p.alive || p.invulnTimer > 0) return;

  let remaining = damage;
  if (p.shield > 0) {
    const absorbed = Math.min(p.shield, remaining);
    p.shield -= absorbed;
    remaining -= absorbed;
    p.shieldRegenTimer = PLAYER_SHIELD_REGEN_DELAY;

    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2;
      game.spawnParticle({
        pos: vec2(p.pos.x + Math.cos(a) * PLAYER_RADIUS, p.pos.y + Math.sin(a) * PLAYER_RADIUS),
        vel: vec2(Math.cos(a) * 80, Math.sin(a) * 80),
        color: '#44aaff',
        alpha: 1,
        size: 3,
        lifetime: 0.3,
        maxLifetime: 0.3,
        decay: 1,
        glow: true,
      });
    }
  }

  if (remaining > 0) {
    p.hp -= remaining;
  }

  state.screenShake = Math.max(state.screenShake, damage * 0.3);

  if (p.hp <= 0) {
    p.hp = 0;
    p.alive = false;
    state.gameOver = true;
    spawnExplosion(p.pos, 40, game);
  }
}

export function spawnExplosion(pos: { x: number; y: number }, size: number, game: Game) {
  const count = Math.floor(size * 2);
  const colors = ['#ff4400', '#ffaa00', '#ff6622', '#ffffff', '#ffcc44'];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 30 + Math.random() * 120;
    game.spawnParticle({
      pos: vec2(pos.x + (Math.random() - 0.5) * 6, pos.y + (Math.random() - 0.5) * 6),
      vel: vec2(Math.cos(a) * spd, Math.sin(a) * spd),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      size: 1 + Math.random() * 4,
      lifetime: 0.3 + Math.random() * 0.7,
      maxLifetime: 1,
      decay: 0.7,
      glow: true,
    });
  }
}
