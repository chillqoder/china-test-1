import { Vec2 } from '../types';
import { STAR_LAYERS, NEBULA_COUNT } from '../constants';
import { randRange } from '../math';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  brightness: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  layer: number;
}

export class StarfieldRenderer {
  private ctx: CanvasRenderingContext2D;
  private layers: Star[][] = [];
  private nebulae: Nebula[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  generate(width: number, height: number) {
    this.layers = [];
    this.nebulae = [];

    const worldSize = 4000;

    for (const layerDef of STAR_LAYERS) {
      const stars: Star[] = [];
      for (let i = 0; i < layerDef.count; i++) {
        stars.push({
          x: randRange(-worldSize, worldSize),
          y: randRange(-worldSize, worldSize),
          size: randRange(layerDef.minSize, layerDef.maxSize),
          alpha: layerDef.alpha * randRange(0.5, 1),
          brightness: randRange(0.7, 1),
        });
      }
      this.layers.push(stars);
    }

    const nebulaColors = [
      'rgba(40, 20, 80,',
      'rgba(20, 40, 80,',
      'rgba(80, 20, 40,',
      'rgba(20, 60, 60,',
      'rgba(60, 20, 60,',
    ];

    for (let i = 0; i < NEBULA_COUNT; i++) {
      this.nebulae.push({
        x: randRange(-worldSize * 0.7, worldSize * 0.7),
        y: randRange(-worldSize * 0.7, worldSize * 0.7),
        radius: randRange(200, 500),
        color: nebulaColors[Math.floor(randRange(0, nebulaColors.length))],
        alpha: randRange(0.05, 0.15),
        layer: Math.floor(randRange(0, 2)),
      });
    }
  }

  render(width: number, height: number, camera: Vec2, time: number) {
    const ctx = this.ctx;

    for (let li = 0; li < this.layers.length; li++) {
      const speed = STAR_LAYERS[li].speed;
      const stars = this.layers[li];

      for (const star of stars) {
        const sx = star.x - camera.x * speed + width / 2;
        const sy = star.y - camera.y * speed + height / 2;

        if (sx < -10 || sx > width + 10 || sy < -10 || sy > height + 10) continue;

        const twinkle = star.brightness * (0.8 + 0.2 * Math.sin(time * 2 + star.x * 0.1));
        const alpha = star.alpha * twinkle;

        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fillRect(sx - star.size / 2, sy - star.size / 2, star.size, star.size);

        if (star.size > 2) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.3;
          ctx.shadowColor = '#aaccff';
          ctx.shadowBlur = star.size * 3;
          ctx.fillRect(sx - star.size / 2, sy - star.size / 2, star.size, star.size);
          ctx.restore();
        }
      }
    }

    for (const neb of this.nebulae) {
      const speed = STAR_LAYERS[neb.layer].speed * 0.5;
      const nx = neb.x - camera.x * speed + width / 2;
      const ny = neb.y - camera.y * speed + height / 2;

      if (nx < -neb.radius * 2 || nx > width + neb.radius * 2 ||
          ny < -neb.radius * 2 || ny > height + neb.radius * 2) continue;

      const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, neb.radius);
      grad.addColorStop(0, neb.color + neb.alpha + ')');
      grad.addColorStop(0.5, neb.color + (neb.alpha * 0.5) + ')');
      grad.addColorStop(1, neb.color + '0)');

      ctx.fillStyle = grad;
      ctx.fillRect(nx - neb.radius, ny - neb.radius, neb.radius * 2, neb.radius * 2);
    }
  }
}
