import { Particle } from '../types';

export class ParticleRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(p: Particle) {
    if (!p.alive) return;
    const ctx = this.ctx;
    const lifePct = p.lifetime / p.maxLifetime;

    ctx.save();
    ctx.globalAlpha = p.alpha * lifePct;

    if (p.glow) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.size * 4;
    }

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size * (0.5 + lifePct * 0.5), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
