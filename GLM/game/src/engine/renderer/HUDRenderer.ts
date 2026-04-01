import { GameState } from '../types';
import { WEAPON_DEFS } from '../constants';

export class HUDRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(state: GameState, width: number, height: number, time: number) {
    const ctx = this.ctx;
    const { player, score, wave, comboMultiplier, weapons, activeWeapon } = state;

    this.drawHullBar(ctx, 20, height - 50, player.hp, player.maxHp, time);
    this.drawShieldBar(ctx, 20, height - 70, player.shield, player.maxShield, time);
    this.drawWeaponSlots(ctx, width - 200, height - 60, weapons, activeWeapon, time);
    this.drawScoreDisplay(ctx, width / 2, 30, score, wave, comboMultiplier, time);
  }

  private drawHullBar(ctx: CanvasRenderingContext2D, x: number, y: number, hp: number, maxHp: number, time: number) {
    const barWidth = 200;
    const barHeight = 16;
    const pct = hp / maxHp;

    ctx.save();

    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 4;

    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.strokeStyle = '#335566';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);

    for (let i = 0; i < 10; i++) {
      const segPct = i / 10;
      if (segPct < pct) {
        const segColor = pct > 0.5 ? '#44ff44' : pct > 0.25 ? '#ffaa00' : '#ff4444';
        ctx.fillStyle = segColor;
        ctx.fillRect(x + 2 + i * (barWidth / 10 - 0.5), y + 2, barWidth / 10 - 3, barHeight - 4);
      }
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#88ccff';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HULL ${Math.ceil(hp)}/${maxHp}`, x, y - 4);

    ctx.restore();
  }

  private drawShieldBar(ctx: CanvasRenderingContext2D, x: number, y: number, shield: number, maxShield: number, time: number) {
    const barWidth = 200;
    const barHeight = 8;
    const pct = shield / maxShield;

    ctx.save();

    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(x, y, barWidth, barHeight);

    if (pct > 0) {
      ctx.shadowColor = '#44aaff';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#44aaff';
      ctx.fillRect(x, y, barWidth * pct, barHeight);
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#6688aa';
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SHIELD ${Math.ceil(shield)}`, x, y - 3);

    ctx.restore();
  }

  private drawWeaponSlots(ctx: CanvasRenderingContext2D, x: number, y: number, weapons: { type: string; ammo: number }[], active: number, time: number) {
    ctx.save();

    for (let i = 0; i < 3; i++) {
      const slotX = x + i * 65;
      const isActive = i === active;
      const weapon = weapons[i];

      ctx.fillStyle = isActive ? '#1a2a4a' : '#0a0a1a';
      ctx.strokeStyle = isActive ? '#00aaff' : '#334455';
      ctx.lineWidth = isActive ? 2 : 1;

      if (isActive) {
        ctx.shadowColor = '#0088ff';
        ctx.shadowBlur = 8;
      }

      ctx.fillRect(slotX, y, 58, 42);
      ctx.strokeRect(slotX, y, 58, 42);
      ctx.shadowBlur = 0;

      ctx.fillStyle = isActive ? '#ffffff' : '#667788';
      ctx.font = 'bold 9px "Courier New", monospace';
      ctx.textAlign = 'center';

      if (weapon) {
        const def = WEAPON_DEFS[weapon.type as keyof typeof WEAPON_DEFS];
        ctx.fillStyle = def.color;
        ctx.font = 'bold 10px "Courier New", monospace';
        ctx.fillText(def.name.toUpperCase(), slotX + 29, y + 16);

        ctx.fillStyle = isActive ? '#cccccc' : '#556677';
        ctx.font = '9px "Courier New", monospace';
        ctx.fillText(weapon.ammo === Infinity ? 'INF' : `${weapon.ammo}`, slotX + 29, y + 30);
      } else {
        ctx.fillStyle = '#334455';
        ctx.fillText('EMPTY', slotX + 29, y + 22);
      }

      ctx.fillStyle = '#445566';
      ctx.font = '8px "Courier New", monospace';
      ctx.fillText(`[${i + 1}]`, slotX + 29, y + 40);
    }

    ctx.restore();
  }

  private drawScoreDisplay(ctx: CanvasRenderingContext2D, x: number, y: number, score: number, wave: number, combo: number, time: number) {
    ctx.save();
    ctx.textAlign = 'center';

    ctx.shadowColor = '#0088ff';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#00ddff';
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.fillText(score.toLocaleString(), x, y);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#88aacc';
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText(`WAVE ${wave}`, x, y + 22);

    if (combo > 1) {
      const pulse = 0.8 + 0.2 * Math.sin(time * 6);
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 10 * pulse;
      ctx.fillStyle = `rgba(255, 200, 0, ${pulse})`;
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText(`x${combo} COMBO`, x, y + 44);
    }

    ctx.restore();
  }
}
