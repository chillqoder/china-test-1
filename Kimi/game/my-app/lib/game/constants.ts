// Game Constants

export const GAME_CONFIG = {
  FPS: 60,
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
  PLAYER_SPEED: 6,
  PLAYER_ACCELERATION: 0.3,
  PLAYER_FRICTION: 0.94,
  PLAYER_ROTATION_SPEED: 0.1,
  PLAYER_MAX_HP: 100,
  PLAYER_MAX_SHIELD: 50,
  SHIELD_REGEN_DELAY: 3000,
  SHIELD_REGEN_RATE: 0.5,
  COMBO_DURATION: 2000,
  INVULNERABILITY_TIME: 1000,
  WAVE_DELAY: 3000,
} as const;

export const ENEMY_CONFIGS: Record<string, {
  hp: number;
  speed: number;
  radius: number;
  damage: number;
  fireRate: number;
  score: number;
  color: string;
  glowColor: string;
  shape: string;
}> = {
  scout: {
    hp: 20,
    speed: 4,
    radius: 12,
    damage: 8,
    fireRate: 1500,
    score: 100,
    color: '#44ff88',
    glowColor: '#22cc66',
    shape: 'triangle',
  },
  fighter: {
    hp: 40,
    speed: 3,
    radius: 16,
    damage: 12,
    fireRate: 1200,
    score: 200,
    color: '#ffaa44',
    glowColor: '#cc8833',
    shape: 'diamond',
  },
  gunship: {
    hp: 100,
    speed: 1.5,
    radius: 24,
    damage: 20,
    fireRate: 2000,
    score: 500,
    color: '#ff6644',
    glowColor: '#cc4422',
    shape: 'hexagon',
  },
  kamikaze: {
    hp: 15,
    speed: 5.5,
    radius: 10,
    damage: 30,
    fireRate: 0,
    score: 150,
    color: '#ff4444',
    glowColor: '#cc2222',
    shape: 'spike',
  },
  sniper: {
    hp: 30,
    speed: 2,
    radius: 14,
    damage: 25,
    fireRate: 3000,
    score: 300,
    color: '#aa88ff',
    glowColor: '#8866cc',
    shape: 'cross',
  },
  swarm: {
    hp: 8,
    speed: 3.5,
    radius: 8,
    damage: 5,
    fireRate: 2500,
    score: 50,
    color: '#ffff44',
    glowColor: '#cccc22',
    shape: 'pentagon',
  },
  elite: {
    hp: 300,
    speed: 2.5,
    radius: 32,
    damage: 35,
    fireRate: 800,
    score: 2000,
    color: '#ff44ff',
    glowColor: '#cc22cc',
    shape: 'star',
  },
};

export const WEAPON_CONFIGS: Record<string, {
  damage: number;
  speed: number;
  cooldown: number;
  spread: number;
  count: number;
  homing: boolean;
  color: string;
  glowColor: string;
  maxAmmo: number;
  infinite: boolean;
  description: string;
}> = {
  laser: {
    damage: 15,
    speed: 12,
    cooldown: 200,
    spread: 0.05,
    count: 1,
    homing: false,
    color: '#44ffff',
    glowColor: '#22cccc',
    maxAmmo: 0,
    infinite: true,
    description: 'Standard rapid-fire laser',
  },
  spread: {
    damage: 12,
    speed: 10,
    cooldown: 350,
    spread: 0.3,
    count: 5,
    homing: false,
    color: '#ff8844',
    glowColor: '#cc6633',
    maxAmmo: 150,
    infinite: false,
    description: 'Multi-shot plasma spread',
  },
  railgun: {
    damage: 100,
    speed: 25,
    cooldown: 1500,
    spread: 0,
    count: 1,
    homing: false,
    color: '#ffffff',
    glowColor: '#cccccc',
    maxAmmo: 30,
    infinite: false,
    description: 'Devastating piercing beam',
  },
  missile: {
    damage: 40,
    speed: 7,
    cooldown: 600,
    spread: 0.15,
    count: 2,
    homing: true,
    color: '#ffaa44',
    glowColor: '#cc8822',
    maxAmmo: 50,
    infinite: false,
    description: 'Homing missiles with trails',
  },
  emp: {
    damage: 25,
    speed: 4,
    cooldown: 2000,
    spread: Math.PI * 2,
    count: 12,
    homing: false,
    color: '#88ffff',
    glowColor: '#66cccc',
    maxAmmo: 20,
    infinite: false,
    description: 'Expanding ring of energy',
  },
  plasma: {
    damage: 80,
    speed: 6,
    cooldown: 1200,
    spread: 0.1,
    count: 1,
    homing: false,
    color: '#ff44ff',
    glowColor: '#cc22cc',
    maxAmmo: 40,
    infinite: false,
    description: 'Slow massive energy orb',
  },
};

export const WAVE_CONFIGS: Array<{
  enemies: Array<{ type: string; count: number }>;
  eliteChance: number;
}> = [
  { enemies: [{ type: 'scout', count: 5 }], eliteChance: 0 },
  { enemies: [{ type: 'scout', count: 8 }, { type: 'fighter', count: 3 }], eliteChance: 0 },
  { enemies: [{ type: 'fighter', count: 6 }, { type: 'gunship', count: 2 }], eliteChance: 0.05 },
  { enemies: [{ type: 'scout', count: 6 }, { type: 'kamikaze', count: 4 }], eliteChance: 0.05 },
  { enemies: [{ type: 'sniper', count: 4 }, { type: 'fighter', count: 4 }], eliteChance: 0.1 },
  { enemies: [{ type: 'swarm', count: 12 }, { type: 'gunship', count: 3 }], eliteChance: 0.1 },
  { enemies: [{ type: 'kamikaze', count: 8 }, { type: 'scout', count: 6 }], eliteChance: 0.15 },
  { enemies: [{ type: 'elite', count: 1 }, { type: 'fighter', count: 4 }], eliteChance: 0.2 },
  { enemies: [{ type: 'gunship', count: 5 }, { type: 'sniper', count: 4 }], eliteChance: 0.2 },
  { enemies: [{ type: 'swarm', count: 20 }, { type: 'elite', count: 1 }], eliteChance: 0.25 },
];

export const COLORS = {
  player: {
    hull: '#4488ff',
    glow: '#2266cc',
    engine: '#44ccff',
    shield: 'rgba(100, 200, 255, 0.3)',
    damage: {
      minor: '#66aaff',
      moderate: '#ffaa44',
      severe: '#ff6644',
      critical: '#ff2244',
    },
  },
  particles: {
    exhaust: ['#44ccff', '#4488ff', '#2266cc'],
    spark: ['#ffff44', '#ffaa44', '#ff4444'],
    explosion: ['#ff4444', '#ff8844', '#ffff44', '#ffffff'],
    debris: ['#666666', '#888888', '#aaaaaa'],
  },
  hud: {
    health: '#ff4444',
    shield: '#44aaff',
    ammo: '#ffaa44',
    score: '#ffffff',
    combo: '#ffff44',
  },
};

export const STAR_LAYERS = 4;
export const STARS_PER_LAYER = 80;
