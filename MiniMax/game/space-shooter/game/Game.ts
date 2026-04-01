import * as PIXI from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, WEAPONS, COLORS } from './constants';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Projectile } from './entities/Projectile';
import { Pickup } from './entities/Pickup';
import { Explosion } from './entities/Particle';
import { Background } from './renderer/Background';
import { InputManager } from './systems/InputManager';
import { CollisionSystem } from './systems/CollisionSystem';
import { Spawner } from './systems/Spawner';
import type { WeaponType } from './weapons/types';

export class Game {
  app!: PIXI.Application;
  player!: Player;
  enemies: Enemy[];
  playerProjectiles: Projectile[];
  enemyProjectiles: Projectile[];
  pickups: Pickup[];
  explosions: Explosion[];
  background!: Background;
  inputManager!: InputManager;
  collisionSystem!: CollisionSystem;
  spawner!: Spawner;
  gameContainer!: PIXI.Container;
  uiContainer!: PIXI.Container;
  
  score: number;
  combo: number;
  comboTimer: number;
  maxComboTimer: number;
  wave: number;
  gameOver: boolean;
  lastTime: number;

  constructor() {
    this.app = new PIXI.Application();
    this.enemies = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.pickups = [];
    this.explosions = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxComboTimer = 120;
    this.wave = 0;
    this.gameOver = false;
    this.lastTime = 0;
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    await this.app.init({
      canvas,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: COLORS.background,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    this.gameContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.uiContainer);

    this.background = new Background();
    this.gameContainer.addChild(this.background.getContainer());

    this.player = new Player(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.gameContainer.addChild(this.player.sprite);

    this.inputManager = new InputManager();
    this.inputManager.init(canvas);
    this.inputManager.onWeaponSwitch((index) => {
      this.player.switchWeapon(index);
    });

    this.collisionSystem = new CollisionSystem();
    this.spawner = new Spawner();

    this.setupUI();
  }

  private setupUI(): void {
    this.uiContainer.removeChildren();
  }

  private createHUD(): void {
    const hud = new PIXI.Container();
    hud.label = 'hud';
    this.uiContainer.removeChildren();
    this.uiContainer.addChild(hud);

    const hullBarBg = new PIXI.Graphics();
    hullBarBg.roundRect(20, GAME_HEIGHT - 50, 200, 20, 5);
    hullBarBg.fill({ color: 0x222233 });
    hud.addChild(hullBarBg);

    const hullBarFill = new PIXI.Graphics();
    const hullPercent = this.player.hull / this.player.maxHull;
    hullBarFill.roundRect(22, GAME_HEIGHT - 48, 196 * hullPercent, 16, 3);
    const hullColor = hullPercent > 0.5 ? 0x00ff00 : hullPercent > 0.25 ? 0xffff00 : 0xff0000;
    hullBarFill.fill({ color: hullColor });
    hud.addChild(hullBarFill);

    const hullLabel = new PIXI.Text({
      text: 'HULL',
      style: { fontSize: 12, fill: 0x888888, fontFamily: 'monospace' }
    });
    hullLabel.x = 20;
    hullLabel.y = GAME_HEIGHT - 70;
    hud.addChild(hullLabel);

    const shieldRing = new PIXI.Graphics();
    shieldRing.circle(0, 0, PLAYER.size * 0.8);
    shieldRing.stroke({ color: COLORS.shield, width: 2, alpha: this.player.shield / this.player.maxShield });
    this.player.sprite.addChild(shieldRing);

    const weaponContainer = new PIXI.Container();
    weaponContainer.x = GAME_WIDTH - 20;
    weaponContainer.y = GAME_HEIGHT - 50;
    hud.addChild(weaponContainer);

    const weaponBg = new PIXI.Graphics();
    weaponBg.roundRect(-150, 0, 150, 40, 5);
    weaponBg.fill({ color: 0x222233, alpha: 0.8 });
    weaponContainer.addChild(weaponBg);

    const weaponText = new PIXI.Text({
      text: this.player.currentWeapon.toUpperCase(),
      style: { fontSize: 16, fill: 0xffffff, fontFamily: 'monospace' }
    });
    weaponText.x = -140;
    weaponText.y = 5;
    weaponContainer.addChild(weaponText);

    const scoreText = new PIXI.Text({
      text: `${this.score.toLocaleString()} | WAVE ${this.wave} | x${this.combo}`,
      style: { 
        fontSize: 24, 
        fill: 0xffffff, 
        fontFamily: 'monospace',
        dropShadow: { color: 0x000000, blur: 4, distance: 2 }
      }
    });
    scoreText.anchor.set(0.5, 0);
    scoreText.x = GAME_WIDTH / 2;
    scoreText.y = 20;
    hud.addChild(scoreText);

    const waveText = new PIXI.Text({
      text: `WAVE ${this.wave}`,
      style: { fontSize: 48, fill: 0xffffff, fontFamily: 'monospace', fontWeight: 'bold' }
    });
    waveText.anchor.set(0.5);
    waveText.x = GAME_WIDTH / 2;
    waveText.y = GAME_HEIGHT / 2;
    waveText.alpha = 0;
    waveText.label = 'waveText';
    hud.addChild(waveText);
  }

  update(currentTime: number): void {
    const delta = Math.min((currentTime - this.lastTime) / 16.67, 3);
    this.lastTime = currentTime;

    if (this.gameOver) return;

    const movement = this.inputManager.getMovement();
    this.player.vx += movement.x * PLAYER.acceleration * delta;
    this.player.vy += movement.y * PLAYER.acceleration * delta;

    const scroll = this.inputManager.consumeScroll();
    if (scroll > 0) {
      this.player.switchWeapon((this.player.currentWeaponIndex + 1) % this.player.weapons.length);
    }

    this.player.update(delta, this.inputManager.mouseX, this.inputManager.mouseY, currentTime);

    if ((this.inputManager.mouseDown || this.inputManager.isKeyDown('Space')) && !this.gameOver) {
      this.tryFire(currentTime);
    }

    if (this.spawner.update(currentTime)) {
      const enemy = this.spawner.spawnEnemy();
      if (enemy) {
        this.enemies.push(enemy);
        this.gameContainer.addChild(enemy.sprite);
      }
    }

    if (this.spawner.isWaveComplete() && this.enemies.length === 0) {
      this.spawner.startNextWave();
      this.wave = this.spawner.currentWave;
      this.showWaveText();
    }

    for (const enemy of this.enemies) {
      enemy.update(delta, this.player, currentTime);
    }

    for (const proj of this.playerProjectiles) {
      proj.update(delta);
    }

    for (const proj of this.enemyProjectiles) {
      proj.update(delta);
    }

    for (const pickup of this.pickups) {
      pickup.update(delta, currentTime);
    }

    for (const explosion of this.explosions) {
      explosion.update(delta);
    }

    this.background.update(delta, this.player.vx, this.player.vy, currentTime);

    this.handleCollisions(currentTime);
    this.cleanupDeadEntities();

    this.createHUD();
  }

  private tryFire(currentTime: number): void {
    const weapon = this.player.currentWeapon;
    const config = WEAPONS[weapon as WeaponType];
    
    if (currentTime - this.player.lastFireTime < config.fireRate) return;
    
    this.player.lastFireTime = currentTime;
    
    switch (weapon) {
      case 'laser':
        this.fireLaser();
        break;
      case 'spread':
        this.fireSpread();
        break;
      case 'railgun':
        this.fireRailgun();
        break;
      case 'missile':
        this.fireMissile();
        break;
      case 'emp':
        this.fireEMP();
        break;
      case 'plasma':
        this.firePlasma();
        break;
    }
  }

  private fireLaser(): void {
    const angle = this.player.rotation - Math.PI / 2;
    const proj = new Projectile(
      this.player.x + Math.cos(angle) * 30,
      this.player.y + Math.sin(angle) * 30,
      angle,
      'laser',
      'player'
    );
    this.playerProjectiles.push(proj);
    this.gameContainer.addChild(proj.sprite);
  }

  private fireSpread(): void {
    const baseAngle = this.player.rotation - Math.PI / 2;
    const count = 5;
    const spread = Math.PI / 6;
    
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + spread * (i / (count - 1) - 0.5);
      const proj = new Projectile(
        this.player.x + Math.cos(baseAngle) * 30,
        this.player.y + Math.sin(baseAngle) * 30,
        angle,
        'spread',
        'player'
      );
      this.playerProjectiles.push(proj);
      this.gameContainer.addChild(proj.sprite);
    }
  }

  private fireRailgun(): void {
    const angle = this.player.rotation - Math.PI / 2;
    const proj = new Projectile(
      this.player.x + Math.cos(angle) * 30,
      this.player.y + Math.sin(angle) * 30,
      angle,
      'railgun',
      'player'
    );
    this.playerProjectiles.push(proj);
    this.gameContainer.addChild(proj.sprite);
    this.background.flash(0xffffff, 0.5);
  }

  private fireMissile(): void {
    const angle = this.player.rotation - Math.PI / 2;
    const proj = new Projectile(
      this.player.x + Math.cos(angle) * 25,
      this.player.y + Math.sin(angle) * 25,
      angle,
      'missile',
      'player',
      this.findNearestEnemy() ?? undefined
    );
    this.playerProjectiles.push(proj);
    this.gameContainer.addChild(proj.sprite);
  }

  private fireEMP(): void {
    const angle = this.player.rotation - Math.PI / 2;
    const proj = new Projectile(
      this.player.x,
      this.player.y,
      angle,
      'emp',
      'player'
    );
    this.playerProjectiles.push(proj);
    this.gameContainer.addChild(proj.sprite);
  }

  private firePlasma(): void {
    const angle = this.player.rotation - Math.PI / 2;
    const proj = new Projectile(
      this.player.x + Math.cos(angle) * 30,
      this.player.y + Math.sin(angle) * 30,
      angle,
      'plasma',
      'player'
    );
    this.playerProjectiles.push(proj);
    this.gameContainer.addChild(proj.sprite);
  }

  private findNearestEnemy(): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = Infinity;
    
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dist = this.player.distanceTo(enemy);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }
    
