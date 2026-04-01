import { Player, Vector2, Projectile, Weapon, DamageState } from '../types';
import { GAME_CONFIG, WEAPON_CONFIGS } from '../constants';
import { generateId, normalize, angleBetween, limitVector, magnitude } from '../utils';
import { createProjectile } from './projectile';

export function createPlayer(x: number, y: number): Player {
  const laserWeapon: Weapon = {
    type: 'laser',
    ammo: 0,
    maxAmmo: 0,
    infinite: true,
    lastFired: 0,
    cooldown: WEAPON_CONFIGS.laser.cooldown,
  };
  
  return {
    id: generateId(),
    position: { x, y },
    velocity: { x: 0, y: 0 },
    rotation: -Math.PI / 2,
    radius: 25,
    hp: GAME_CONFIG.PLAYER_MAX_HP,
    maxHp: GAME_CONFIG.PLAYER_MAX_HP,
    shield: GAME_CONFIG.PLAYER_MAX_SHIELD,
    maxShield: GAME_CONFIG.PLAYER_MAX_SHIELD,
    weapons: [laserWeapon],
    currentWeaponIndex: 0,
    lastShot: 0,
    active: true,
    thrusterIntensity: 0,
    damageState: 'pristine',
    invulnerableUntil: 0,
  };
}

export function updatePlayer(
  player: Player,
  keys: Set<string>,
  mouse: Vector2,
  canvasSize: Vector2,
  dt: number
): void {
  // Calculate movement input
  const input: Vector2 = { x: 0, y: 0 };
  
  if (keys.has('w') || keys.has('arrowup')) input.y -= 1;
  if (keys.has('s') || keys.has('arrowdown')) input.y += 1;
  if (keys.has('a') || keys.has('arrowleft')) input.x -= 1;
  if (keys.has('d') || keys.has('arrowright')) input.x += 1;
  
  // Apply acceleration
  if (input.x !== 0 || input.y !== 0) {
    const normalized = normalize(input);
    player.velocity.x += normalized.x * GAME_CONFIG.PLAYER_ACCELERATION * dt;
    player.velocity.y += normalized.y * GAME_CONFIG.PLAYER_ACCELERATION * dt;
    player.thrusterIntensity = Math.min(player.thrusterIntensity + 0.1 * dt, 1);
  } else {
    player.thrusterIntensity = Math.max(player.thrusterIntensity - 0.1 * dt, 0);
  }
  
  // Apply speed reduction based on damage
  let maxSpeed = GAME_CONFIG.PLAYER_SPEED;
  if (player.damageState === 'moderate') maxSpeed *= 0.85;
  if (player.damageState === 'severe') maxSpeed *= 0.7;
  if (player.damageState === 'critical') maxSpeed *= 0.5;
  
  // Apply friction and limit speed
  player.velocity.x *= Math.pow(GAME_CONFIG.PLAYER_FRICTION, dt);
  player.velocity.y *= Math.pow(GAME_CONFIG.PLAYER_FRICTION, dt);
  
  const speed = magnitude(player.velocity);
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    player.velocity.x *= scale;
    player.velocity.y *= scale;
  }
  
  // Update position
  player.position.x += player.velocity.x * dt;
  player.position.y += player.velocity.y * dt;
  
  // Clamp to canvas bounds
  player.position.x = Math.max(player.radius, Math.min(canvasSize.x - player.radius, player.position.x));
  player.position.y = Math.max(player.radius, Math.min(canvasSize.y - player.radius, player.position.y));
  
  // Rotate towards mouse
  const targetRotation = angleBetween(player.position, mouse);
  let rotationDiff = targetRotation - player.rotation;
  
  // Normalize rotation difference to [-PI, PI]
  while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
  while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
  
  player.rotation += rotationDiff * GAME_CONFIG.PLAYER_ROTATION_SPEED * dt;
}

