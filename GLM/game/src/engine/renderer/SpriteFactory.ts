import { EnemyType } from '../types';

interface SpriteCache {
  player: Map<string, HTMLCanvasElement>;
  enemies: Map<string, HTMLCanvasElement>;
}

export class SpriteFactory {
  private ctx: CanvasRenderingContext2D;
  private cache: SpriteCache;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.cache = { player: new Map(), enemies: new Map() };
    this.buildAll();
  }

  private createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d')!;
    return [c, cx];
  }

  private drawPlayerShip(cx: CanvasRenderingContext2D, w: number, h: number, damageLevel: string) {
    cx.save();
    cx.translate(w / 2, h / 2);

    cx.shadowColor = '#0088ff';
    cx.shadowBlur = 8;

    cx.fillStyle = '#2a3a5a';
    cx.strokeStyle = '#5588bb';
    cx.lineWidth = 1.5;

    cx.beginPath();
    cx.moveTo(0, -32);
    cx.lineTo(-8, -20);
    cx.lineTo(-12, -10);
    cx.lineTo(-28, 8);
    cx.lineTo(-30, 20);
    cx.lineTo(-22, 24);
    cx.lineTo(-10, 18);
    cx.lineTo(-6, 28);
    cx.lineTo(0, 30);
    cx.lineTo(6, 28);
    cx.lineTo(10, 18);
    cx.lineTo(22, 24);
    cx.lineTo(30, 20);
    cx.lineTo(28, 8);
    cx.lineTo(12, -10);
    cx.lineTo(8, -20);
    cx.closePath();
    cx.fill();
    cx.stroke();

    cx.fillStyle = '#3a5a8a';
    cx.beginPath();
    cx.moveTo(0, -28);
    cx.lineTo(-6, -15);
    cx.lineTo(-8, 0);
    cx.lineTo(-5, 15);
    cx.lineTo(0, 18);
    cx.lineTo(5, 15);
    cx.lineTo(8, 0);
    cx.lineTo(6, -15);
    cx.closePath();
    cx.fill();

    cx.shadowBlur = 4;
    cx.fillStyle = '#44aaff';
    cx.beginPath();
    cx.ellipse(0, -8, 3, 8, 0, 0, Math.PI * 2);
    cx.fill();

    cx.shadowColor = '#ff4400';
    cx.shadowBlur = 6;
    cx.fillStyle = '#ff6622';
    cx.beginPath();
    cx.ellipse(-15, 22, 4, 3, 0, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.ellipse(15, 22, 4, 3, 0, 0, Math.PI * 2);
    cx.fill();

    if (damageLevel !== 'none') {
      cx.shadowBlur = 0;
      cx.globalAlpha = 0.6;

      if (damageLevel === 'minor' || damageLevel === 'moderate' || damageLevel === 'heavy' || damageLevel === 'critical') {
        cx.strokeStyle = '#333';
        cx.lineWidth = 1;
        cx.beginPath();
        cx.moveTo(-5, -15);
        cx.lineTo(-10, 5);
        cx.stroke();
        cx.beginPath();
        cx.moveTo(8, -10);
        cx.lineTo(15, 10);
        cx.stroke();
      }

      if (damageLevel === 'moderate' || damageLevel === 'heavy' || damageLevel === 'critical') {
        cx.fillStyle = '#ff880066';
        cx.beginPath();
        cx.arc(-12, 8, 5, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#ff440044';
        cx.beginPath();
        cx.arc(10, 15, 4, 0, Math.PI * 2);
        cx.fill();
      }

      if (damageLevel === 'heavy' || damageLevel === 'critical') {
        cx.fillStyle = '#222';
        cx.beginPath();
        cx.moveTo(20, 10);
        cx.lineTo(28, 5);
        cx.lineTo(26, 20);
        cx.lineTo(18, 18);
        cx.closePath();
        cx.fill();
      }

      if (damageLevel === 'critical') {
        cx.strokeStyle = '#ff2200';
        cx.lineWidth = 1.5;
        cx.beginPath();
        cx.moveTo(-20, -5);
        cx.lineTo(-8, 12);
        cx.lineTo(5, -3);
        cx.stroke();
        cx.fillStyle = '#ff000044';
        cx.beginPath();
        cx.arc(0, 5, 10, 0, Math.PI * 2);
        cx.fill();
      }

      cx.globalAlpha = 1;
    }

    cx.restore();
  }

  buildAll() {
    const levels = ['none', 'minor', 'moderate', 'heavy', 'critical'];
    for (const level of levels) {
      const [c, cx] = this.createCanvas(80, 80);
      this.drawPlayerShip(cx, 80, 80, level);
      this.cache.player.set(level, c);
    }

    const enemyTypes: EnemyType[] = ['scout', 'fighter', 'gunship', 'kamikaze', 'sniper', 'swarm', 'elite'];
    for (const type of enemyTypes) {
      const [c, cx] = this.createCanvas(80, 80);
      this.drawEnemyShip(cx, 80, 80, type);
      this.cache.enemies.set(type, c);
    }
  }

  private drawEnemyShip(cx: CanvasRenderingContext2D, w: number, h: number, type: EnemyType) {
    cx.save();
    cx.translate(w / 2, h / 2);

    const configs: Record<EnemyType, { fill: string; stroke: string; glow: string; shape: () => void }> = {
      scout: {
        fill: '#1a3a1a',
        stroke: '#44ff44',
        glow: '#22cc22',
        shape: () => {
          cx.beginPath();
          cx.moveTo(0, -12);
          cx.lineTo(-10, 10);
          cx.lineTo(0, 6);
          cx.lineTo(10, 10);
          cx.closePath();
          cx.fill();
          cx.stroke();
        },
      },
      fighter: {
        fill: '#3a2a10',
        stroke: '#ffaa00',
        glow: '#cc8800',
        shape: () => {
          cx.beginPath();
          cx.moveTo(0, -16);
          cx.lineTo(-6, -8);
          cx.lineTo(-18, 4);
          cx.lineTo(-16, 12);
          cx.lineTo(-4, 8);
          cx.lineTo(0, 14);
          cx.lineTo(4, 8);
          cx.lineTo(16, 12);
          cx.lineTo(18, 4);
          cx.lineTo(6, -8);
          cx.closePath();
          cx.fill();
          cx.stroke();
        },
      },
      gunship: {
        fill: '#3a1a1a',
        stroke: '#ff4444',
        glow: '#cc2222',
        shape: () => {
          cx.beginPath();
          cx.moveTo(0, -22);
          cx.lineTo(-10, -14);
          cx.lineTo(-24, -6);
          cx.lineTo(-26, 10);
          cx.lineTo(-18, 18);
          cx.lineTo(-8, 14);
          cx.lineTo(0, 20);
          cx.lineTo(8, 14);
          cx.lineTo(18, 18);
          cx.lineTo(26, 10);
          cx.lineTo(24, -6);
          cx.lineTo(10, -14);
          cx.closePath();
          cx.fill();
          cx.stroke();
          cx.fillStyle = '#55111188';
          cx.beginPath();
          cx.arc(-18, 2, 5, 0, Math.PI * 2);
          cx.fill();
          cx.beginPath();
          cx.arc(18, 2, 5, 0, Math.PI * 2);
          cx.fill();
        },
      },
      kamikaze: {
        fill: '#3a3a10',
        stroke: '#ffff00',
        glow: '#cccc00',
        shape: () => {
          cx.beginPath();
          cx.moveTo(0, -8);
          cx.lineTo(-8, 6);
          cx.lineTo(-3, 4);
          cx.lineTo(0, 10);
          cx.lineTo(3, 4);
          cx.lineTo(8, 6);
          cx.closePath();
          cx.fill();
          cx.stroke();
          cx.shadowColor = '#ffff00';
          cx.shadowBlur = 10;
          cx.fillStyle = '#ff880088';
          cx.beginPath();
          cx.arc(0, -2, 3, 0, Math.PI * 2);
          cx.fill();
        },
      },
      sniper: {
        fill: '#102a3a',
        stroke: '#44aaff',
        glow: '#2288dd',
        shape: () => {
          cx.beginPath();
          cx.moveTo(0, -18);
          cx.lineTo(-5, -10);
          cx.lineTo(-8, 0);
          cx.lineTo(-14, 8);
          cx.lineTo(-8, 12);
          cx.lineTo(-3, 8);
          cx.lineTo(0, 16);
          cx.lineTo(3, 8);
          cx.lineTo(8, 12);
          cx.lineTo(14, 8);
          cx.lineTo(8, 0);
          cx.lineTo(5, -10);
          cx.closePath();
          cx.fill();
          cx.stroke();
          cx.shadowColor = '#44aaff';
          cx.shadowBlur = 6;
          cx.fillStyle = '#44aaff88';
          cx.beginPath();
          cx.ellipse(0, -8, 2, 6, 0, 0, Math.PI * 2);
          cx.fill();
        },
      },
      swarm: {
        fill: '#2a1a2a',
        stroke: '#ff88ff',
        glow: '#cc55cc',
        shape: () => {
          cx.beginPath();
          cx.moveTo(0, -6);
          cx.lineTo(-7, 6);
          cx.lineTo(0, 3);
          cx.lineTo(7, 6);
          cx.closePath();
          cx.fill();
          cx.stroke();
        },
      },
      elite: {
        fill: '#2a1a00',
        stroke: '#ff6600',
        glow: '#dd4400',
        shape: () => {
          cx.beginPath();
          cx.moveTo(0, -28);
          cx.lineTo(-12, -18);
          cx.lineTo(-20, -8);
          cx.lineTo(-32, 0);
          cx.lineTo(-28, 14);
          cx.lineTo(-16, 20);
          cx.lineTo(-8, 16);
          cx.lineTo(0, 26);
          cx.lineTo(8, 16);
          cx.lineTo(16, 20);
          cx.lineTo(28, 14);
          cx.lineTo(32, 0);
          cx.lineTo(20, -8);
          cx.lineTo(12, -18);
          cx.closePath();
          cx.fill();
          cx.stroke();

          cx.fillStyle = '#ff660044';
          cx.beginPath();
          cx.arc(-22, 8, 6, 0, Math.PI * 2);
          cx.fill();
          cx.beginPath();
          cx.arc(22, 8, 6, 0, Math.PI * 2);
          cx.fill();

          cx.shadowColor = '#ff6600';
          cx.shadowBlur = 8;
          cx.fillStyle = '#ffaa4488';
          cx.beginPath();
          cx.ellipse(0, -10, 4, 10, 0, 0, Math.PI * 2);
          cx.fill();
        },
      },
    };

    const cfg = configs[type];
    cx.shadowColor = cfg.glow;
    cx.shadowBlur = 6;
    cx.fillStyle = cfg.fill;
    cx.strokeStyle = cfg.stroke;
    cx.lineWidth = 1.5;
    cfg.shape();
    cx.restore();
  }

  getPlayerSprite(damageLevel: string): HTMLCanvasElement {
    return this.cache.player.get(damageLevel) || this.cache.player.get('none')!;
  }

  getEnemySprite(type: EnemyType): HTMLCanvasElement {
    return this.cache.enemies.get(type)!;
  }
}
