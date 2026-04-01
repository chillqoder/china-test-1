import { Enemy } from '../entities/Enemy';
import { Pickup } from '../entities/Pickup';
import { GAME_WIDTH, GAME_HEIGHT, WAVE_CONFIG, ENEMIES } from '../constants';
import type { EnemyType, WeaponType, PickupType } from '../weapons/types';

export class Spawner {
  currentWave: number;
  enemiesRemaining: number;
  enemiesSpawned: number;
  enemiesToSpawn: number;
  lastSpawnTime: number;
  spawnDelay: number;
  waveInProgress: boolean;

  constructor() {
    this.currentWave = 0;
    this.enemiesRemaining = 0;
    this.enemiesSpawned = 0;
    this.enemiesToSpawn = 0;
    this.lastSpawnTime = 0;
    this.spawnDelay = WAVE_CONFIG.spawnDelay;
    this.waveInProgress = false;
  }

  startNextWave(): void {
    this.currentWave++;
    this.enemiesToSpawn = WAVE_CONFIG.baseEnemies + (this.currentWave - 1) * WAVE_CONFIG.enemiesPerWave;
    this.enemiesSpawned = 0;
    this.enemiesRemaining = this.enemiesToSpawn;
    this.waveInProgress = true;
    this.lastSpawnTime = Date.now();
  }

  update(currentTime: number): boolean {
    if (!this.waveInProgress) return false;
    if (this.enemiesSpawned >= this.enemiesToSpawn) return false;
    
    if (currentTime - this.lastSpawnTime > this.spawnDelay) {
      this.lastSpawnTime = currentTime;
      return true;
    }
    return false;
  }

  spawnEnemy(): Enemy | null {
    if (this.enemiesSpawned >= this.enemiesToSpawn) return null;
    
    this.enemiesSpawned++;
    
    const type = this.getRandomEnemyType();
    const { x, y } = this.getSpawnPosition();
    return new Enemy(x, y, type);
  }

  private getRandomEnemyType(): EnemyType {
    const wave = this.currentWave;
    
    const baseTypes: EnemyType[] = ['scout', 'fighter', 'swarm'];
    let pool = [...baseTypes];
    
    if (wave >= 2) pool.push('gunship');
    if (wave >= 3) pool.push('kamikaze');
    if (wave >= 4) pool.push('sniper');
    
    const eliteChance = WAVE_CONFIG.eliteChance + (wave - 1) * 0.02;
    if (Math.random() < eliteChance && wave >= 3) {
      return 'elite';
    }
    
    if (wave >= 8 && Math.random() < 0.3) {
      return 'elite';
    }
    
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private getSpawnPosition(): { x: number; y: number } {
    const side = Math.floor(Math.random() * 4);
    const margin = 50;
    
    switch (side) {
      case 0:
        return { x: Math.random() * GAME_WIDTH, y: -margin };
      case 1:
        return { x: GAME_WIDTH + margin, y: Math.random() * GAME_HEIGHT };
      case 2:
        return { x: Math.random() * GAME_WIDTH, y: GAME_HEIGHT + margin };
      case 3:
        return { x: -margin, y: Math.random() * GAME_HEIGHT };
      default:
        return { x: -margin, y: -margin };
    }
  }

  enemyKilled(): void {
    this.enemiesRemaining--;
    if (this.enemiesRemaining <= 0 && this.enemiesSpawned >= this.enemiesToSpawn) {
      this.waveInProgress = false;
    }
  }

  isWaveComplete(): boolean {
    return !this.waveInProgress && this.enemiesRemaining <= 0;
  }

  getPickupForEnemy(enemy: Enemy): Pickup | null {
    if (Math.random() > 0.15) return null;
    
    const x = enemy.x;
    const y = enemy.y;
    
    if (enemy.type === 'elite' || Math.random() < 0.05) {
      const weapons: WeaponType[] = ['spread', 'railgun', 'missile', 'emp', 'plasma'];
      const weapon = weapons[Math.floor(Math.random() * weapons.length)];
      return new Pickup(x, y, weapon);
    }
    
    if (Math.random() < 0.3) {
      return new Pickup(x, y, 'repair');
    }
    
    const weapons: WeaponType[] = ['spread', 'railgun', 'missile'];
    const weapon = weapons[Math.floor(Math.random() * weapons.length)];
    return new Pickup(x, y, weapon);
  }
}
