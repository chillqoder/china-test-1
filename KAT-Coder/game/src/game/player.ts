import { PlayerState, Weapon, Vector2 } from './types';
import { PLAYER, WEAPONS } from './constants';
import { createWeapon } from './weapons';
import { isKeyDown, getMousePos, isMouseDown, consumeMouseWheel } from './input';

export function createPlayer(): PlayerState {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    hp: PLAYER.maxHp,
    maxHp: PLAYER.maxHp,
    shield: PLAYER.maxShield,
    maxShield: PLAYER.maxShield,
    speed: PLAYER.baseSpeed,
    weapons: [createWeapon('laser'), null, null],
    activeWeapon: 0,
    fireCooldown: 0,
    invincible: 0,
    size: PLAYER.size,
  };
}

export function updatePlayer(player: PlayerState, dt: number, canvasW: number, canvasH: number): void {
  const accel = PLAYER.acceleration;
  let ax = 0;
  let ay = 0;

  if (isKeyDown('KeyW') || isKeyDown('ArrowUp')) ay -= accel;
  if (isKeyDown('KeyS') || isKeyDown('ArrowDown')) ay += accel;
  if (isKeyDown('KeyA') || isKeyDown('ArrowLeft')) ax -= accel;
  if (isKeyDown('KeyD') || isKeyDown('ArrowRight')) ax += accel;

  player.vx += ax * dt;
  player.vy += ay * dt;
  player.vx *= PLAYER.friction;
  player.vy *= PLAYER.friction;

  const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
  const maxSpeed = player.speed * (player.hp < PLAYER.maxHp * 0.25 ? 0.4 : player.hp < PLAYER.maxHp * 0.5 ? 0.6 : player.hp < PLAYER.maxHp * 0.75 ? 0.8 : 1);

  if (speed > maxSpeed) {
    player.vx = (player.vx / speed) * maxSpeed;
    player.vy = (player.vy / speed) * maxSpeed;
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.x = Math.max(player.size, Math.min(canvasW - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvasH - player.size, player.y));

  const mouse = getMousePos();
  player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  player.fireCooldown -= dt;
  if (player.invincible > 0) player.invincible -= dt;

  if (player.shield < PLAYER.maxShield) {
    player.shield = Math.min(PLAYER.maxShield, player.shield + PLAYER.shieldRegen * dt);
  }

  const wheel = consumeMouseWheel();
  if (wheel !== 0) {
    player.activeWeapon = (player.activeWeapon + (wheel > 0 ? 1 : -1) + 3) % 3;
    while (player.weapons[player.activeWeapon] === null) {
      player.activeWeapon = (player.activeWeapon + (wheel > 0 ? 1 : -1) + 3) % 3;
    }
  }

  for (let i = 1; i <= 3; i++) {
    if (isKeyDown('Digit' + i)) {
      if (player.weapons[i - 1] !== null) {
        player.activeWeapon = i - 1;
      }
    }
  }
}

export function playerCanFire(player: PlayerState): boolean {
  return player.fireCooldown <= 0 && (isMouseDown() || isKeyDown('Space'));
}

export function addWeaponToPlayer(player: PlayerState, weaponType: keyof typeof WEAPONS): boolean {
  const emptySlot = player.weapons.findIndex((w, i) => i > 0 && w === null);
  if (emptySlot === -1) return false;

  const w = createWeapon(weaponType);
  player.weapons[emptySlot] = w;
  return true;
}

export function repairPlayer(player: PlayerState, amount: number): void {
  player.hp = Math.min(PLAYER.maxHp, player.hp + amount);
}

export function addAmmoToPlayer(player: PlayerState): void {
  for (const w of player.weapons) {
    if (w && w.ammo > 0) {
      w.ammo = Math.min(w.maxAmmo, w.ammo + Math.ceil(w.maxAmmo * 0.4));
    }
  }
}

export function getActiveWeapon(player: PlayerState): Weapon | null {
  return player.weapons[player.activeWeapon];
}

export function getHullPercent(player: PlayerState): number {
  return player.hp / PLAYER.maxHp;
}

export function getShieldPercent(player: PlayerState): number {
  return player.shield / PLAYER.maxShield;
}
