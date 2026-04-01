export interface Vector2 {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'explosion' | 'thruster' | 'debris' | 'glow' | 'ring';
}

export type WeaponType = 'laser' | 'spread' | 'railgun' | 'missile' | 'emp' | 'plasma';

export interface Weapon {
  type: WeaponType;
  name: string;
  ammo: number;
  maxAmmo: number;
  fireRate: number;
  damage: number;
  cooldown: number;
  color: string;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  owner: 'player' | 'enemy';
  type: WeaponType;
  life: number;
  color: string;
  size: number;
  target?: Vector2;
  homing?: boolean;
}

export type EnemyType = 'scout' | 'fighter' | 'gunship' | 'kamikaze' | 'sniper' | 'swarm' | 'elite';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  fireRate: number;
  fireCooldown: number;
  color: string;
  size: number;
  scoreValue: number;
  angle: number;
  behaviorTimer: number;
  behaviorState: number;
  reinforcementTimer: number;
  callsReinforcements: boolean;
}

export interface Pickup {
  x: number;
  y: number;
  type: 'weapon' | 'repair' | 'ammo';
  weaponType?: WeaponType;
  life: number;
  pulse: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  weapons: (Weapon | null)[];
  activeWeapon: number;
  fireCooldown: number;
  invincible: number;
  size: number;
}

export type GameState = 'menu' | 'playing' | 'gameover';

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  layer: number;
}

export interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  speed: number;
}
