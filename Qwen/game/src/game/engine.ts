import * as PIXI from 'pixi.js';
import { InputHandler } from './input';
import {
  Player,
  Enemy,
  Projectile,
  Pickup,
  Particle,
  Star,
  Nebula,
  Planet,
  WeaponType,
  GameState,
  WaveConfig,
  EnemyType,
} from './types';

export interface GameEvents {
  onScoreChange?: (score: number) => void;
  onHpChange?: (hp: number, maxHp: number, shield: number, maxShield: number) => void;
  onWaveChange?: (wave: number, enemiesRemaining: number) => void;
  onComboChange?: (combo: number) => void;
  onGameOver?: () => void;
  onWaveComplete?: () => void;
}

const WEAPON_DATA: Record<WeaponType, { name: string; fireRate: number; damage: number; speed: number; spread: number; count: number; ammo: number; maxAmmo: number; infinite: boolean; color: number; glowColor: number; size: number; homing: boolean; lifetime: number }> = {
  laser: { name: 'Pulse Laser', fireRate: 0.12, damage: 10, speed: 900, spread: 0.04, count: 1, ammo: -1, maxAmmo: -1, infinite: true, color: 0x00ffff, glowColor: 0x00aaff, size: 3, homing: false, lifetime: 1.5 },
  spread: { name: 'Plasma Spread', fireRate: 0.35, damage: 8, speed: 600, spread: 0.3, count: 5, ammo: 50, maxAmmo: 80, infinite: false, color: 0xff8800, glowColor: 0xff6600, size: 5, homing: false, lifetime: 0.8 },
  railgun: { name: 'Railgun', fireRate: 1.2, damage: 80, speed: 1500, spread: 0, count: 1, ammo: 15, maxAmmo: 25, infinite: false, color: 0xffffff, glowColor: 0xaaddff, size: 4, homing: false, lifetime: 2 },
  missile: { name: 'Missile', fireRate: 0.6, damage: 25, speed: 400, spread: 0.15, count: 3, ammo: 20, maxAmmo: 35, infinite: false, color: 0xff4444, glowColor: 0xff2222, size: 6, homing: true, lifetime: 3 },
  emp: { name: 'EMP Pulse', fireRate: 1.5, damage: 35, speed: 350, spread: 0, count: 1, ammo: 10, maxAmmo: 18, infinite: false, color: 0x00ffaa, glowColor: 0x00ffcc, size: 10, homing: false, lifetime: 1.2 },
  plasma: { name: 'Plasma Cannon', fireRate: 0.5, damage: 30, speed: 350, spread: 0.08, count: 1, ammo: 25, maxAmmo: 45, infinite: false, color: 0xff00ff, glowColor: 0xcc00ff, size: 10, homing: false, lifetime: 1.5 },
};

const ENEMY_CONFIGS: Record<EnemyType, { hp: number; radius: number; speed: number; score: number; behavior: Enemy['behavior']; color: number; accentColor: number; fireRate: number; fireDamage: number }> = {
  scout: { hp: 25, radius: 14, speed: 160, score: 100, behavior: 'flank', color: 0x44ff88, accentColor: 0x22aa55, fireRate: 1.2, fireDamage: 6 },
  fighter: { hp: 45, radius: 18, speed: 130, score: 200, behavior: 'strafe', color: 0xff4444, accentColor: 0xaa2222, fireRate: 0.7, fireDamage: 10 },
  gunship: { hp: 90, radius: 24, speed: 85, score: 350, behavior: 'circle', color: 0xff8844, accentColor: 0xaa5522, fireRate: 0.5, fireDamage: 14 },
  kamikaze: { hp: 18, radius: 12, speed: 220, score: 150, behavior: 'kamikaze', color: 0xffff44, accentColor: 0xaa8800, fireRate: 999, fireDamage: 0 },
  sniper: { hp: 35, radius: 16, speed: 90, score: 250, behavior: 'retreat', color: 0x8844ff, accentColor: 0x5522aa, fireRate: 2.0, fireDamage: 22 },
  swarm: { hp: 12, radius: 9, speed: 190, score: 50, behavior: 'swarm', color: 0x44ffff, accentColor: 0x22aaaa, fireRate: 2.0, fireDamage: 5 },
  elite: { hp: 180, radius: 32, speed: 110, score: 600, behavior: 'strafe', color: 0xff44ff, accentColor: 0xaa22aa, fireRate: 0.35, fireDamage: 16 },
};

export class GameEngine {
  private app: PIXI.Application | null = null;
  private input: InputHandler | null = null;
  private running = false;

  private backgroundLayer: PIXI.Container = new PIXI.Container();
  private gameLayer: PIXI.Container = new PIXI.Container();
  private effectsLayer: PIXI.Container = new PIXI.Container();
  private hudLayer: PIXI.Container = new PIXI.Container();

  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private stars: Star[] = [];
  private nebulae: Nebula[] = [];
  private planets: Planet[] = [];

  private gameState: GameState = {
    phase: 'playing',
    wave: 0,
    waveTimer: 0,
    waveDelay: 3,
    enemiesRemaining: 0,
    screenShake: 0,
    screenFlash: 0,
    flashColor: 0xffffff,
    slowMotion: 0,
  };

  private fireTimer = 0;
  private lastTime = 0;
  private accumulator = 0;
  private fixedDt = 1 / 60;

  private nextId = 0;
  private events: GameEvents = {};

  private starSprites: PIXI.Graphics[] = [];
  private nebulaSprites: PIXI.Graphics[] = [];
  private planetSprites: PIXI.Graphics[] = [];
  private entitySprites = new Map<string, PIXI.Graphics>();
  private particleSprites: PIXI.Graphics[] = [];

  private screenShakeOffset = { x: 0, y: 0 };
  private flashOverlay: PIXI.Graphics | null = null;
  private engineParticles: Particle[] = [];
  private time = 0;

  constructor() {}

  private ensureInput(): InputHandler {
    if (!this.input) {
      this.input = new InputHandler();
      this.input.init();
    }
    return this.input;
  }

  async init(canvasOrContainer: HTMLCanvasElement | HTMLElement, events: GameEvents = {}): Promise<void> {
    this.events = events;
    this.app = new PIXI.Application();

    const width = window.innerWidth;
    const height = window.innerHeight;

    await this.app.init({
      width,
      height,
      backgroundColor: 0x020510,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    if (canvasOrContainer instanceof HTMLCanvasElement) {
      canvasOrContainer.replaceWith(this.app.canvas);
    } else {
      canvasOrContainer.appendChild(this.app.canvas);
    }

    this.app.stage.addChild(this.backgroundLayer);
    this.app.stage.addChild(this.gameLayer);
    this.app.stage.addChild(this.effectsLayer);
    this.app.stage.addChild(this.hudLayer);

    this.flashOverlay = new PIXI.Graphics();
    this.effectsLayer.addChild(this.flashOverlay);

    this.generateBackground();
    this.setupResizeHandler();
    this.reset();
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      if (!this.app) return;
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      this.generateBackground();
    });
  }

