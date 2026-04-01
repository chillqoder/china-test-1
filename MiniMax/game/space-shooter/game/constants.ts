export const GAME_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1920;
export const GAME_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 1080;

export const COLORS = {
  background: 0x0a0a1a,
  player: 0x4a9eff,
  playerGlow: 0x2a7fff,
  shield: 0x00ffff,
  laser: 0x00ffff,
  spread: 0xff8800,
  railgun: 0xffffff,
  missile: 0xff4444,
  emp: 0x88ff00,
  plasma: 0xff00ff,
  enemy: {
    scout: 0x00ff88,
    fighter: 0xaa44ff,
    gunship: 0xff2244,
    kamikaze: 0xffcc00,
    sniper: 0x00ff00,
    swarm: 0xff8800,
    elite: 0xffffff,
  },
  pickup: {
    weapon: 0xffff00,
    repair: 0x00ff00,
  },
  star: 0xffffff,
  nebula: 0x4400aa,
};

export const PLAYER = {
  size: 40,
  maxSpeed: 8,
  acceleration: 0.3,
  friction: 0.96,
  rotationSpeed: 0.15,
  maxHull: 100,
  maxShield: 50,
  shieldRegenRate: 0.05,
  collisionRadius: 25,
};

export const WEAPONS = {
  laser: { damage: 10, fireRate: 150, speed: 20, size: 4, infinite: true },
  spread: { damage: 8, fireRate: 400, speed: 15, size: 6, count: 5, infinite: false },
  railgun: { damage: 80, fireRate: 2000, speed: 50, size: 8, infinite: false },
  missile: { damage: 25, fireRate: 600, speed: 12, size: 8, infinite: false },
  emp: { damage: 0, fireRate: 1500, speed: 10, size: 20, infinite: false },
  plasma: { damage: 40, fireRate: 800, speed: 8, size: 16, infinite: false },
};

export const ENEMIES = {
  scout: { size: 20, speed: 5, health: 20, damage: 5, score: 100, color: COLORS.enemy.scout },
  fighter: { size: 30, speed: 3, health: 50, damage: 10, score: 200, color: COLORS.enemy.fighter },
  gunship: { size: 45, speed: 1.5, health: 120, damage: 20, score: 350, color: COLORS.enemy.gunship },
  kamikaze: { size: 18, speed: 8, health: 15, damage: 30, score: 150, color: COLORS.enemy.kamikaze },
  sniper: { size: 28, speed: 2, health: 35, damage: 25, score: 300, color: COLORS.enemy.sniper },
  swarm: { size: 12, speed: 4, health: 8, damage: 3, score: 50, color: COLORS.enemy.swarm },
  elite: { size: 60, speed: 2, health: 300, damage: 40, score: 1000, color: COLORS.enemy.elite },
};

export const DAMAGE_STATES = {
  full: 1.0,
  minor: 0.75,
  moderate: 0.5,
  severe: 0.25,
  critical: 0.1,
};

export const WAVE_CONFIG = {
  baseEnemies: 5,
  enemiesPerWave: 3,
  spawnDelay: 1000,
  eliteChance: 0.1,
};
