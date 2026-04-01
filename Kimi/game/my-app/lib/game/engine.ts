import { GameState, Vector2, Player, Enemy, Projectile, Particle, Pickup, Star, Nebula } from './types';
import { GAME_CONFIG, ENEMY_CONFIGS, WEAPON_CONFIGS, WAVE_CONFIGS, COLORS, STAR_LAYERS, STARS_PER_LAYER } from './constants';
import { createPlayer, updatePlayer, playerShoot, switchWeapon, applyDamageToPlayer, regenerateShield } from './systems/player';
import { createEnemy, updateEnemy, enemyShoot, getSpawnPosition } from './systems/enemy';
import { updateProjectile, createProjectile } from './systems/projectile';
import { createParticle, updateParticle, createExplosion, createExhaust, createSparks } from './systems/particles';
import { createPickup } from './systems/pickup';
import { checkCollisions } from './systems/collision';
import { generateId, distance, normalize, lerp, randomRange } from './utils';

export function initGame(canvasWidth: number, canvasHeight: number): GameState {
  const stars: Star[] = [];
  const nebulae: Nebula[] = [];
  
  // Generate starfield layers
  for (let layer = 0; layer < STAR_LAYERS; layer++) {
    const speed = 0.2 + layer * 0.3;
    const brightness = 0.3 + layer * 0.2;
    for (let i = 0; i < STARS_PER_LAYER; i++) {
      stars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: 0.5 + layer * 0.5 + Math.random() * 0.5,
        speed: speed,
        brightness: brightness + Math.random() * 0.3,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }
  
  // Generate nebulae
  const nebulaColors = ['#4422aa', '#2244aa', '#aa2244', '#44aa88'];
  for (let i = 0; i < 4; i++) {
    nebulae.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      radius: 200 + Math.random() * 300,
      color: nebulaColors[i],
      opacity: 0.1 + Math.random() * 0.15,
      drift: { x: (Math.random() - 0.5) * 0.2, y: (Math.random() - 0.5) * 0.2 },
    });
  }
  
  return {
    player: createPlayer(canvasWidth / 2, canvasHeight / 2),
    enemies: [],
    projectiles: [],
    particles: [],
    pickups: [],
    stars,
    nebulae,
    score: 0,
    wave: 1,
    combo: 1,
    comboTimer: 0,
    gameOver: false,
    paused: false,
    keys: new Set(),
    mouse: { x: canvasWidth / 2, y: canvasHeight / 2 },
    mouseDown: false,
    canvasSize: { x: canvasWidth, y: canvasHeight },
    waveInProgress: false,
    waveTimer: GAME_CONFIG.WAVE_DELAY,
    enemiesToSpawn: 0,
  };
}