  private generateBackground(): void {
    this.starSprites.forEach(s => s.destroy());
    this.nebulaSprites.forEach(s => s.destroy());
    this.planetSprites.forEach(s => s.destroy());
    this.starSprites = [];
    this.nebulaSprites = [];
    this.planetSprites = [];
    this.backgroundLayer.removeChildren();

    this.stars = [];
    this.nebulae = [];
    this.planets = [];

    const w = this.app!.screen.width;
    const h = this.app!.screen.height;

    for (let i = 0; i < 300; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.5 + 0.3,
        speed: Math.random() * 30 + 8,
        brightness: Math.random() * 0.6 + 0.4,
        layer: Math.floor(Math.random() * 3),
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 3 + 1,
      });
    }

    for (let i = 0; i < 5; i++) {
      this.nebulae.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 250 + 120,
        color: [0x220044, 0x002244, 0x440022, 0x004422, 0x220033][i % 5],
        alpha: Math.random() * 0.12 + 0.04,
        speed: Math.random() * 8 + 3,
      });
    }

    for (let i = 0; i < 3; i++) {
      this.planets.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 50 + 25,
        color: [0x4466aa, 0xaa6644, 0x66aa44][i],
        hasRing: i === 0,
        ringColor: 0x88aacc,
        speed: Math.random() * 5 + 2,
        glowColor: [0x6688cc, 0xcc8866, 0x88cc66][i],
      });
    }

    for (const nebula of this.nebulae) {
      const g = new PIXI.Graphics();
      g.circle(0, 0, nebula.radius);
      g.fill({ color: nebula.color, alpha: nebula.alpha });
      g.circle(0, 0, nebula.radius * 0.6);
      g.fill({ color: nebula.color, alpha: nebula.alpha * 1.5 });
      g.x = nebula.x;
      g.y = nebula.y;
      this.backgroundLayer.addChild(g);
      this.nebulaSprites.push(g);
    }

    for (const planet of this.planets) {
      const g = new PIXI.Graphics();
      const grad = this.app!.renderer;
      g.circle(0, 0, planet.radius);
      g.fill({ color: planet.color });
      g.circle(0, 0, planet.radius + 3);
      g.stroke({ color: planet.glowColor, width: 2, alpha: 0.4 });

      if (planet.hasRing) {
        g.ellipse(0, 0, planet.radius * 1.9, planet.radius * 0.35);
        g.stroke({ color: planet.ringColor, width: 4, alpha: 0.35 });
        g.ellipse(0, 0, planet.radius * 2.1, planet.radius * 0.4);
        g.stroke({ color: planet.ringColor, width: 2, alpha: 0.2 });
      }

      g.circle(-planet.radius * 0.3, -planet.radius * 0.3, planet.radius * 0.15);
      g.fill({ color: 0xffffff, alpha: 0.08 });

      g.x = planet.x;
      g.y = planet.y;
      this.backgroundLayer.addChild(g);
      this.planetSprites.push(g);
    }

    for (const star of this.stars) {
      const g = new PIXI.Graphics();
      g.circle(0, 0, star.size);
      g.fill({ color: 0xffffff, alpha: star.brightness });
      g.x = star.x;
      g.y = star.y;
      this.backgroundLayer.addChild(g);
      this.starSprites.push(g);
    }
  }

  start(): void {
    if (this.running || !this.app) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.app.ticker.add(this.gameLoop.bind(this));
  }

  stop(): void {
    this.running = false;
    if (this.app) {
      this.app.ticker.remove(this.gameLoop.bind(this));
    }
  }

  reset(): void {
    this.gameLayer.removeChildren();
    this.effectsLayer.removeChildren();
    this.entitySprites.clear();
    this.particleSprites = [];
    this.engineParticles = [];

    if (this.flashOverlay) {
      this.effectsLayer.addChild(this.flashOverlay);
    }

    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles = [];

    this.gameState = {
      phase: 'playing',
      wave: 0,
      waveTimer: 2,
      waveDelay: 3,
      enemiesRemaining: 0,
      screenShake: 0,
      screenFlash: 0,
      flashColor: 0xffffff,
      slowMotion: 0,
    };

    const w = this.app ? this.app.screen.width : 960;
    const h = this.app ? this.app.screen.height : 640;

    this.player = {
      id: this.generateId(),
      x: w / 2,
      y: h / 2,
      vx: 0,
      vy: 0,
      rotation: -Math.PI / 2,
      radius: 20,
      hp: 100,
      maxHp: 100,
      alive: true,
      type: 'player',
      shield: 50,
      maxShield: 50,
      shieldRegenTimer: 0,
      weapons: [{ weapon: 'laser' as WeaponType, ammo: -1 }],
      activeWeapon: 0,
      score: 0,
      combo: 0,
      comboTimer: 0,
      lastDamageTime: 0,
      repairKitCount: 3,
    };

    this.fireTimer = 0;
    this.time = 0;
    this.spawnEntity(this.player);
    this.emitHudEvents();
  }

  private gameLoop(_ticker: import('pixi.js').Ticker): void {
    if (!this.running || !this.app) return;

    const now = performance.now();
    let frameDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    frameDt = Math.min(frameDt, 0.1);

    if (this.gameState.slowMotion > 0) {
      frameDt *= 0.3;
      this.gameState.slowMotion -= frameDt;
    }

    this.time += frameDt;
    this.accumulator += frameDt;

    while (this.accumulator >= this.fixedDt) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.renderVisuals();
  }

  update(dt: number): void {
    if (this.gameState.phase === 'gameover') return;

    this.handleInput(dt);
    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.updateBackground(dt);
    this.updateWave(dt);
    this.updateScreenEffects(dt);
    this.cleanupDeadEntities();
  }

  private handleInput(dt: number): void {
    if (!this.player || !this.player.alive) return;

    const input = this.ensureInput();
    const movement = input.getMovementVector();
    const baseSpeed = 320;
    const hpFactor = this.player.hp / this.player.maxHp;
    const speedPenalty = hpFactor < 0.5 ? 0.8 : hpFactor < 0.25 ? 0.6 : 1;
    const speed = baseSpeed * speedPenalty;

    this.player.vx = movement.x * speed;
    this.player.vy = movement.y * speed;

    const mouse = input.getMousePos();
    if (this.app) {
      const dx = mouse.x - this.player.x;
      const dy = mouse.y - this.player.y;
      const targetAngle = Math.atan2(dy, dx);
      let angleDiff = targetAngle - this.player.rotation;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.player.rotation += angleDiff * Math.min(1, 12 * dt);
    }

    const weaponSwitch = input.isWeaponSwitch();
    if (weaponSwitch >= 0 && weaponSwitch < this.player.weapons.length) {
      this.player.activeWeapon = weaponSwitch;
    }

    const scrollDelta = input.getScrollDelta();
    if (scrollDelta !== 0) {
      const dir = scrollDelta > 0 ? 1 : -1;
      this.player.activeWeapon = (this.player.activeWeapon + dir + this.player.weapons.length) % this.player.weapons.length;
    }

    if (input.isMouseDown() || input.isKeyDown('Space')) {
      this.fireTimer -= dt;
      if (this.fireTimer <= 0) {
        this.firePlayerWeapon();
      }
    } else {
      this.fireTimer = 0;
    }
  }

  private firePlayerWeapon(): void {
    if (!this.player || !this.player.alive) return;

    const slot = this.player.weapons[this.player.activeWeapon];
    if (!slot) return;

    const data = WEAPON_DATA[slot.weapon];
    if (!data) return;
    if (!data.infinite && slot.ammo <= 0) return;

    this.fireTimer = data.fireRate;
    if (!data.infinite) slot.ammo--;

    const angle = this.player.rotation;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const spawnDist = 24;

    for (let i = 0; i < data.count; i++) {
      const spreadAngle = angle + (i - (data.count - 1) / 2) * data.spread;
      const projectile: Projectile = {
        id: this.generateId(),
        x: this.player.x + cosA * spawnDist,
        y: this.player.y + sinA * spawnDist,
        vx: Math.cos(spreadAngle) * data.speed,
        vy: Math.sin(spreadAngle) * data.speed,
        rotation: spreadAngle,
        radius: data.size,
        hp: 1,
        maxHp: 1,
        alive: true,
        type: 'projectile',
        weapon: slot.weapon,
        damage: data.damage,
        lifetime: data.lifetime,
        isPlayer: true,
        homing: data.homing,
        homingTarget: null,
        trail: [],
      };

      if (data.homing && this.enemies.length > 0) {
        let closest: Enemy | null = null;
        let closestDist = Infinity;
        for (const enemy of this.enemies) {
          const dist = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);
          if (dist < closestDist) { closestDist = dist; closest = enemy; }
        }
        projectile.homingTarget = closest;
      }

      this.projectiles.push(projectile);
      this.spawnEntity(projectile);
    }

    this.spawnMuzzleFlash(this.player.x + cosA * (spawnDist + 4), this.player.y + sinA * (spawnDist + 4), data.color, slot.weapon);
  }

  private spawnMuzzleFlash(x: number, y: number, color: number, weapon: WeaponType): void {
    const count = weapon === 'railgun' ? 15 : weapon === 'plasma' ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 150 + 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.15,
        maxLife: 0.4,
        size: Math.random() * 4 + 1,
        color,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private updatePlayer(dt: number): void {
    if (!this.player || !this.player.alive) return;

    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;

    if (this.app) {
      this.player.x = Math.max(this.player.radius, Math.min(this.app.screen.width - this.player.radius, this.player.x));
      this.player.y = Math.max(this.player.radius, Math.min(this.app.screen.height - this.player.radius, this.player.y));
    }

    this.player.shieldRegenTimer += dt;
    if (this.player.shieldRegenTimer > 3 && this.player.shield < this.player.maxShield) {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 12 * dt);
    }

    this.player.comboTimer -= dt;
    if (this.player.comboTimer <= 0) this.player.combo = 0;

    this.player.lastDamageTime += dt;

    const speed = Math.hypot(this.player.vx, this.player.vy);
    if (speed > 20) {
      const angle = this.player.rotation + Math.PI;
      const engineIntensity = speed / 320;
      for (let i = 0; i < 2; i++) {
        const spread = (Math.random() - 0.5) * 0.5;
        this.particles.push({
          x: this.player.x + Math.cos(angle) * 14 + (Math.random() - 0.5) * 6,
          y: this.player.y + Math.sin(angle) * 14 + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle + spread) * (100 + engineIntensity * 100) + this.player.vx * 0.3,
          vy: Math.sin(angle + spread) * (100 + engineIntensity * 100) + this.player.vy * 0.3,
          life: 0.3 + Math.random() * 0.2,
          maxLife: 0.5,
          size: Math.random() * 5 + 2,
          color: engineIntensity > 0.7 ? 0x4488ff : 0x2266dd,
          alpha: 0.8,
          type: 'engine',
        });
      }
    }

    const hpRatio = this.player.hp / this.player.maxHp;
    if (hpRatio < 0.75 && Math.random() < 0.15) {
      const side = Math.random() > 0.5 ? 1 : -1;
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 20,
        y: this.player.y + side * 8,
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 30,
        life: 0.4,
        maxLife: 0.4,
        size: Math.random() * 2 + 1,
        color: 0xffaa44,
        alpha: 1,
        type: 'spark',
      });
    }

    if (hpRatio < 0.5 && Math.random() < 0.1) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 16,
        y: this.player.y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        life: 0.6,
        maxLife: 0.6,
        size: Math.random() * 4 + 2,
        color: 0x444444,
        alpha: 0.5,
        type: 'smoke',
      });
    }

    this.updateEntitySprite(this.player);
    this.emitHudEvents();
  }

  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.alive || !this.player) continue;

      this.updateAI(enemy, dt);

      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;

      enemy.fireTimer -= dt;
      if (enemy.fireTimer <= 0 && ENEMY_CONFIGS[enemy.enemyType].fireRate < 100) {
        this.fireEnemyWeapon(enemy);
      }

      enemy.reinforcementTimer -= dt;
      if (enemy.reinforcementTimer <= 0 && !enemy.hasReinforcement && enemy.enemyType !== 'swarm' && enemy.enemyType !== 'kamikaze') {
        enemy.hasReinforcement = true;
        const count = enemy.enemyType === 'elite' ? 3 : 2;
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            if (this.gameState.phase === 'playing') this.spawnEnemy('swarm');
          }, i * 300);
          this.gameState.enemiesRemaining++;
        }
      }

      if (this.app) {
        const margin = 150;
        if (enemy.x < -margin || enemy.x > this.app.screen.width + margin ||
            enemy.y < -margin || enemy.y > this.app.screen.height + margin) {
          if (enemy.ai.state !== 'approach') enemy.alive = false;
        }
      }

      this.updateEntitySprite(enemy);
    }
  }

  private updateAI(enemy: Enemy, dt: number): void {
    if (!this.player) return;

    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    enemy.ai.timer -= dt;
    const cfg = ENEMY_CONFIGS[enemy.enemyType];

    switch (enemy.ai.state) {
      case 'approach': {
        const speed = cfg.speed * 0.8;
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        if (dist < 250 || enemy.ai.timer <= 0) {
          enemy.ai.state = enemy.behavior;
          enemy.ai.timer = 2 + Math.random() * 2;
        }
        break;
      }
      case 'attack': {
        const speed = cfg.speed;
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        if (dist < 120) { enemy.ai.state = 'retreat'; enemy.ai.timer = 1.5; }
        break;
      }
      case 'retreat': {
        const speed = cfg.speed * 0.7;
        enemy.vx = -Math.cos(angle) * speed;
        enemy.vy = -Math.sin(angle) * speed;
        if (enemy.ai.timer <= 0) { enemy.ai.state = 'approach'; enemy.ai.timer = 1; }
        break;
      }
      case 'flank': {
        enemy.ai.flankAngle += dt * 1.8;
        const flankAngle = angle + Math.PI / 2 * Math.sign(enemy.ai.flankAngle);
        const speed = cfg.speed;
        enemy.vx = Math.cos(flankAngle) * speed;
        enemy.vy = Math.sin(flankAngle) * speed;
        if (enemy.ai.timer <= 0) { enemy.ai.state = 'attack'; enemy.ai.timer = 2; }
        break;
      }
      case 'circle': {
        const circleAngle = angle + Math.PI / 2;
        const speed = cfg.speed * 0.8;
        enemy.vx = Math.cos(circleAngle) * speed + Math.cos(angle) * 20;
        enemy.vy = Math.sin(circleAngle) * speed + Math.sin(angle) * 20;
        if (enemy.ai.timer <= 0) { enemy.ai.state = 'attack'; enemy.ai.timer = 1.5; }
        break;
      }
      case 'strafe': {
        const strafeAngle = angle + (Math.sin(enemy.ai.timer * 3) > 0 ? Math.PI / 2 : -Math.PI / 2);
        const speed = cfg.speed;
        enemy.vx = Math.cos(strafeAngle) * speed;
        enemy.vy = Math.sin(strafeAngle) * speed;
        if (enemy.ai.timer <= 0) { enemy.ai.state = 'retreat'; enemy.ai.timer = 1; }
        break;
      }
      case 'kamikaze': {
        const speed = cfg.speed;
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        break;
      }
      case 'swarm': {
        const speed = cfg.speed;
        enemy.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 40;
        enemy.vy = Math.sin(angle) * speed + (Math.random() - 0.5) * 40;
        break;
      }
      case 'snipe': {
        const desiredDist = 350;
        if (dist < desiredDist - 50) {
          enemy.vx = -Math.cos(angle) * cfg.speed * 0.6;
          enemy.vy = -Math.sin(angle) * cfg.speed * 0.6;
        } else if (dist > desiredDist + 50) {
          enemy.vx = Math.cos(angle) * cfg.speed * 0.5;
          enemy.vy = Math.sin(angle) * cfg.speed * 0.5;
        } else {
          const perpAngle = angle + Math.PI / 2;
          enemy.vx = Math.cos(perpAngle) * cfg.speed * 0.4;
          enemy.vy = Math.sin(perpAngle) * cfg.speed * 0.4;
        }
        break;
      }
    }

    const targetAngle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
    let angleDiff = targetAngle - enemy.rotation;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    enemy.rotation += angleDiff * Math.min(1, 6 * dt);
  }

  private fireEnemyWeapon(enemy: Enemy): void {
    if (!this.player || !this.player.alive) return;

    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const angle = Math.atan2(dy, dx);
    const dist = Math.hypot(dx, dy);

    if (dist > 550) return;

    const cfg = ENEMY_CONFIGS[enemy.enemyType];
    enemy.fireTimer = cfg.fireRate + Math.random() * 0.3;

    const count = enemy.enemyType === 'elite' ? 3 : enemy.enemyType === 'gunship' ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * 0.12;
      const projectile: Projectile = {
        id: this.generateId(),
        x: enemy.x + Math.cos(angle) * enemy.radius,
        y: enemy.y + Math.sin(angle) * enemy.radius,
        vx: Math.cos(angle + spread) * 380,
        vy: Math.sin(angle + spread) * 380,
        rotation: angle + spread,
        radius: 4,
        hp: 1, maxHp: 1, alive: true,
        type: 'projectile',
        weapon: 'laser',
        damage: cfg.fireDamage,
        lifetime: 2,
        isPlayer: false,
        homing: false,
        homingTarget: null,
        trail: [],
      };
      this.projectiles.push(projectile);
      this.spawnEntity(projectile);
    }
  }

  private updateProjectiles(dt: number): void {
    for (const proj of this.projectiles) {
      if (!proj.alive) continue;

      if (proj.homing && proj.homingTarget && proj.homingTarget.alive) {
        const dx = proj.homingTarget.x - proj.x;
        const dy = proj.homingTarget.y - proj.y;
        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(proj.vy, proj.vx);
        let angleDiff = targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const turnRate = 3.5 * dt;
        const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);
        const speed = Math.hypot(proj.vx, proj.vy);
        proj.vx = Math.cos(newAngle) * speed;
        proj.vy = Math.sin(newAngle) * speed;
        proj.rotation = newAngle;
      }

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.lifetime -= dt;

      proj.trail.push({ x: proj.x, y: proj.y });
      if (proj.trail.length > 10) proj.trail.shift();

      if (proj.lifetime <= 0) proj.alive = false;

      if (this.app) {
        if (proj.x < -80 || proj.x > this.app.screen.width + 80 ||
            proj.y < -80 || proj.y > this.app.screen.height + 80) {
          proj.alive = false;
        }
      }

      this.checkProjectileCollisions(proj);
      this.updateEntitySprite(proj);
    }
  }

  private checkProjectileCollisions(proj: Projectile): void {
    if (!proj.alive) return;

    if (proj.isPlayer) {
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const dist = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
        if (dist < enemy.radius + proj.radius) {
          proj.alive = false;
          enemy.hp -= proj.damage;

          this.spawnHitParticles(proj.x, proj.y, WEAPON_DATA[proj.weapon]?.color || 0xffffff);

          if (enemy.hp <= 0) {
            enemy.alive = false;
            this.destroyEnemy(enemy);
          }
          break;
        }
      }
    } else {
      if (this.player && this.player.alive) {
        const dist = Math.hypot(this.player.x - proj.x, this.player.y - proj.y);
        if (dist < this.player.radius + proj.radius) {
          proj.alive = false;
          this.damagePlayer(proj.damage);
        }
      }
    }
  }

  private damagePlayer(damage: number): void {
    if (!this.player || !this.player.alive) return;

    this.player.lastDamageTime = 0;
    this.player.shieldRegenTimer = 0;

    if (this.player.shield > 0) {
      const shieldAbsorb = Math.min(this.player.shield, damage);
      this.player.shield -= shieldAbsorb;
      damage -= shieldAbsorb;
      this.gameState.screenShake = Math.max(this.gameState.screenShake, 4);
      this.spawnShieldParticles(this.player.x, this.player.y);
    }

    if (damage > 0) {
      this.player.hp -= damage;
      this.gameState.screenShake = Math.max(this.gameState.screenShake, 6);
      this.gameState.screenFlash = 0.08;
      this.gameState.flashColor = 0xff0000;
      this.spawnHitParticles(this.player.x, this.player.y, 0xff4444);
    }

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.player.alive = false;
      this.gameState.phase = 'gameover';
      this.gameState.screenShake = 18;
      this.gameState.screenFlash = 0.4;
      this.gameState.flashColor = 0xff2200;
      this.spawnExplosion(this.player.x, this.player.y, 0x00aaff, 40);
      this.spawnExplosion(this.player.x, this.player.y, 0xff8844, 25);
      if (this.events.onGameOver) this.events.onGameOver();
    }

    this.emitHudEvents();
  }

  private destroyEnemy(enemy: Enemy): void {
    if (!this.player) return;

    const cfg = ENEMY_CONFIGS[enemy.enemyType];
    this.spawnExplosion(enemy.x, enemy.y, cfg.color, 20);
    this.spawnExplosion(enemy.x, enemy.y, 0xffaa44, 12);

    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 120 + 40;
      this.particles.push({
        x: enemy.x, y: enemy.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.3,
        size: Math.random() * 3 + 2,
        color: cfg.accentColor,
        alpha: 1,
        type: 'spark',
      });
    }

    this.gameState.screenShake = Math.max(this.gameState.screenShake, enemy.enemyType === 'elite' ? 10 : 4);

    if (enemy.enemyType === 'elite') {
      this.gameState.slowMotion = 0.5;
    }

    this.player.combo++;
    this.player.comboTimer = 3;
    const comboMultiplier = 1 + (this.player.combo - 1) * 0.1;
    const scoreGain = Math.floor(enemy.scoreValue * comboMultiplier);
    this.player.score += scoreGain;
    this.gameState.enemiesRemaining--;

    if (Math.random() < 0.25 || enemy.enemyType === 'elite') {
      this.spawnPickup(enemy.x, enemy.y, enemy.enemyType === 'elite');
    }

    if (this.events.onComboChange) this.events.onComboChange(this.player.combo);
  }

  private spawnPickup(x: number, y: number, isElite = false): void {
    const isWeapon = Math.random() < 0.65;
    const weaponTypes: WeaponType[] = ['spread', 'railgun', 'missile', 'plasma', 'emp'];
    const pickup: Pickup = {
      id: this.generateId(),
      x, y,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      rotation: 0,
      radius: 14,
      hp: 1, maxHp: 1, alive: true,
      type: 'pickup',
      pickupType: isWeapon ? 'weapon' : 'repair',
      weapon: isWeapon ? weaponTypes[Math.floor(Math.random() * weaponTypes.length)] : undefined,
      amount: isWeapon ? (isElite ? 40 : 20) : (isElite ? 40 : 25),
      bobTimer: 0,
    };
    this.pickups.push(pickup);
    this.spawnEntity(pickup);
  }

  private updatePickups(dt: number): void {
    if (!this.player || !this.player.alive) return;

    for (const pickup of this.pickups) {
      if (!pickup.alive) continue;

      pickup.bobTimer += dt;
      pickup.x += pickup.vx * dt;
      pickup.y += pickup.vy * dt;
      pickup.vx *= 0.96;
      pickup.vy *= 0.96;

      const dist = Math.hypot(this.player.x - pickup.x, this.player.y - pickup.y);
      if (dist < this.player.radius + pickup.radius + 15) {
        pickup.alive = false;

        if (pickup.pickupType === 'weapon' && pickup.weapon) {
          const existingSlot = this.player.weapons.find(w => w.weapon === pickup.weapon);
          if (existingSlot) {
            const data = WEAPON_DATA[pickup.weapon];
            existingSlot.ammo = Math.min(existingSlot.ammo + pickup.amount, data.maxAmmo);
          } else if (this.player.weapons.length < 3) {
            this.player.weapons.push({ weapon: pickup.weapon, ammo: pickup.amount });
          }
        } else if (pickup.pickupType === 'repair') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + pickup.amount);
          this.player.shield = Math.min(this.player.maxShield, this.player.shield + pickup.amount / 2);
          for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
              x: this.player.x + Math.cos(angle) * 15,
              y: this.player.y + Math.sin(angle) * 15,
              vx: Math.cos(angle) * 40,
              vy: Math.sin(angle) * 40,
              life: 0.5,
              maxLife: 0.5,
              size: Math.random() * 4 + 2,
              color: 0x44ff88,
              alpha: 1,
              type: 'repair',
            });
          }
        }

        this.spawnPickupParticles(pickup.x, pickup.y, pickup.pickupType === 'weapon' ? 0x00ff88 : 0x44ff44);
      }

      this.updateEntitySprite(pickup);
    }
  }

  private updateParticles(dt: number): void {
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      particle.alpha = Math.max(0, particle.life / particle.maxLife);
      particle.vx *= 0.97;
      particle.vy *= 0.97;
      if (particle.type === 'explosion') particle.size *= 0.96;
    }

    this.particles = this.particles.filter(p => p.life > 0);
    this.renderParticles();
  }

  private updateBackground(dt: number): void {
    const w = this.app!.screen.width;
    const h = this.app!.screen.height;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      const sprite = this.starSprites[i];
      if (!sprite) continue;

      star.twinkle += star.twinkleSpeed * dt;
      const twinkleAlpha = star.brightness * (0.7 + 0.3 * Math.sin(star.twinkle));

      star.y += star.speed * dt;
      if (star.y > h + 10) { star.y = -10; star.x = Math.random() * w; }

      sprite.x = star.x;
      sprite.y = star.y;
      sprite.alpha = twinkleAlpha;
    }

    for (let i = 0; i < this.nebulae.length; i++) {
      const nebula = this.nebulae[i];
      const sprite = this.nebulaSprites[i];
      if (!sprite) continue;

      nebula.y += nebula.speed * dt;
      if (nebula.y > h + nebula.radius) { nebula.y = -nebula.radius; }
      sprite.y = nebula.y;
    }

    for (let i = 0; i < this.planets.length; i++) {
      const planet = this.planets[i];
      const sprite = this.planetSprites[i];
      if (!sprite) continue;

      planet.y += planet.speed * dt;
      if (planet.y > h + planet.radius + 100) { planet.y = -planet.radius - 100; }
      sprite.y = planet.y;
    }
  }

  private updateWave(dt: number): void {
    if (this.gameState.phase !== 'playing') return;

    if (this.gameState.enemiesRemaining <= 0 && this.enemies.filter(e => e.alive).length === 0) {
      this.gameState.waveTimer -= dt;
      if (this.gameState.waveTimer <= 0) {
        this.gameState.wave++;
        this.spawnWave(this.gameState.wave);
        this.gameState.waveTimer = this.gameState.waveDelay;
        if (this.events.onWaveComplete && this.gameState.wave > 1) this.events.onWaveComplete();
      }
    }

    this.emitHudEvents();
  }

  private spawnWave(wave: number): void {
    const configs = this.getWaveConfig(wave);
    let delay = 0;
    for (const group of configs.enemies) {
      for (let i = 0; i < group.count; i++) {
        const d = delay;
        setTimeout(() => {
          if (this.gameState.phase === 'playing') this.spawnEnemy(group.type);
        }, d * 1000);
        delay += group.delay;
      }
    }
    this.gameState.enemiesRemaining = configs.enemies.reduce((sum, g) => sum + g.count, 0);
  }

  private getWaveConfig(wave: number): WaveConfig {
    const configs: WaveConfig[] = [
      { wave: 1, enemies: [{ type: 'scout' as EnemyType, count: 5, delay: 0.8 }], eliteChance: 0, reinforcementChance: 0 },
      { wave: 2, enemies: [{ type: 'scout' as EnemyType, count: 4, delay: 0.7 }, { type: 'fighter' as EnemyType, count: 2, delay: 1.0 }], eliteChance: 0, reinforcementChance: 0.1 },
      { wave: 3, enemies: [{ type: 'fighter' as EnemyType, count: 4, delay: 0.8 }, { type: 'kamikaze' as EnemyType, count: 3, delay: 0.5 }], eliteChance: 0.05, reinforcementChance: 0.15 },
      { wave: 4, enemies: [{ type: 'scout' as EnemyType, count: 3, delay: 0.6 }, { type: 'gunship' as EnemyType, count: 2, delay: 1.2 }, { type: 'sniper' as EnemyType, count: 1, delay: 1.5 }], eliteChance: 0.1, reinforcementChance: 0.2 },
      { wave: 5, enemies: [{ type: 'fighter' as EnemyType, count: 5, delay: 0.6 }, { type: 'swarm' as EnemyType, count: 8, delay: 0.3 }, { type: 'gunship' as EnemyType, count: 2, delay: 1.0 }], eliteChance: 0.15, reinforcementChance: 0.25 },
    ];

    if (wave <= configs.length) return configs[wave - 1];

    const baseConfig = configs[configs.length - 1];
    const scaledEnemies = baseConfig.enemies.map(e => ({
      ...e,
      count: Math.min(e.count + Math.floor((wave - configs.length) * 0.5), e.count * 3),
    }));

    return {
      wave,
      enemies: scaledEnemies,
      eliteChance: Math.min(baseConfig.eliteChance + (wave - configs.length) * 0.05, 0.4),
      reinforcementChance: Math.min(baseConfig.reinforcementChance + (wave - configs.length) * 0.03, 0.5),
    };
  }

  private spawnEnemy(enemyType: EnemyType): void {
    if (!this.app) return;

    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;
    switch (side) {
      case 0: x = Math.random() * this.app.screen.width; y = -30; break;
      case 1: x = this.app.screen.width + 30; y = Math.random() * this.app.screen.height; break;
      case 2: x = Math.random() * this.app.screen.width; y = this.app.screen.height + 30; break;
      default: x = -30; y = Math.random() * this.app.screen.height; break;
    }

    const cfg = ENEMY_CONFIGS[enemyType];

    const enemy: Enemy = {
      id: this.generateId(),
      x, y,
      vx: 0, vy: 0,
      rotation: 0,
      radius: cfg.radius,
      hp: cfg.hp,
      maxHp: cfg.hp,
      alive: true,
      type: 'enemy',
      enemyType,
      ai: { state: 'approach', targetX: 0, targetY: 0, timer: 1.5 + Math.random(), flankAngle: Math.random() * Math.PI * 2 },
      fireTimer: 1 + Math.random(),
      reinforcementTimer: 12 + Math.random() * 10,
      hasReinforcement: false,
      scoreValue: cfg.score,
      behavior: cfg.behavior,
    };

    this.enemies.push(enemy);
    this.spawnEntity(enemy);
  }

  private updateScreenEffects(dt: number): void {
    if (this.gameState.screenShake > 0) {
      const intensity = this.gameState.screenShake;
      this.screenShakeOffset.x = (Math.random() - 0.5) * intensity * 2;
      this.screenShakeOffset.y = (Math.random() - 0.5) * intensity * 2;
      this.gameState.screenShake *= 0.88;
      if (this.gameState.screenShake < 0.1) {
        this.gameState.screenShake = 0;
        this.screenShakeOffset.x = 0;
        this.screenShakeOffset.y = 0;
      }
    }

    if (this.gameState.screenFlash > 0) this.gameState.screenFlash -= dt;

    if (this.flashOverlay) {
      this.flashOverlay.clear();
      if (this.gameState.screenFlash > 0 && this.app) {
        this.flashOverlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
        this.flashOverlay.fill({ color: this.gameState.flashColor, alpha: this.gameState.screenFlash * 3 });
      }
    }

    this.gameLayer.x = this.screenShakeOffset.x;
    this.gameLayer.y = this.screenShakeOffset.y;
    this.effectsLayer.x = this.screenShakeOffset.x;
    this.effectsLayer.y = this.screenShakeOffset.y;
  }

  private cleanupDeadEntities(): void {
    this.enemies = this.enemies.filter(e => { if (!e.alive) { this.removeEntity(e.id); return false; } return true; });
    this.projectiles = this.projectiles.filter(p => { if (!p.alive) { this.removeEntity(p.id); return false; } return true; });
    this.pickups = this.pickups.filter(p => { if (!p.alive) { this.removeEntity(p.id); return false; } return true; });
  }

  private spawnEntity(entity: { id: string; x: number; y: number; radius: number; type: string }): void {
    const g = new PIXI.Graphics();
    g.x = entity.x;
    g.y = entity.y;

    switch (entity.type) {
      case 'player': this.drawPlayerShip(g); break;
      case 'enemy': this.drawEnemyShip(g, entity as Enemy); break;
      case 'projectile': this.drawProjectile(g, entity as Projectile); break;
      case 'pickup': this.drawPickup(g, entity as Pickup); break;
    }

    this.gameLayer.addChild(g);
    this.entitySprites.set(entity.id, g);
  }

  private updateEntitySprite(entity: { id: string; x: number; y: number; rotation: number }): void {
    const sprite = this.entitySprites.get(entity.id);
    if (!sprite) return;
    sprite.x = entity.x;
    sprite.y = entity.y;
    sprite.rotation = entity.rotation;
  }

  private removeEntity(id: string): void {
    const sprite = this.entitySprites.get(id);
    if (sprite) { this.gameLayer.removeChild(sprite); sprite.destroy(); this.entitySprites.delete(id); }
  }

  private drawPlayerShip(g: PIXI.Graphics): void {
    const hpRatio = this.player ? this.player.hp / this.player.maxHp : 1;
    const baseColor = 0x1a3a5c;
    const highlightColor = 0x2a5a8c;
    const accentColor = 0x00aaff;
    const engineColor = 0x0066cc;

    g.moveTo(26, 0);
    g.lineTo(14, -7);
    g.lineTo(4, -10);
    g.lineTo(-6, -12);
    g.lineTo(-14, -10);
    g.lineTo(-18, -6);
    g.lineTo(-16, 0);
    g.lineTo(-18, 6);
    g.lineTo(-14, 10);
    g.lineTo(-6, 12);
    g.lineTo(4, 10);
    g.lineTo(14, 7);
    g.closePath();
    g.fill({ color: baseColor });
    g.stroke({ color: accentColor, width: 1.5, alpha: 0.7 });

    g.moveTo(20, 0);
    g.lineTo(8, -5);
    g.lineTo(-4, -5);
    g.lineTo(-8, 0);
    g.lineTo(-4, 5);
    g.lineTo(8, 5);
    g.closePath();
    g.fill({ color: highlightColor });

    g.moveTo(14, -7);
    g.lineTo(6, -14);
    g.lineTo(-2, -16);
    g.lineTo(-10, -12);
    g.lineTo(-14, -10);
    g.closePath();
    g.fill({ color: 0x0d2847 });
    g.stroke({ color: accentColor, width: 1, alpha: 0.5 });

    g.moveTo(14, 7);
    g.lineTo(6, 14);
    g.lineTo(-2, 16);
    g.lineTo(-10, 12);
    g.lineTo(-14, 10);
    g.closePath();
    g.fill({ color: 0x0d2847 });
    g.stroke({ color: accentColor, width: 1, alpha: 0.5 });

    g.moveTo(0, -5);
    g.lineTo(8, 0);
    g.lineTo(0, 5);
    g.closePath();
    g.fill({ color: accentColor, alpha: 0.3 });

    g.circle(10, 0, 3);
    g.fill({ color: 0x00ffff, alpha: 0.8 });
    g.circle(10, 0, 5);
    g.fill({ color: 0x00ffff, alpha: 0.15 });

    g.rect(-16, -3, 8, 6);
    g.fill({ color: engineColor });
    g.rect(-18, -2, 4, 4);
    g.fill({ color: 0x0044aa, alpha: 0.6 });

    const shieldAlpha = this.player ? (this.player.shield / this.player.maxShield) * 0.25 : 0;
    if (shieldAlpha > 0.02) {
      g.circle(0, 0, 26);
      g.stroke({ color: 0x00aaff, width: 2, alpha: shieldAlpha });
      const pulse = Math.sin(this.time * 4) * 0.05;
      g.circle(0, 0, 28);
      g.stroke({ color: 0x00ccff, width: 1, alpha: shieldAlpha * 0.5 + pulse });
    }

    if (hpRatio < 0.75) {
      const crackCount = Math.floor((1 - hpRatio) * 8);
      for (let i = 0; i < crackCount; i++) {
        const cx = (Math.sin(i * 2.7) * 12);
        const cy = (Math.cos(i * 3.1) * 8);
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.sin(i * 1.3) * 5, cy + Math.cos(i * 1.7) * 4);
        g.lineTo(cx + Math.sin(i * 2.1) * 3, cy + Math.cos(i * 2.9) * 6);
        g.stroke({ color: 0xffaa44, width: 1, alpha: 0.6 });
      }
    }

    if (hpRatio < 0.5) {
      g.rect(-12, -8, 6, 4);
      g.fill({ color: 0x1a1a1a, alpha: 0.5 });
      g.rect(4, 6, 8, 3);
      g.fill({ color: 0x1a1a1a, alpha: 0.5 });
    }

    if (hpRatio < 0.25) {
      const flicker = Math.sin(this.time * 10) > 0 ? 0.3 : 0.1;
      g.rect(-6, -10, 12, 20);
      g.fill({ color: 0x220000, alpha: flicker });
    }
  }

  private drawEnemyShip(g: PIXI.Graphics, enemy: Enemy): void {
    const cfg = ENEMY_CONFIGS[enemy.enemyType];
    const r = enemy.radius;
    const hpRatio = enemy.hp / enemy.maxHp;

    switch (enemy.enemyType) {
      case 'scout':
        g.moveTo(r, 0);
        g.lineTo(r * 0.3, -r * 0.9);
        g.lineTo(-r * 0.5, -r * 0.7);
        g.lineTo(-r * 0.8, -r * 0.3);
        g.lineTo(-r * 0.6, 0);
        g.lineTo(-r * 0.8, r * 0.3);
        g.lineTo(-r * 0.5, r * 0.7);
        g.lineTo(r * 0.3, r * 0.9);
        g.closePath();
        g.fill({ color: cfg.color });
        g.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
        g.circle(r * 0.2, 0, r * 0.2);
        g.fill({ color: 0xffffff, alpha: 0.4 });
        break;

      case 'fighter':
        g.moveTo(r, 0);
        g.lineTo(r * 0.4, -r * 0.5);
        g.lineTo(r * 0.6, -r);
        g.lineTo(-r * 0.2, -r * 0.6);
        g.lineTo(-r * 0.8, -r * 0.3);
        g.lineTo(-r, 0);
        g.lineTo(-r * 0.8, r * 0.3);
        g.lineTo(-r * 0.2, r * 0.6);
        g.lineTo(r * 0.6, r);
        g.lineTo(r * 0.4, r * 0.5);
        g.closePath();
        g.fill({ color: cfg.color });
        g.stroke({ color: cfg.accentColor, width: 1.5, alpha: 0.5 });
        g.moveTo(r * 0.3, -r * 0.3);
        g.lineTo(-r * 0.3, 0);
        g.lineTo(r * 0.3, r * 0.3);
        g.closePath();
        g.fill({ color: cfg.accentColor });
        break;

      case 'gunship':
        g.rect(-r * 0.8, -r * 0.6, r * 1.6, r * 1.2);
        g.fill({ color: cfg.color });
        g.stroke({ color: cfg.accentColor, width: 2, alpha: 0.5 });
        g.rect(-r, -r * 0.3, r * 0.4, r * 0.6);
        g.fill({ color: cfg.accentColor });
        g.rect(r * 0.6, -r * 0.2, r * 0.4, r * 0.4);
        g.fill({ color: 0xffffff, alpha: 0.3 });
        g.circle(0, 0, r * 0.25);
        g.fill({ color: 0xff4400, alpha: 0.5 });
        break;

      case 'kamikaze':
        g.moveTo(r, 0);
        g.lineTo(r * 0.2, -r * 0.6);
        g.lineTo(-r * 0.3, -r * 0.8);
        g.lineTo(-r * 0.8, -r * 0.4);
        g.lineTo(-r * 0.6, 0);
        g.lineTo(-r * 0.8, r * 0.4);
        g.lineTo(-r * 0.3, r * 0.8);
        g.lineTo(r * 0.2, r * 0.6);
        g.closePath();
        g.fill({ color: cfg.color });
        g.stroke({ color: 0xff0000, width: 1.5, alpha: 0.6 });
        const pulse = Math.sin(this.time * 8) * 0.3 + 0.5;
        g.circle(r * 0.1, 0, r * 0.25);
        g.fill({ color: 0xff0000, alpha: pulse });
        break;

      case 'sniper':
        g.moveTo(r * 1.2, 0);
        g.lineTo(r * 0.5, -r * 0.3);
        g.lineTo(r * 0.3, -r * 0.8);
        g.lineTo(-r * 0.3, -r * 0.5);
        g.lineTo(-r * 0.8, -r * 0.3);
        g.lineTo(-r, 0);
        g.lineTo(-r * 0.8, r * 0.3);
        g.lineTo(-r * 0.3, r * 0.5);
        g.lineTo(r * 0.3, r * 0.8);
        g.lineTo(r * 0.5, r * 0.3);
        g.closePath();
        g.fill({ color: cfg.color });
        g.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
        g.moveTo(r * 0.5, -r * 0.15);
        g.lineTo(r * 1.2, 0);
        g.lineTo(r * 0.5, r * 0.15);
        g.closePath();
        g.fill({ color: 0xff0000, alpha: 0.6 });
        break;

      case 'swarm':
        g.circle(0, 0, r);
        g.fill({ color: cfg.color });
        g.stroke({ color: 0xffffff, width: 1, alpha: 0.4 });
        g.circle(0, 0, r * 0.4);
        g.fill({ color: 0x000000, alpha: 0.4 });
        break;

      case 'elite':
        g.moveTo(r, 0);
        g.lineTo(r * 0.6, -r * 0.4);
        g.lineTo(r * 0.8, -r * 0.9);
        g.lineTo(r * 0.2, -r * 0.7);
        g.lineTo(-r * 0.3, -r);
        g.lineTo(-r * 0.7, -r * 0.6);
        g.lineTo(-r, -r * 0.2);
        g.lineTo(-r * 0.9, 0);
        g.lineTo(-r, r * 0.2);
        g.lineTo(-r * 0.7, r * 0.6);
        g.lineTo(-r * 0.3, r);
        g.lineTo(r * 0.2, r * 0.7);
        g.lineTo(r * 0.8, r * 0.9);
        g.lineTo(r * 0.6, r * 0.4);
        g.closePath();
        g.fill({ color: cfg.color });
        g.stroke({ color: 0xffaa00, width: 2, alpha: 0.6 });
        g.moveTo(r * 0.5, -r * 0.3);
        g.lineTo(0, 0);
        g.lineTo(r * 0.5, r * 0.3);
        g.closePath();
        g.fill({ color: cfg.accentColor });
        g.circle(0, 0, r * 0.2);
        g.fill({ color: 0xffffff, alpha: 0.5 });
        const elitePulse = Math.sin(this.time * 3) * 0.15 + 0.3;
        g.circle(0, 0, r * 0.35);
        g.stroke({ color: 0xffaa00, width: 2, alpha: elitePulse });
        break;
    }

    if (hpRatio < 1) {
      const barWidth = r * 2;
      const barY = -r - 8;
      g.rect(-r, barY, barWidth, 3);
      g.fill({ color: 0x222222 });
      g.rect(-r, barY, barWidth * hpRatio, 3);
      g.fill({ color: hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff4444 });
    }
  }

  private drawProjectile(g: PIXI.Graphics, proj: Projectile): void {
    const color = proj.isPlayer
      ? (WEAPON_DATA[proj.weapon]?.color || 0x00ffff)
      : 0xff4444;

    g.circle(0, 0, proj.radius);
    g.fill({ color });

    if (proj.isPlayer) {
      g.circle(0, 0, proj.radius + 3);
      g.fill({ color, alpha: 0.25 });
      g.circle(0, 0, proj.radius * 0.5);
      g.fill({ color: 0xffffff, alpha: 0.6 });
    }

    if (proj.trail.length > 1) {
      const trail = proj.trail;
      g.moveTo(trail[0].x - proj.x, trail[0].y - proj.y);
      for (let i = 1; i < trail.length; i++) {
        g.lineTo(trail[i].x - proj.x, trail[i].y - proj.y);
      }
      g.stroke({ color, width: proj.radius * 0.6, alpha: 0.35 });
    }
  }

  private drawPickup(g: PIXI.Graphics, pickup: Pickup): void {
    const bob = Math.sin(pickup.bobTimer * 3) * 2;
    const glow = Math.sin(pickup.bobTimer * 2) * 0.2 + 0.6;

    g.circle(0, bob, pickup.radius + 4);
    g.fill({
      color: pickup.pickupType === 'weapon' ? 0x00ff88 : 0x44ff44,
      alpha: glow * 0.2
    });

    if (pickup.pickupType === 'weapon') {
      g.rect(-8, -8 + bob, 16, 16);
      g.fill({ color: 0x00ff88 });
      g.stroke({ color: 0xffffff, width: 1.5, alpha: 0.7 });
      g.moveTo(-3, bob);
      g.lineTo(3, bob);
      g.moveTo(0, -3 + bob);
      g.lineTo(0, 3 + bob);
      g.stroke({ color: 0x000000, width: 2 });
    } else {
      g.circle(0, bob, 8);
      g.fill({ color: 0x44ff44 });
      g.stroke({ color: 0xffffff, width: 1.5, alpha: 0.7 });
      g.moveTo(0, -4 + bob);
      g.lineTo(0, 4 + bob);
      g.moveTo(-4, bob);
      g.lineTo(4, bob);
      g.stroke({ color: 0x000000, width: 2 });
    }
  }

  private spawnExplosion(x: number, y: number, color: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 250 + 60;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.6,
        maxLife: 1.1,
        size: Math.random() * 10 + 4,
        color,
        alpha: 1,
        type: 'explosion',
      });
    }

    for (let i = 0; i < count / 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 60 + 20;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.3,
        size: Math.random() * 8 + 5,
        color: 0x666666,
        alpha: 0.5,
        type: 'smoke',
      });
    }
  }

  private spawnHitParticles(x: number, y: number, color: number): void {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 180 + 60;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35,
        maxLife: 0.35,
        size: Math.random() * 3 + 1,
        color,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private spawnShieldParticles(x: number, y: number): void {
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      this.particles.push({
        x: x + Math.cos(angle) * 22,
        y: y + Math.sin(angle) * 22,
        vx: Math.cos(angle) * 40,
        vy: Math.sin(angle) * 40,
        life: 0.5,
        maxLife: 0.5,
        size: 3,
        color: 0x00aaff,
        alpha: 0.9,
        type: 'shield',
      });
    }
  }

  private spawnPickupParticles(x: number, y: number, color: number): void {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 100 + 40;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6,
        maxLife: 0.6,
        size: Math.random() * 5 + 2,
        color,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private renderParticles(): void {
    for (const sprite of this.particleSprites) {
      this.effectsLayer.removeChild(sprite);
      sprite.destroy();
    }
    this.particleSprites = [];

    for (const particle of this.particles) {
      const g = new PIXI.Graphics();

      switch (particle.type) {
        case 'spark':
        case 'shield':
        case 'repair':
          g.circle(0, 0, particle.size);
          g.fill({ color: particle.color, alpha: particle.alpha });
          break;
        case 'explosion':
          g.circle(0, 0, particle.size);
          g.fill({ color: particle.color, alpha: particle.alpha * 0.7 });
          g.circle(0, 0, particle.size * 0.5);
          g.fill({ color: 0xffffff, alpha: particle.alpha * 0.3 });
          break;
        case 'smoke':
          g.circle(0, 0, particle.size);
          g.fill({ color: particle.color, alpha: particle.alpha * 0.35 });
          break;
        case 'engine':
          g.circle(0, 0, particle.size);
          g.fill({ color: particle.color, alpha: particle.alpha * 0.8 });
          break;
      }

      g.x = particle.x;
      g.y = particle.y;
      this.effectsLayer.addChild(g);
      this.particleSprites.push(g);
    }
  }

  private renderVisuals(): void {
    // PixiJS ticker handles rendering automatically
  }

  private emitHudEvents(): void {
    if (!this.player) return;
    if (this.events.onScoreChange) this.events.onScoreChange(this.player.score);
    if (this.events.onHpChange) this.events.onHpChange(this.player.hp, this.player.maxHp, this.player.shield, this.player.maxShield);
    if (this.events.onWaveChange) this.events.onWaveChange(this.gameState.wave, this.gameState.enemiesRemaining);
  }

  private generateId(): string {
    return `entity_${++this.nextId}`;
  }

  getPlayer(): Player | null { return this.player; }
  getGameState(): GameState { return { ...this.gameState }; }
  addScreenShake(amount: number): void { this.gameState.screenShake = Math.max(this.gameState.screenShake, amount); }
  addScreenFlash(duration: number, color: number): void { this.gameState.screenFlash = duration; this.gameState.flashColor = color; }
  triggerSlowMotion(duration: number): void { this.gameState.slowMotion = duration; }
  getInput(): InputHandler | null { return this.input; }

  destroy(): void {
    this.stop();
    if (this.input) this.input.destroy();
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true, textureSource: true });
      this.app = null;
    }
    this.entitySprites.clear();
    this.starSprites = [];
    this.nebulaSprites = [];
    this.planetSprites = [];
    this.particleSprites = [];
  }
}

export const gameEngine = new GameEngine();
