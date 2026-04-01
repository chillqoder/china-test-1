import { Pickup } from '../types';

export class PickupRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(pickup: Pickup, time: number) {
    if (!pickup.alive) return;
    const ctx = this.ctx;
    const { pos, type, weaponType, radius } = pickup;
    const pulse = 0.8 + 0.2 * Math.sin(time * 4);
    const bob = Math.sin(time * 3) * 3;

    ctx.save();
    ctx.translate(pos.x, pos.y + bob);

    if (type === 'repair') {
      ctx.shadowColor = '#44ff44';
      ctx.shadowBlur = 15 * pulse;
      ctx.fillStyle = `rgba(68, 255, 68, ${0.3 * pulse})`;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#44ff44';
      ctx.fillRect(-radius * 0.6, -radius * 0.2, radius * 1.2, radius * 0.4);
      ctx.fillRect(-radius * 0.2, -radius * 0.6, radius * 0.4, radius * 1.2);
    } else {
      const colors: Record<string, string> = {
        spread: '#ff8800',
        railgun: '#aaccff',
        missile: '#ff4466',
        emp: '#aa44ff',
        plasma: '#ff44ff',
      };
      const color = colors[weaponType || ''] || '#ffffff';

      ctx.shadowColor = color;
      ctx.shadowBlur = 15 * pulse;
      ctx.fillStyle = `${color}44`;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const rot = time * 2;
      for (let i = 0; i < 5; i++) {
        const a = rot + (Math.PI * 2 / 5) * i;
        const r = i % 2 === 0 ? radius : radius * 0.5;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = `${color}88`;
      ctx.fill();
    }

    ctx.restore();
  }
}
