import { Particle, Vector2 } from './types';
import { PARTICLES } from './constants';

let particles: Particle[] = [];
const pool: Particle[] = [];

function createParticle(): Particle {
  if (pool.length > 0) return pool.pop()!;
  return { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: '#fff', type: 'spark' };
}

function releaseParticle(p: Particle) {
  if (pool.length < PARTICLES.maxParticles) pool.push(p);
}

export function spawnParticle(p: Omit<Particle, 'life'>): void {
  if (particles.length >= PARTICLES.maxParticles) return;
  const part = createParticle();
  part.x = p.x;
  part.y = p.y;
  part.vx = p.vx;
  part.vy = p.vy;
  part.size = p.size;
  part.color = p.color;
  part.type = p.type;
  part.life = p.maxLife;
  part.maxLife = p.maxLife;
  particles.push(part);
}

export function spawnExplosion(x: number, y: number, color: string, count: number, size: number = 3) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 50 + Math.random() * 200;
    spawnParticle({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.3 + Math.random() * 0.5,
      maxLife: 0.3 + Math.random() * 0.5,
      size: size * (0.5 + Math.random() * 0.8),
      color,
      type: 'explosion',
    });
  }
  for (let i = 0; i < count / 2; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 100;
    spawnParticle({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.8,
      maxLife: 0.5 + Math.random() * 0.8,
      size: size * 0.3 * (0.5 + Math.random()),
      color: '#ffffff',
      type: 'spark',
    });
  }
}

export function spawnThruster(x: number, y: number, angle: number, intensity: number, color: string) {
  const spread = 0.4;
  const speed = 80 + Math.random() * 60 * intensity;
  const a = angle + Math.PI + (Math.random() - 0.5) * spread;
  spawnParticle({
    x: x + (Math.random() - 0.5) * 4,
    y: y + (Math.random() - 0.5) * 4,
    vx: Math.cos(a) * speed,
    vy: Math.sin(a) * speed,
    life: 0.15 + Math.random() * 0.2,
    maxLife: 0.15 + Math.random() * 0.2,
    size: 2 + Math.random() * 3 * intensity,
    color,
    type: 'thruster',
  });
}

export function spawnDebris(x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 150;
    spawnParticle({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 1.5,
      maxLife: 0.5 + Math.random() * 1.5,
      size: 2 + Math.random() * 4,
      color: '#886644',
      type: 'debris',
    });
  }
}

export function spawnEmpRing(x: number, y: number) {
  for (let i = 0; i < 40; i++) {
    const angle = (Math.PI * 2 * i) / 40;
    spawnParticle({
      x, y,
      vx: Math.cos(angle) * 300,
      vy: Math.sin(angle) * 300,
      life: 0.6,
      maxLife: 0.6,
      size: 3,
      color: '#8844ff',
      type: 'ring',
    });
  }
}

export function updateParticles(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      releaseParticle(p);
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.type === 'explosion' || p.type === 'spark') {
      p.vx *= 0.96;
      p.vy *= 0.96;
    }
    if (p.type === 'debris') {
      p.vx *= 0.98;
      p.vy *= 0.98;
    }
  }
}

export function getParticles(): Particle[] {
  return particles;
}

export function clearParticles() {
  while (particles.length > 0) releaseParticle(particles.pop()!);
}
