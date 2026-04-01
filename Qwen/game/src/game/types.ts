export interface Vec2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  radius: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  type: string;
}

export interface Player extends Entity {
  type: 'player';
  shield: number;
  maxShield: number;
  shieldRegenTimer: number;
  weapons: WeaponSlot[];
  activeWeapon: number;
  score: number;
  combo: number;
  comboTimer: number;
  lastDamageTime: number;
  repairKitCount: number;
}

export interface Enemy extends Entity {
  type: 'enemy';
  enemyType: EnemyType;
  ai: AIState;
  fireTimer: number;
  reinforcementTimer: number;
  hasReinforcement: boolean;
  scoreValue: number;
  behavior: 'flank' | 'swarm' | 'circle' | 'strafe' | 'retreat' | 'kamikaze' | 'snipe';
}

export type EnemyType = 'scout' | 'fighter' | 'gunship' | 'kamikaze' | 'sniper' | 'swarm' | 'elite';

export interface Projectile extends Entity {
  type: 'projectile';
  weapon: WeaponType;
  damage: number;
  lifetime: number;
  isPlayer: boolean;
  homing: boolean;
  homingTarget: Enemy | Player | null;
  trail: Vec2[];
}

export interface Pickup extends Entity {
  type: 'pickup';
  pickupType: 'weapon' | 'repair';
  weapon?: WeaponType;
  amount: number;
  bobTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
  type: 'spark' | 'explosion' | 'trail' | 'smoke' | 'shield' | 'repair' | 'engine';
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  layer: number;
  twinkle: number;
  twinkleSpeed: number;
}

export interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: number;
  alpha: number;
  speed: number;
}

export interface Planet {
  x: number;
  y: number;
  radius: number;
  color: number;
  ringColor?: number;
  hasRing: boolean;
  speed: number;
  glowColor: number;
}

export type WeaponType = 'laser' | 'spread' | 'railgun' | 'missile' | 'emp' | 'plasma';

export interface WeaponData {
  name: string;
  fireRate: number;
  damage: number;
  speed: number;
  spread: number;
  count: number;
  ammo: number;
  maxAmmo: number;
  infinite: boolean;
  color: number;
  glowColor: number;
  size: number;
  homing: boolean;
  lifetime: number;
  chargeTime?: number;
}

export interface WeaponSlot {
  weapon: WeaponType;
  ammo: number;
}

export interface WaveConfig {
  wave: number;
  enemies: { type: EnemyType; count: number; delay: number }[];
  eliteChance: number;
  reinforcementChance: number;
}

export interface AIState {
  state: 'approach' | 'attack' | 'retreat' | 'flank' | 'circle' | 'strafe' | 'kamikaze' | 'swarm' | 'snipe';
  targetX: number;
  targetY: number;
  timer: number;
  flankAngle: number;
}

export interface GameState {
  phase: 'playing' | 'gameover' | 'waveComplete';
  wave: number;
  waveTimer: number;
  waveDelay: number;
  enemiesRemaining: number;
  screenShake: number;
  screenFlash: number;
  flashColor: number;
  slowMotion: number;
}