export function playerShoot(player: Player): Projectile[] {
  const weapon = player.weapons[player.currentWeaponIndex];
  const config = WEAPON_CONFIGS[weapon.type];
  
  // Check ammo
  if (!weapon.infinite && weapon.ammo <= 0) return [];
  
  // Consume ammo
  if (!weapon.infinite) {
    weapon.ammo--;
  }
  
  player.lastShot = Date.now();
  weapon.lastFired = Date.now();
  
  const projectiles: Projectile[] = [];
  const baseAngle = player.rotation;
  
  // Special handling for EMP (360 degree burst)
  if (weapon.type === 'emp') {
    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 / config.count) * i;
      projectiles.push(createProjectile(
        player.position.x,
        player.position.y,
        angle,
        'player',
        weapon.type
      ));
    }
    return projectiles;
  }
  
  // Railgun charge effect and single powerful shot
  if (weapon.type === 'railgun') {
    projectiles.push(createProjectile(
      player.position.x,
      player.position.y,
      baseAngle,
      'player',
      weapon.type
    ));
    return projectiles;
  }
  
  // Standard multi-shot weapons
  const startAngle = baseAngle - (config.spread * (config.count - 1)) / 2;
  
  for (let i = 0; i < config.count; i++) {
    const angle = startAngle + config.spread * i;
    projectiles.push(createProjectile(
      player.position.x + Math.cos(baseAngle) * 20,
      player.position.y + Math.sin(baseAngle) * 20,
      angle,
      'player',
      weapon.type
    ));
  }
  
  return projectiles;
}

export function switchWeapon(player: Player, index: number): void {
  if (index >= 0 && index < player.weapons.length) {
    player.currentWeaponIndex = index;
  }
}

export function addWeapon(player: Player, weaponType: string): boolean {
  if (player.weapons.length >= 3) {
    // Replace current weapon
    const newWeapon: Weapon = {
      type: weaponType as any,
      ammo: WEAPON_CONFIGS[weaponType].maxAmmo,
      maxAmmo: WEAPON_CONFIGS[weaponType].maxAmmo,
      infinite: WEAPON_CONFIGS[weaponType].infinite,
      lastFired: 0,
      cooldown: WEAPON_CONFIGS[weaponType].cooldown,
    };
    player.weapons[player.currentWeaponIndex] = newWeapon;
    return true;
  } else {
    // Add new weapon
    const newWeapon: Weapon = {
      type: weaponType as any,
      ammo: WEAPON_CONFIGS[weaponType].maxAmmo,
      maxAmmo: WEAPON_CONFIGS[weaponType].maxAmmo,
      infinite: WEAPON_CONFIGS[weaponType].infinite,
      lastFired: 0,
      cooldown: WEAPON_CONFIGS[weaponType].cooldown,
    };
    player.weapons.push(newWeapon);
    player.currentWeaponIndex = player.weapons.length - 1;
    return true;
  }
}

export function applyDamageToPlayer(player: Player, damage: number): void {
  const now = Date.now();
  if (now < player.invulnerableUntil) return;
  
  // Shield absorbs damage first
  if (player.shield > 0) {
    const shieldAbsorb = Math.min(player.shield, damage);
    player.shield -= shieldAbsorb;
    damage -= shieldAbsorb;
    
    // Shield hit makes player briefly invulnerable
    if (shieldAbsorb > 0) {
      player.invulnerableUntil = now + 200;
    }
  }
  
  // Remaining damage to hull
  if (damage > 0) {
    player.hp -= damage;
    player.invulnerableUntil = now + GAME_CONFIG.INVULNERABILITY_TIME;
    updateDamageState(player);
  }
}

export function updateDamageState(player: Player): void {
  const hpPercent = player.hp / player.maxHp;
  
  if (hpPercent > 0.75) player.damageState = 'pristine';
  else if (hpPercent > 0.5) player.damageState = 'minor';
  else if (hpPercent > 0.25) player.damageState = 'moderate';
  else if (hpPercent > 0) player.damageState = 'severe';
  else player.damageState = 'critical';
}

export function regenerateShield(player: Player, now: number): void {
  if (player.shield < player.maxShield && now > player.invulnerableUntil + GAME_CONFIG.SHIELD_REGEN_DELAY) {
    player.shield = Math.min(player.maxShield, player.shield + GAME_CONFIG.SHIELD_REGEN_RATE);
  }
}

export function repairPlayer(player: Player, amount: number): void {
  player.hp = Math.min(player.maxHp, player.hp + amount);
  updateDamageState(player);
}

export function rechargeShield(player: Player, amount: number): void {
  player.shield = Math.min(player.maxShield, player.shield + amount);
}
