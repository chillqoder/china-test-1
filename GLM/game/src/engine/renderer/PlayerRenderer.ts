import { PlayerState, DamageLevel } from '../types';
import { SpriteFactory } from './SpriteFactory';
import { PLAYER_RADIUS } from '../constants';
import { vec2, vecFromAngle, randRange } from '../math';
import { Game } from '../Game';

export class PlayerRenderer {
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteFactory;

  constructor(ctx: CanvasRenderingContext2D, sprites: SpriteFactory) {
    this.ctx = ctx;
    this.sprites = sprites;
  }

  getDamageLevel(hp: number, maxHp: number): DamageLevel {
    const pct = hp / maxHp;
    if (pct > 0.75) return 'none';
    if (pct > 0.5) return 'minor';
    if (pct > 0.25) return 'moderate';
    if (pct > 0.1) return 'heavy';
    return 'critical';
  }

  render(player: PlayerState, time: number, game?: Game) {
    const ctx = this.ctx;
    const { pos, angle, hp, maxHp, shield, maxShield, invulnTimer } = player;

    if (invulnTimer > 0 && Math.floor(time * 20) % 2 === 0) return;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle + Math.PI / 2);

    const damageLevel = this.getDamageLevel(hp, maxHp);
    const sprite = this.sprites.getPlayerSprite(damageLevel);
    ctx.drawImage(sprite, -40, -40, 80, 80);

    this.drawEngineTrail(ctx, time, hp, maxHp);
    this.drawShield(ctx, shield, maxShield, time);

    ctx.restore();

    if (game && (damageLevel === 'moderate' || damageLevel === 'heavy' || damageLevel === 'critical')) {
      this.emitDamageSparks(player, game);
    }
  }

  private drawEngineTrail(ctx: CanvasRenderingContext2D, time: number, hp: number, maxHp: number) {
    const pct = hp / maxHp;
    const intensity = pct > 0.25 ? 1 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 15));
    const flicker = pct < 0.25 ? Math.random() * 0.3 : 0;

    ctx.save();
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 15 * intensity;

    for (const ox of [-15, 15]) {
      const len = (10 + Math.sin(time * 8 + ox) * 3) * intensity;
      const grad = ctx.createRadialGradient(ox, 26, 0, ox, 26 + len, len * 0.8);
      grad.addColorStop(0, `rgba(255, 200, 50, ${0.9 * intensity})`);
      grad.addColorStop(0.4, `rgba(255, 100, 20, ${0.6 * intensity})`);
      grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(ox - 6, 24, 12, len);
    }

    ctx.restore();
  }

  private drawShield(ctx: CanvasRenderingContext2D, shield: number, maxShield: number, time: number) {
    if (shield <= 0) return;
    const pct = shield / maxShield;
    const alpha = 0.15 + pct * 0.2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#44aaff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#44aaff';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([4, 8]);
    ctx.lineDashOffset = time * 30;
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private emitDamageSparks(player: PlayerState, game: Game) {
    const pct = player.hp / player.maxHp;
    const count = pct < 0.25 ? 3 : 1;

    for (let i = 0; i < count; i++) {
      if (Math.random() > 0.3) continue;
      const angle = Math.random() * Math.PI * 2;
      const dist = randRange(5, PLAYER_RADIUS);
      game.spawnParticle({
        pos: vec2(player.pos.x + Math.cos(angle) * dist, player.pos.y + Math.sin(angle) * dist),
        vel: vec2(randRange(-30, 30), randRange(-30, 30)),
        color: Math.random() > 0.5 ? '#ffaa00' : '#ff4400',
        alpha: 1,
        size: randRange(1, 3),
        lifetime: randRange(0.2, 0.5),
        maxLifetime: 0.5,
        decay: 1,
        glow: true,
      });
    }
  }
}
