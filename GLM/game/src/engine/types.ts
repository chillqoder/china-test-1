export interface Vec2 {
  x: number;
  y: number;
}

export type WeaponType =
  | 'laser'
  | 'spread'
  | 'railgun'
  | 'missile'
  | 'emp'
  | 'plasma';

export type EnemyType =
  | 'scout'
  | 'fighter'
  | 'gunship'
  | 'kamikaze'
  | 'sniper'
  | 'swarm'
  | 'elite';

export type PickupType = 'weapon' | 'repair';

export type DamageLevel = 'none' | 'minor' | 'moderate' | 'heavy' | 'critical';

export interface PlayerState {
  pos: Vec2;
  vel: Vec2;
  angle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldRegenTimer: number;
  speed: number;
  maxSpeed: number;
  alive: boolean;
  invulnTimer: number;
}

export interface EnemyState {
  id: number;
  type: EnemyType;
  pos: Vec2;
  vel: Vec2;
  angle: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  aiTimer: number;
  aiState: string;
  fireTimer: number;
  alertSent: boolean;
  radius: number;
  speed: number;
  damage: number;
  scoreValue: number;
  spawnAnimTimer: number;
}

export interface Projectile {
  id: number;
  pos: Vec2;
  vel: Vec2;
  angle: number;
  weaponType: WeaponType;
  damage: number;
  owner: 'player' | 'enemy';
  alive: boolean;
  lifetime: number;
  maxLifetime: number;
  radius: number;
  targetId?: number;
  homing?: boolean;
}

export interface Pickup {
  id: number;
  pos: Vec2;
  vel: Vec2;
  type: PickupType;
  weaponType?: WeaponType;
  alive: boolean;
  lifetime: number;
  radius: number;
  pulseTimer: number;
}

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  color: string;
  alpha: number;
  size: number;
  lifetime: number;
  maxLifetime: number;
  alive: boolean;
  decay: number;
  glow: boolean;
}

export interface WeaponDef {
  name: string;
  type: WeaponType;
  fireRate: number;
  damage: number;
  speed: number;
  spread: number;
  count: number;
  ammo: number;
  range: number;
  homing: boolean;
  radius: number;
  color: string;
  glowColor: string;
}

export interface WeaponSlot {
  type: WeaponType;
  ammo: number;
}

export interface GameState {
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: Projectile[];
  pickups: Pickup[];
  particles: Particle[];
  weapons: WeaponSlot[];
  activeWeapon: number;
  score: number;
  wave: number;
  combo: number;
  comboTimer: number;
  comboMultiplier: number;
  gameOver: boolean;
  gameStarted: boolean;
  screenShake: number;
  screenShakeDecay: number;
  camera: Vec2;
  time: number;
  nextId: number;
}

export interface InputState {
  keys: Set<string>;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  mouseJustDown: boolean;
  mouseJustUp: boolean;
  scrollDelta: number;
  numberKeys: number[];
}