export function updateGame(state: GameState, deltaTime: number): GameState {
  if (state.gameOver || state.paused) return state;
  
  const now = Date.now();
  const dt = deltaTime / 16.67; // Normalize to ~60fps
  
  // Update player
  updatePlayer(state.player, state.keys, state.mouse, state.canvasSize, dt);
  regenerateShield(state.player, now);
  
  // Player shooting
  if (state.mouseDown && now - state.player.lastShot > WEAPON_CONFIGS[state.player.weapons[state.player.currentWeaponIndex].type].cooldown) {
    const newProjectiles = playerShoot(state.player);
    state.projectiles.push(...newProjectiles);
  }
  
  // Update wave system
  updateWaveSystem(state, now, dt);
  
  // Update enemies
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    updateEnemy(enemy, state.player, dt);
    
    // Enemy shooting
    const config = ENEMY_CONFIGS[enemy.type];
    if (config.fireRate > 0 && now - enemy.lastShot > config.fireRate) {
      const projectile = enemyShoot(enemy, state.player);
      if (projectile) state.projectiles.push(projectile);
    }
    
    // Remove dead enemies
    if (enemy.hp <= 0) {
      createExplosion(state, enemy.position.x, enemy.position.y, config.color, enemy.elite ? 30 : 15);
      
      // Drop pickup
      if (Math.random() < 0.15 || enemy.elite) {
        const pickupType = Math.random() < 0.6 ? 'weapon' : (Math.random() < 0.5 ? 'repair' : 'shield');
        const weaponType = pickupType === 'weapon' 
          ? (Object.keys(WEAPON_CONFIGS) as Array<keyof typeof WEAPON_CONFIGS>).filter(w => w !== 'laser')[Math.floor(Math.random() * 5)]
          : undefined;
        state.pickups.push(createPickup(enemy.position.x, enemy.position.y, pickupType, weaponType));
      }
      
      // Update score and combo
      const baseScore = config.score * (enemy.elite ? 2 : 1);
      state.score += baseScore * state.combo;
      state.comboTimer = GAME_CONFIG.COMBO_DURATION;
      
      state.enemies.splice(i, 1);
    }
  }
  
  // Update projectiles
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const projectile = state.projectiles[i];
    updateProjectile(projectile, state.player.position, dt);
    
    if (projectile.lifetime <= 0 || 
        projectile.position.x < -100 || projectile.position.x > state.canvasSize.x + 100 ||
        projectile.position.y < -100 || projectile.position.y > state.canvasSize.y + 100) {
      state.projectiles.splice(i, 1);
    }
  }
  
  // Update particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const particle = state.particles[i];
    updateParticle(particle, dt);
    if (particle.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
  
  // Update pickups
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const pickup = state.pickups[i];
    pickup.pulse += dt * 0.1;
    pickup.lifetime -= deltaTime;
    if (pickup.lifetime <= 0) {
      state.pickups.splice(i, 1);
    }
  }
  
  // Update combo
  if (state.comboTimer > 0) {
    state.comboTimer -= deltaTime;
    if (state.comboTimer <= 0) {
      state.combo = 1;
    }
  }
  
  // Update stars (parallax)
  for (const star of state.stars) {
    star.y += star.speed * dt;
    star.twinkle += dt * 0.1;
    if (star.y > state.canvasSize.y) {
      star.y = 0;
      star.x = Math.random() * state.canvasSize.x;
    }
  }
  
  // Update nebulae
  for (const nebula of state.nebulae) {
    nebula.x += nebula.drift.x * dt;
    nebula.y += nebula.drift.y * dt;
    if (nebula.x < -nebula.radius) nebula.x = state.canvasSize.x + nebula.radius;
    if (nebula.x > state.canvasSize.x + nebula.radius) nebula.x = -nebula.radius;
    if (nebula.y < -nebula.radius) nebula.y = state.canvasSize.y + nebula.radius;
    if (nebula.y > state.canvasSize.y + nebula.radius) nebula.y = -nebula.radius;
  }
  
  // Check collisions
  checkCollisions(state, now);
  
  // Check game over
  if (state.player.hp <= 0) {
    state.gameOver = true;
  }
  
  return state;
}

function updateWaveSystem(state: GameState, now: number, dt: number): void {
  if (state.waveInProgress) {
    if (state.enemies.length === 0 && state.enemiesToSpawn === 0) {
      state.waveInProgress = false;
      state.waveTimer = GAME_CONFIG.WAVE_DELAY;
      state.wave++;
    }
  } else {
    state.waveTimer -= dt * 16.67;
    if (state.waveTimer <= 0) {
      startWave(state);
    }
  }
  
  // Spawn enemies gradually during wave
  if (state.waveInProgress && state.enemiesToSpawn > 0) {
    if (Math.random() < 0.02) {
      spawnEnemy(state);
      state.enemiesToSpawn--;
    }
  }
}

function startWave(state: GameState): void {
  state.waveInProgress = true;
  const waveConfig = WAVE_CONFIGS[Math.min(state.wave - 1, WAVE_CONFIGS.length - 1)];
  
  state.enemiesToSpawn = waveConfig.enemies.reduce((sum, e) => sum + e.count, 0);
}

function spawnEnemy(state: GameState): void {
  const waveConfig = WAVE_CONFIGS[Math.min(state.wave - 1, WAVE_CONFIGS.length - 1)];
  const availableTypes = waveConfig.enemies.filter(e => e.count > 0);
  
  if (availableTypes.length === 0) return;
  
  const typeConfig = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  typeConfig.count--;
  
  const spawnPos = getSpawnPosition(state.canvasSize, state.player.position);
  const isElite = Math.random() < waveConfig.eliteChance;
  
  state.enemies.push(createEnemy(spawnPos.x, spawnPos.y, typeConfig.type as any, isElite));
}

export function handleKeyDown(state: GameState, key: string): void {
  state.keys.add(key.toLowerCase());
  
  // Weapon switching
  if (key >= '1' && key <= '3') {
    const index = parseInt(key) - 1;
    switchWeapon(state.player, index);
  }
}

export function handleKeyUp(state: GameState, key: string): void {
  state.keys.delete(key.toLowerCase());
}

export function handleMouseMove(state: GameState, x: number, y: number): void {
  state.mouse.x = x;
  state.mouse.y = y;
}

export function handleMouseDown(state: GameState, down: boolean): void {
  state.mouseDown = down;
}

export function handleScroll(state: GameState, delta: number): void {
  const newIndex = state.player.currentWeaponIndex + (delta > 0 ? 1 : -1);
  const clampedIndex = Math.max(0, Math.min(newIndex, state.player.weapons.length - 1));
  switchWeapon(state.player, clampedIndex);
}

export function restartGame(state: GameState): GameState {
  return initGame(state.canvasSize.x, state.canvasSize.y);
}
