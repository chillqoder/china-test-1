// Game Types and Interfaces

export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  radius: number;
  hp: number;
  maxHp: number;
  active: boolean;
}

export interface Player extends Entity {
  shield: number;
  maxShield: number;
  weapons: Weapon[];
  currentWeaponIndex: number;
  lastShot: number;
  thrusterIntensity: number;
  damageState: DamageState;
  invulnerableUntil: number;
}

export type DamageState = 'pristine' | 'minor' | 'moderate' | 'severe' | 'critical';

export interface Enemy extends Entity {
  type: EnemyType;
  lastShot: number;
  aiState: AIState;
  aiTimer: number;
  targetPosition?: Vector2;
  elite: boolean;
  value: number;
}

export type EnemyType = 
  | 'scout'      // Fast, weak
  | 'fighter'    // Balanced
  | 'gunship'    // Slow, tanky
  | 'kamikaze'   // Rush player
  | 'sniper'     // Stay at distance
  | 'swarm'      // Weak but many
  | 'elite';     // Mini-boss

export type AIState = 
  | 'approach'
  | 'retreat'
  | 'strafe'
  | 'circle'
  | 'kamikaze'
  | 'snipe'
  | 'flee';

export interface Projectile extends Entity {
  damage: number;
  owner: 'player' | 'enemy';
  type: ProjectileType;
  lifetime: number;
  homing?: boolean;
  target?: Vector2;
}

export type ProjectileType = 
  | 'laser'
  | 'plasma'
  | 'railgun'
  | 'missile'
  | 'emp'
  | 'cannon'
  | 'enemyLaser';

export interface Weapon {
  type: WeaponType;
  ammo: number;
  maxAmmo: number;
  infinite: boolean;
  lastFired: number;
  cooldown: number;
}

export type WeaponType = 
  | 'laser'
  | 'spread'
  | 'railgun'
  | 'missile'
  | 'emp'
  | 'plasma';

export interface Particle {
  id: string;
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'exhaust' | 'spark' | 'explosion' | 'debris' | 'glow' | 'trail';
}

export interface Pickup extends Entity {
  type: PickupType;
  weaponType?: WeaponType;
  lifetime: number;
  pulse: number;
}

export type PickupType = 'weapon' | 'repair' | 'shield';

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  twinkle: number;
}

export interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  drift: Vector2;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  pickups: Pickup[];
  stars: Star[];
  nebulae: Nebula[];
  score: number;
  wave: number;
  combo: number;
  comboTimer: number;
  gameOver: boolean;
  paused: boolean;
  keys: Set<string>;
  mouse: Vector2;
  mouseDown: boolean;
  canvasSize: Vector2;
  waveInProgress: boolean;
  waveTimer: number;
  enemiesToSpawn: number;
}

export interface EnemyConfig {
  type: EnemyType;
  hp: number;
  speed: number;
  radius: number;
  damage: number;
  fireRate: number;
  score: number;
  color: string;
  glowColor: string;
  eliteMultiplier: number;
}

export interface WeaponConfig {
  type: WeaponType;
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
}
