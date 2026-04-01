import { EnemyState } from '../types';
import { SpriteFactory } from './SpriteFactory';

export class EnemyRenderer {
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteFactory;

  constructor(ctx: CanvasRenderingContext2D, sprites: SpriteFactory) {
    this.ctx = ctx;
    this.sprites = sprites;
  }

  render(enemy: EnemyState, time: number) {
    const ctx = this.ctx;
    const { pos, angle, hp, maxHp, type, spawnAnimTimer, alive } = enemy;

    if (!alive) return;

    ctx.save();
    ctx.translate(pos.x, pos.y);

    if (spawnAnimTimer > 0) {
      const scale = 1 + Math.sin(spawnAnimTimer * 10) * 0.1;
      ctx.scale(scale, scale);
      ctx.globalAlpha = 0.5 + (1 - spawnAnimTimer / 0.5) * 0.5;
    }

    ctx.rotate(angle + Math.PI / 2);

    const sprite = this.sprites.getEnemySprite(type);
    const size = sprite.width;
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);

    ctx.restore();

    if (hp < maxHp) {
      this.drawHealthBar(ctx, pos, hp, maxHp, enemy.radius);
    }
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D, pos: { x: number; y: number }, hp: number, maxHp: number, radius: number) {
    const barWidth = radius * 2;
    const barHeight = 3;
    const y = pos.y - radius - 10;
    const pct = hp / maxHp;

    ctx.fillStyle = '#333';
    ctx.fillRect(pos.x - barWidth / 2, y, barWidth, barHeight);

    const color = pct > 0.5 ? '#44ff44' : pct > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillStyle = color;
    ctx.fillRect(pos.x - barWidth / 2, y, barWidth * pct, barHeight);
  }
}
