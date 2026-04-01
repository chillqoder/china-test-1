export const CANVAS_BG = '#050510';

export const PLAYER_MAX_HP = 100;
export const PLAYER_MAX_SHIELD = 50;
export const PLAYER_SHIELD_REGEN_DELAY = 3;
export const PLAYER_SHIELD_REGEN_RATE = 8;
export const PLAYER_ACCELERATION = 800;
export const PLAYER_MAX_SPEED = 350;
export const PLAYER_FRICTION = 3;
export const PLAYER_RADIUS = 28;
export const PLAYER_INVULN_TIME = 0.5;
export const PLAYER_TURN_SPEED = 8;

export const STAR_LAYERS = [
  { count: 120, speed: 0.05, minSize: 0.5, maxSize: 1.2, alpha: 0.3 },
  { count: 80, speed: 0.15, minSize: 1, maxSize: 2, alpha: 0.5 },
  { count: 40, speed: 0.3, minSize: 1.5, maxSize: 3, alpha: 0.8 },
];

export const NEBULA_COUNT = 3;

export const WEAPON_DEFS = {
  laser: {
    name: 'Laser',
    type: 'laser' as const,
    fireRate: 0.12,
    damage: 8,
    speed: 900,
    spread: 0,
    count: 1,
    ammo: Infinity,
    range: 1.5,
    homing: false,
    radius: 4,
    color: '#00ffff',
    glowColor: '#0088ff',
  },
  spread: {
    name: 'Spread Shot',
    type: 'spread' as const,
    fireRate: 0.35,
    damage: 6,
    speed: 700,
    spread: 0.4,
    count: 5,
    ammo: 80,
    range: 0.8,
    homing: false,
    radius: 5,
    color: '#ff8800',
    glowColor: '#ff4400',
  },
  railgun: {
    name: 'Railgun',
    type: 'railgun' as const,
    fireRate: 1.2,
    damage: 60,
    speed: 2000,
    spread: 0,
    count: 1,
    ammo: 15,
    range: 2,
    homing: false,
    radius: 6,
    color: '#ffffff',
    glowColor: '#aaccff',
  },
  missile: {
    name: 'Missile',
    type: 'missile' as const,
    fireRate: 0.6,
    damage: 25,
    speed: 500,
    spread: 0.2,
    count: 2,
    ammo: 30,
    range: 2.5,
    homing: true,
    radius: 5,
    color: '#ff4466',
    glowColor: '#ff0022',
  },
  emp: {
    name: 'EMP Pulse',
    type: 'emp' as const,
    fireRate: 1.5,
    damage: 15,
    speed: 400,
    spread: 0,
    count: 1,
    ammo: 10,
    range: 1.5,
    homing: false,
    radius: 8,
    color: '#aa44ff',
    glowColor: '#6600cc',
  },
  plasma: {
    name: 'Plasma Cannon',
    type: 'plasma' as const,
    fireRate: 0.5,
    damage: 35,
    speed: 450,
    spread: 0.05,
    count: 1,
    ammo: 25,
    range: 1.8,
    homing: false,
    radius: 12,
    color: '#ff44ff',
    glowColor: '#cc00cc',
  },
};

export const ENEMY_DEFS = {
  scout: {
    hp: 20,
    speed: 280,
    radius: 14,
    damage: 5,
    scoreValue: 50,
    fireRate: 0.8,
    color: '#44ff44',
    glowColor: '#22cc22',
  },
  fighter: {
    hp: 40,
    speed: 180,
    radius: 18,
    damage: 8,
    scoreValue: 100,
    fireRate: 0.6,
    color: '#ffaa00',
    glowColor: '#cc8800',
  },
  gunship: {
    hp: 100,
    speed: 80,
    radius: 28,
    damage: 15,
    scoreValue: 200,
    fireRate: 0.4,
    color: '#ff4444',
    glowColor: '#cc2222',
  },
  kamikaze: {
    hp: 15,
    speed: 400,
    radius: 10,
    damage: 30,
    scoreValue: 75,
    fireRate: 0,
    color: '#ffff00',
    glowColor: '#cccc00',
  },
  sniper: {
    hp: 30,
    speed: 60,
    radius: 20,
    damage: 20,
    scoreValue: 150,
    fireRate: 1.5,
    color: '#44aaff',
    glowColor: '#2288dd',
  },
  swarm: {
    hp: 10,
    speed: 220,
    radius: 8,
    damage: 3,
    scoreValue: 25,
    fireRate: 1.0,
    color: '#ff88ff',
    glowColor: '#cc55cc',
  },
  elite: {
    hp: 250,
    speed: 120,
    radius: 35,
    damage: 20,
    scoreValue: 500,
    fireRate: 0.3,
    color: '#ff6600',
    glowColor: '#dd4400',
  },
};

export const COMBO_TIMEOUT = 2;
export const MAX_COMBO_MULTIPLIER = 8;
export const WAVE_DELAY = 3;
export const PARTICLE_POOL_SIZE = 600;
export const MAX_ENEMIES = 50;
export const PICKUP_LIFETIME = 15;
export const PICKUP_RADIUS = 12;
export const REPAIR_AMOUNT = 25;
export const SCREEN_SHAKE_DECAY = 8;
