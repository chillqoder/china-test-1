export const PLAYER = {
  maxHp: 100,
  maxShield: 50,
  shieldRegen: 8,
  baseSpeed: 220,
  acceleration: 600,
  friction: 0.92,
  turnSpeed: 4,
  size: 24,
  invincibilityTime: 1.5,
};

export const WEAPONS = {
  laser: { name: 'Laser', ammo: -1, maxAmmo: -1, fireRate: 0.12, damage: 8, color: '#00ffff' },
  spread: { name: 'Spread', ammo: 60, maxAmmo: 60, fireRate: 0.25, damage: 6, color: '#ff8800' },
  railgun: { name: 'Railgun', ammo: 15, maxAmmo: 15, fireRate: 1.2, damage: 60, color: '#ffffff' },
  missile: { name: 'Missile', ammo: 20, maxAmmo: 20, fireRate: 0.5, damage: 25, color: '#ff4444' },
  emp: { name: 'EMP', ammo: 10, maxAmmo: 10, fireRate: 1.5, damage: 15, color: '#8844ff' },
  plasma: { name: 'Plasma', ammo: 30, maxAmmo: 30, fireRate: 0.4, damage: 18, color: '#ff44aa' },
};

export const ENEMIES = {
  scout: { hp: 15, speed: 180, size: 14, fireRate: 1.5, score: 100, color: '#44ff44', callsReinforcements: false },
  fighter: { hp: 30, speed: 120, size: 18, fireRate: 1.0, score: 200, color: '#44aaff', callsReinforcements: false },
  gunship: { hp: 80, speed: 70, size: 26, fireRate: 0.6, score: 400, color: '#ff6644', callsReinforcements: true },
  kamikaze: { hp: 10, speed: 280, size: 12, fireRate: 999, score: 150, color: '#ff4444', callsReinforcements: false },
  sniper: { hp: 25, speed: 60, size: 16, fireRate: 0.4, score: 250, color: '#aa44ff', callsReinforcements: false },
  swarm: { hp: 8, speed: 200, size: 10, fireRate: 2.0, score: 50, color: '#ffff44', callsReinforcements: false },
  elite: { hp: 200, speed: 90, size: 32, fireRate: 0.3, score: 1000, color: '#ff44ff', callsReinforcements: true },
};

export const WAVES = {
  baseEnemies: 5,
  enemiesPerWave: 3,
  maxWaveEnemies: 20,
  spawnInterval: 0.8,
  waveDelay: 3,
};

export const PICKUP = {
  lifeTime: 10,
  weaponDropChance: 0.25,
  repairDropChance: 0.1,
  ammoDropChance: 0.15,
};

export const PARTICLES = {
  maxParticles: 2000,
};
