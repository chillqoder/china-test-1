import * as PIXI from 'pixi.js';

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: number;
  life: number;
  maxLife: number;
  decay: number;
  gravity?: number;
}

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: number;
  life: number;
  maxLife: number;
  decay: number;
  gravity: number;
  alive: boolean;
  sprite: PIXI.Graphics;

  constructor(config: ParticleConfig) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.size = config.size;
    this.color = config.color;
    this.life = config.life;
    this.maxLife = config.maxLife;
    this.decay = config.decay;
    this.gravity = config.gravity || 0;
    this.alive = true;
    this.sprite = new PIXI.Graphics();
    this.render();
  }

  update(delta: number): void {
    this.vy += this.gravity * delta;
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.life -= this.decay * delta;
    
    if (this.life <= 0) {
      this.alive = false;
    }
    
    this.render();
  }

  render(): void {
    this.sprite.clear();
    const alpha = Math.max(0, this.life / this.maxLife);
    const size = this.size * (0.5 + alpha * 0.5);
    
    this.sprite.circle(0, 0, size);
    this.sprite.fill({ color: this.color, alpha });
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

export class Explosion {
  particles: Particle[];
  x: number;
  y: number;
  alive: boolean;

  constructor(x: number, y: number, color: number, count: number = 20) {
    this.particles = [];
    this.x = x;
    this.y = y;
    this.alive = true;

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 2 + Math.random() * 6;
      const particle = new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.3 ? color : 0xff8800,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        decay: 1,
      });
      this.particles.push(particle);
    }

    for (let i = 0; i < count / 2; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 1 + Math.random() * 3;
      const particle = new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: 0xffff00,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        decay: 1,
      });
      this.particles.push(particle);
    }
  }

  update(delta: number): void {
    let anyAlive = false;
    for (const p of this.particles) {
      p.update(delta);
      if (p.alive) anyAlive = true;
    }
    this.alive = anyAlive;
  }

  destroy(): void {
    for (const p of this.particles) {
      p.destroy();
    }
  }
}
