import { GameState, EnemyType, PickupType, WeaponType } from '../types';
import { MAX_ENEMIES, WAVE_DELAY, PICKUP_LIFETIME, PICKUP_RADIUS, ENEMY_DEFS, WEAPON_DEFS } from '../constants';
import { vec2, randRange, angleBetween, vecFromAngle } from '../math';
import { createEnemy } from '../entities/Enemy';
import { Game } from '../Game';

interface WaveDef {
  enemies: { type: EnemyType; count: number }[];
}

const DROPPABLE_WEAPONS: WeaponType[] = ['spread', 'railgun', 'missile', 'emp', 'plasma'];

export class WaveState {
  waveTimer: number = 2;
  enemiesRemaining: number = 0;
  spawnQueue: EnemyType[] = [];
  spawnTimer: number = 0;
  spawned: number = 0;
  totalToSpawn: number = 0;
}

let waveState = new WaveState();

export function resetWaveState() {
  waveState = new WaveState();
}

export function updateWave(state: GameState, dt: number, game: Game) {
  if (waveState.waveTimer > 0) {
    waveState.waveTimer -= dt;
    if (waveState.waveTimer <= 0) {
      state.wave++;
      startWave(state, game);
    }
    return;
  }

  if (waveState.spawnQueue.length > 0) {
    waveState.spawnTimer -= dt;
    if (waveState.spawnTimer <= 0) {
      const type = waveState.spawnQueue.shift()!;
      const angle = Math.random() * Math.PI * 2;
      const dist = 600 + Math.random() * 200;
      const spawnPos = vec2(
        state.player.pos.x + Math.cos(angle) * dist,
        state.player.pos.y + Math.sin(angle) * dist
      );
      spawnPos.x = Math.max(-2800, Math.min(2800, spawnPos.x));
      spawnPos.y = Math.max(-2800, Math.min(2800, spawnPos.y));

      const enemy = createEnemy(type, spawnPos, game.getNextId());
      state.enemies.push(enemy);
      waveState.spawnTimer = 0.3;
    }
    return;
  }

  const aliveEnemies = state.enemies.filter(e => e.alive).length;
  if (aliveEnemies === 0 && waveState.spawnQueue.length === 0) {
    waveState.waveTimer = WAVE_DELAY;
  }
}

function startWave(state: GameState, game: Game) {
  const wave = state.wave;
  waveState.spawnQueue = [];
  waveState.spawnTimer = 0;
  waveState.spawned = 0;

  const baseCount = 5 + wave * 3;
  const maxOnScreen = Math.min(MAX_ENEMIES, 15 + wave * 2);

  const enemyPool: EnemyType[] = [];

  enemyPool.push(...Array(Math.ceil(baseCount * 0.3)).fill('scout' as EnemyType));
  enemyPool.push(...Array(Math.ceil(baseCount * 0.25)).fill('fighter' as EnemyType));

  if (wave >= 2) enemyPool.push(...Array(Math.ceil(baseCount * 0.15)).fill('swarm' as EnemyType));
  if (wave >= 3) enemyPool.push(...Array(Math.ceil(baseCount * 0.1)).fill('kamikaze' as EnemyType));
  if (wave >= 3) enemyPool.push(...Array(Math.ceil(baseCount * 0.1)).fill('sniper' as EnemyType));
  if (wave >= 4) enemyPool.push(...Array(Math.ceil(baseCount * 0.08)).fill('gunship' as EnemyType));
  if (wave >= 5 && Math.random() < 0.3 + wave * 0.05) {
    enemyPool.push('elite');
  }

  waveState.spawnQueue = enemyPool;
  waveState.totalToSpawn = enemyPool.length;
}