    return nearest;
  }

  private handleCollisions(currentTime: number): void {
    const result = this.collisionSystem.checkCollisions(
      this.player,
      this.enemies,
      this.playerProjectiles,
      this.enemyProjectiles,
      this.pickups
    );

    for (const enemy of result.playerHits) {
      this.player.takeDamage(enemy.damage, currentTime);
      if (enemy.type === 'kamikaze') {
        enemy.takeDamage(999);
        this.createExplosion(enemy.x, enemy.y, enemy.color);
      }
    }

    for (const { enemy, projectile } of result.enemyHits) {
      enemy.takeDamage(projectile.damage);
      projectile.alive = false;
      
      if (!enemy.alive) {
        this.createExplosion(enemy.x, enemy.y, enemy.color);
        this.score += enemy.score * this.combo;
        this.comboTimer = this.maxComboTimer;
        this.spawner.enemyKilled();
        
        const pickup = this.spawner.getPickupForEnemy(enemy);
        if (pickup) {
          this.pickups.push(pickup);
          this.gameContainer.addChild(pickup.sprite);
        }
      }
    }

    for (const { projectile, target } of result.projectileHits) {
      if (target === this.player) {
        this.player.takeDamage(projectile.damage, currentTime);
      } else if (target instanceof Enemy) {
        target.takeDamage(projectile.damage);
      }
      projectile.alive = false;
    }

    for (const pickup of result.pickupHits) {
      pickup.alive = false;
      
      if (pickup.pickupType === 'repair') {
        this.player.heal(25);
      } else {
        this.player.addWeapon(pickup.pickupType as WeaponType);
      }
    }

    if (this.player.hull <= 0) {
      this.gameOver = true;
      this.showGameOver();
    }
  }

  private createExplosion(x: number, y: number, color: number): void {
    const explosion = new Explosion(x, y, color, 30);
    this.explosions.push(explosion);
    
    for (const p of explosion.particles) {
      this.gameContainer.addChild(p.sprite);
      p.sprite.x = p.x;
      p.sprite.y = p.y;
    }
  }

  private cleanupDeadEntities(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (!this.enemies[i].alive) {
        this.gameContainer.removeChild(this.enemies[i].sprite);
        this.enemies[i].destroy();
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const proj = this.playerProjectiles[i];
      if (!proj.alive || proj.isExpired()) {
        this.gameContainer.removeChild(proj.sprite);
        proj.destroy();
        this.playerProjectiles.splice(i, 1);
      }
    }

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      if (!proj.alive || proj.isExpired()) {
        this.gameContainer.removeChild(proj.sprite);
        proj.destroy();
        this.enemyProjectiles.splice(i, 1);
      }
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      if (!this.pickups[i].alive) {
        this.gameContainer.removeChild(this.pickups[i].sprite);
        this.pickups[i].destroy();
        this.pickups.splice(i, 1);
      }
    }

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      if (!this.explosions[i].alive) {
        for (const p of this.explosions[i].particles) {
          this.gameContainer.removeChild(p.sprite);
        }
        this.explosions[i].destroy();
        this.explosions.splice(i, 1);
      }
    }
  }

  private showWaveText(): void {
    const hud = this.uiContainer.getChildByLabel('hud') as PIXI.Container;
    if (!hud) return;
    
    const waveText = hud.getChildByLabel('waveText') as PIXI.Text;
    if (!waveText) return;
    
    waveText.alpha = 1;
    
    setTimeout(() => {
      const fade = setInterval(() => {
        waveText.alpha -= 0.05;
        if (waveText.alpha <= 0) {
          clearInterval(fade);
        }
      }, 50);
    }, 1500);
  }

  private showGameOver(): void {
    this.uiContainer.removeChildren();
    
    const overlay = new PIXI.Container();
    this.uiContainer.addChild(overlay);
    
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    overlay.addChild(bg);
    
    const gameOverText = new PIXI.Text({
      text: 'GAME OVER',
      style: { fontSize: 72, fill: 0xff0000, fontFamily: 'monospace', fontWeight: 'bold' }
    });
    gameOverText.anchor.set(0.5);
    gameOverText.x = GAME_WIDTH / 2;
    gameOverText.y = GAME_HEIGHT / 2 - 100;
    overlay.addChild(gameOverText);
    
    const scoreText = new PIXI.Text({
      text: `Final Score: ${this.score.toLocaleString()}`,
      style: { fontSize: 36, fill: 0xffffff, fontFamily: 'monospace' }
    });
    scoreText.anchor.set(0.5);
    scoreText.x = GAME_WIDTH / 2;
    scoreText.y = GAME_HEIGHT / 2;
    overlay.addChild(scoreText);
    
    const waveText = new PIXI.Text({
      text: `Waves Survived: ${this.wave}`,
      style: { fontSize: 24, fill: 0x888888, fontFamily: 'monospace' }
    });
    waveText.anchor.set(0.5);
    waveText.x = GAME_WIDTH / 2;
    waveText.y = GAME_HEIGHT / 2 + 50;
    overlay.addChild(waveText);
    
    const restartText = new PIXI.Text({
      text: 'Press SPACE or Click to Restart',
      style: { fontSize: 20, fill: 0x00ff00, fontFamily: 'monospace' }
    });
    restartText.anchor.set(0.5);
    restartText.x = GAME_WIDTH / 2;
    restartText.y = GAME_HEIGHT / 2 + 120;
    overlay.addChild(restartText);
  }

  restart(): void {
    this.uiContainer.removeChildren();
    this.enemies = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.pickups = [];
    this.explosions = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.wave = 0;
    this.gameOver = false;

    this.gameContainer.removeChildren();
    this.gameContainer.addChild(this.background.getContainer());
    
    this.player = new Player(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.gameContainer.addChild(this.player.sprite);
    
    this.spawner = new Spawner();
    this.spawner.startNextWave();
    this.wave = this.spawner.currentWave;
  }
}
