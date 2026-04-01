import { GameState, InputState, Projectile, Pickup, Particle } from './types';
import { vec2 } from './math';
import { createInputState, setupInput, clearFrameInput } from './input';
import {
  PLAYER_MAX_HP,
  PLAYER_MAX_SHIELD,
  PARTICLE_POOL_SIZE,
  SCREEN_SHAKE_DECAY,
  COMBO_TIMEOUT,
} from './constants';
import { StarfieldRenderer } from './renderer/StarfieldRenderer';
import { SpriteFactory } from './renderer/SpriteFactory';
import { PlayerRenderer } from './renderer/PlayerRenderer';
import { EnemyRenderer } from './renderer/EnemyRenderer';
import { ProjectileRenderer } from './renderer/ProjectileRenderer';
import { ParticleRenderer } from './renderer/ParticleRenderer';
import { PickupRenderer } from './renderer/PickupRenderer';
import { HUDRenderer } from './renderer/HUDRenderer';
import { updatePlayer } from './entities/Player';
import { updateEnemy, damageEnemy } from './entities/Enemy';
import { updateProjectile } from './entities/Projectile';
import { updatePickup } from './entities/Pickup';
import { updateParticles } from './entities/Particle';
import { resolveCollisions } from './collision';
import { updateWave } from './waves/WaveManager';
import { WeaponManager } from './weapons/WeaponManager';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState;
  input: InputState;
  lastTime: number = 0;
  rafId: number = 0;
  cleanup: () => void = () => {};
  width: number = 0;
  height: number = 0;

  starfield: StarfieldRenderer;
  sprites: SpriteFactory;
  playerRenderer: PlayerRenderer;
  enemyRenderer: EnemyRenderer;
  projectileRenderer: ProjectileRenderer;
  particleRenderer: ParticleRenderer;
  pickupRenderer: PickupRenderer;
  hudRenderer: HUDRenderer;
  weaponManager: WeaponManager;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d')!;
    this.ctx = ctx;
    this.input = createInputState();

    this.state = this.createInitialState();

    this.sprites = new SpriteFactory(ctx);
    this.starfield = new StarfieldRenderer(ctx);
    this.playerRenderer = new PlayerRenderer(ctx, this.sprites);
    this.enemyRenderer = new EnemyRenderer(ctx, this.sprites);
    this.projectileRenderer = new ProjectileRenderer(ctx);
    this.particleRenderer = new ParticleRenderer(ctx);
    this.pickupRenderer = new PickupRenderer(ctx);
    this.hudRenderer = new HUDRenderer(ctx);
    this.weaponManager = new WeaponManager();
  }

  createInitialState(): GameState {
    return {
      player: {
        pos: vec2(0, 0),
        vel: vec2(0, 0),
        angle: -Math.PI / 2,
        hp: PLAYER_MAX_HP,
        maxHp: PLAYER_MAX_HP,
        shield: PLAYER_MAX_SHIELD,
        maxShield: PLAYER_MAX_SHIELD,
        shieldRegenTimer: 0,
        speed: 0,
        maxSpeed: 350,
        alive: true,
        invulnTimer: 0,
      },
      enemies: [],
      projectiles: [],
      pickups: [],
      particles: this.initParticlePool(),
      weapons: [{ type: 'laser', ammo: Infinity }],
      activeWeapon: 0,
      score: 0,
      wave: 0,
      combo: 0,
      comboTimer: 0,
      comboMultiplier: 1,
      gameOver: false,
      gameStarted: false,
      screenShake: 0,
      screenShakeDecay: SCREEN_SHAKE_DECAY,
      camera: vec2(0, 0),
      time: 0,
      nextId: 1,
    };
  }

  initParticlePool(): Particle[] {
    const pool: Particle[] = [];
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      pool.push({
        pos: vec2(),
        vel: vec2(),
        color: '#fff',
        alpha: 0,
        size: 0,
        lifetime: 0,
        maxLifetime: 0,
        alive: false,
        decay: 0,
        glow: false,
      });
    }
    return pool;
  }

  reset() {
    const newState = this.createInitialState();
    newState.gameStarted = true;
    this.state = newState;
    this.weaponManager.reset();
  }

  start() {
    this.cleanup = setupInput(this.canvas, this.input);
    this.resize();
    this.starfield.generate(this.width, this.height);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    this.cleanup();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  getNextId(): number {
    return this.state.nextId++;
  }

  spawnParticle(p: Partial<Particle>) {
    const pool = this.state.particles;
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].alive) {
        pool[i] = {
          pos: p.pos || vec2(),
          vel: p.vel || vec2(),
          color: p.color || '#fff',
          alpha: p.alpha ?? 1,
          size: p.size ?? 2,
          lifetime: p.lifetime ?? 1,
          maxLifetime: p.maxLifetime ?? 1,
          alive: true,
          decay: p.decay ?? 1,
          glow: p.glow ?? false,
        };
        return;
      }
    }
  }

  loop = (now: number) => {
    const rawDt = (now - this.lastTime) / 1000;
    const dt = Math.min(rawDt, 1 / 30);
    this.lastTime = now;

    this.update(dt);
    this.render();

    clearFrameInput(this.input);
    this.rafId = requestAnimationFrame(this.loop);
  };

  update(dt: number) {
    const s = this.state;
    s.time += dt;

    if (!s.gameStarted) return;
    if (s.gameOver) return;

    if (s.screenShake > 0) {
      s.screenShake -= s.screenShakeDecay * dt;
      if (s.screenShake < 0) s.screenShake = 0;
    }

    if (s.comboTimer > 0) {
      s.comboTimer -= dt;
      if (s.comboTimer <= 0) {
        s.combo = 0;
        s.comboMultiplier = 1;
      }
    }

    updatePlayer(s, this.input, dt, this);
    this.weaponManager.update(s, this.input, dt, this);

    for (let i = s.enemies.length - 1; i >= 0; i--) {
      updateEnemy(s, s.enemies[i], dt, this);
    }

    for (let i = s.projectiles.length - 1; i >= 0; i--) {
      updateProjectile(s, s.projectiles[i], dt, this);
    }

    for (let i = s.pickups.length - 1; i >= 0; i--) {
      updatePickup(s, s.pickups[i], dt, this);
    }

    updateParticles(s, dt);
    resolveCollisions(s, this);

    s.enemies = s.enemies.filter(e => e.alive);
    s.projectiles = s.projectiles.filter(p => p.alive);
    s.pickups = s.pickups.filter(p => p.alive);

    updateWave(s, dt, this);
  }

  render() {
    const { ctx, state: s, width, height } = this;
    const cam = s.camera;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);

    this.starfield.render(width, height, cam, s.time);

    ctx.save();

    let shakeX = 0, shakeY = 0;
    if (s.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * s.screenShake * 2;
      shakeY = (Math.random() - 0.5) * s.screenShake * 2;
    }
    ctx.translate(-cam.x + width / 2 + shakeX, -cam.y + height / 2 + shakeY);

    if (s.gameStarted && !s.gameOver) {
      for (const p of s.pickups) this.pickupRenderer.render(p, s.time);
      for (const p of s.projectiles) this.projectileRenderer.render(p, s.time);
      for (const e of s.enemies) this.enemyRenderer.render(e, s.time);
      if (s.player.alive) this.playerRenderer.render(s.player, s.time);
      for (const p of s.particles) {
        if (p.alive) this.particleRenderer.render(p);
      }
    }

    ctx.restore();

    if (s.gameStarted) {
      this.hudRenderer.render(s, width, height, s.time);
    }

    if (!s.gameStarted) {
      this.renderTitleScreen(width, height);
    }

    if (s.gameOver) {
      this.renderGameOver(width, height);
    }
  }

  renderTitleScreen(w: number, h: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 5, 16, 0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.shadowColor = '#00aaff';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#00ddff';
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VOID STRIKER', w / 2, h / 2 - 60);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#88ccff';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText('WASD to move  |  Mouse to aim  |  Click to fire', w / 2, h / 2 + 10);
    ctx.fillText('Scroll / 1-3 to switch weapons', w / 2, h / 2 + 40);

    const pulse = 0.5 + 0.5 * Math.sin(this.state.time * 3);
    ctx.fillStyle = `rgba(0, 220, 255, ${0.5 + pulse * 0.5})`;
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.fillText('[ CLICK TO START ]', w / 2, h / 2 + 110);
    ctx.restore();
  }

  renderGameOver(w: number, h: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 5, 16, 0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ff3366';
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 80);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffcc00';
    ctx.font = '32px "Courier New", monospace';
    ctx.fillText(`SCORE: ${this.state.score}`, w / 2, h / 2 - 10);

    ctx.fillStyle = '#aaccff';
    ctx.font = '22px "Courier New", monospace';
    ctx.fillText(`Wave Reached: ${this.state.wave}`, w / 2, h / 2 + 30);

    const pulse = 0.5 + 0.5 * Math.sin(this.state.time * 3);
    ctx.fillStyle = `rgba(0, 220, 255, ${0.5 + pulse * 0.5})`;
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.fillText('[ CLICK TO RESTART ]', w / 2, h / 2 + 100);
    ctx.restore();
  }
}
