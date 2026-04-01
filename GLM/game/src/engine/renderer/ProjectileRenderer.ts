import { Projectile, WeaponType } from '../types';

export class ProjectileRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(proj: Projectile, time: number) {
    if (!proj.alive) return;
    const ctx = this.ctx;
    const { pos, angle, weaponType, radius } = proj;

    ctx.save();
    ctx.translate(pos.x, pos.y);

    switch (weaponType) {
      case 'laser':
        this.drawLaser(ctx, angle, radius, time);
        break;
      case 'spread':
        this.drawSpread(ctx, angle, radius, time);
        break;
      case 'railgun':
        this.drawRailgun(ctx, angle, radius, time);
        break;
      case 'missile':
        this.drawMissile(ctx, angle, radius, time);
        break;
      case 'emp':
        this.drawEMP(ctx, angle, radius, time, proj);
        break;
      case 'plasma':
        this.drawPlasma(ctx, angle, radius, time);
        break;
    }

    ctx.restore();
  }

  private drawLaser(ctx: CanvasRenderingContext2D, angle: number, radius: number, time: number) {
    ctx.rotate(angle);
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-radius * 3, -radius * 0.5, radius * 6, radius);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-radius * 2, -radius * 0.25, radius * 4, radius * 0.5);
  }

  private drawSpread(ctx: CanvasRenderingContext2D, angle: number, radius: number, time: number) {
    ctx.rotate(angle);
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.5, radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc44';
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.6, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRailgun(ctx: CanvasRenderingContext2D, angle: number, radius: number, time: number) {
    ctx.rotate(angle);
    ctx.shadowColor = '#aaccff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-radius * 5, -radius * 0.4, radius * 10, radius * 0.8);
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#aaccff';
    ctx.fillRect(-radius * 4, -radius * 0.2, radius * 8, radius * 0.4);
  }

  private drawMissile(ctx: CanvasRenderingContext2D, angle: number, radius: number, time: number) {
    ctx.rotate(angle);
    ctx.shadowColor = '#ff0022';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff4466';
    ctx.beginPath();
    ctx.moveTo(radius * 2, 0);
    ctx.lineTo(-radius, -radius * 0.6);
    ctx.lineTo(-radius * 0.5, 0);
    ctx.lineTo(-radius, radius * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffaa44';
    const flicker = 0.5 + 0.5 * Math.sin(time * 20);
    ctx.beginPath();
    ctx.arc(-radius * 1.2, 0, radius * 0.4 * flicker, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawEMP(ctx: CanvasRenderingContext2D, angle: number, radius: number, time: number, proj: Projectile) {
    const expandProgress = 1 - proj.lifetime / proj.maxLifetime;
    const r = radius * (1 + expandProgress * 4);
    ctx.shadowColor = '#6600cc';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = `rgba(170, 68, 255, ${1 - expandProgress})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - expandProgress * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 / 6) * i + time * 3;
      ctx.strokeStyle = `rgba(170, 68, 255, ${0.4 - expandProgress * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }
  }

  private drawPlasma(ctx: CanvasRenderingContext2D, angle: number, radius: number, time: number) {
    ctx.shadowColor = '#cc00cc';
    ctx.shadowBlur = 20;
    const pulse = 0.8 + 0.2 * Math.sin(time * 10);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * pulse);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ff88ff');
    grad.addColorStop(0.7, '#ff44ff');
    grad.addColorStop(1, 'rgba(204, 0, 204, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
}
