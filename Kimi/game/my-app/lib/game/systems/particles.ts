import { Particle, Vector2, GameState } from '../types';
import { COLORS } from '../constants';
import { generateId, randomRange, randomVector, normalize } from '../utils';

export function createParticle(
  x: number,
  y: number,
  vx: number,
  vy: number,
  life: number,
  size: number,
  color: string,
  type: Particle['type']
): Particle {
  return {
    id: generateId(),
    position: { x, y },
    velocity: { x: vx, y: vy },
    life,
    maxLife: life,
    size,
    color,
    alpha: 1,
    type,
  };
}

export function updateParticle(particle: Particle, dt: number): void {
  // Update position
  particle.position.x += particle.velocity.x * dt;
  particle.position.y += particle.velocity.y * dt;
  
  // Apply friction based on type
  switch (particle.type) {
    case 'exhaust':
      particle.velocity.x *= 0.95;
      particle.velocity.y *= 0.95;
      particle.size *= 0.98;
      break;
    case 'spark':
      particle.velocity.x *= 0.97;
      particle.velocity.y *= 0.97;
      particle.velocity.y += 0.05 * dt; // Gravity
      break;
    case 'explosion':
      particle.velocity.x *= 0.96;
      particle.velocity.y *= 0.96;
      particle.size *= 0.985;
      break;
    case 'debris':
      particle.velocity.x *= 0.99;
      particle.velocity.y *= 0.99;
      break;
    case 'trail':
      particle.size *= 0.97;
      break;
    case 'glow':
      particle.size *= 0.99;
      break;
  }
  
  // Update life and alpha
  particle.life -= dt * 16.67;
  const lifeRatio = particle.life / particle.maxLife;
  
  // Fade out
  if (particle.type === 'explosion') {
    particle.alpha = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1;
  } else {
    particle.alpha = lifeRatio;
  }
}

export function createExplosion(
  state: GameState,
  x: number,
  y: number,
  color: string,
  intensity: number = 15
): void {
  // Core explosion particles
  for (let i = 0; i < intensity; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(2, 8);
    const size = randomRange(3, 8);
    const life = randomRange(400, 800);
    
    const particleColor = COLORS.particles.explosion[Math.floor(Math.random() * COLORS.particles.explosion.length)];
    
    state.particles.push(createParticle(
      x + randomRange(-10, 10),
      y + randomRange(-10, 10),
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      life,
      size,
      particleColor,
      'explosion'
    ));
  }
  
  // Sparks
  for (let i = 0; i < intensity * 0.5; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(4, 12);
    
    state.particles.push(createParticle(
      x,
      y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      randomRange(300, 600),
      randomRange(2, 4),
      '#ffff88',
      'spark'
    ));
  }
  
  // Debris pieces
  for (let i = 0; i < intensity * 0.3; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(1, 5);
    
    state.particles.push(createParticle(
      x,
      y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      randomRange(1000, 2000),
      randomRange(4, 10),
      COLORS.particles.debris[Math.floor(Math.random() * COLORS.particles.debris.length)],
      'debris'
    ));
  }
}

export function createExhaust(
  state: GameState,
  x: number,
  y: number,
  angle: number,
  intensity: number
): void {
  const count = Math.floor(intensity * 2);
  
  for (let i = 0; i < count; i++) {
    const spreadAngle = angle + randomRange(-0.3, 0.3);
    const speed = randomRange(2, 5);
    
    state.particles.push(createParticle(
      x + randomRange(-3, 3),
      y + randomRange(-3, 3),
      Math.cos(spreadAngle) * speed,
      Math.sin(spreadAngle) * speed,
      randomRange(200, 500),
      randomRange(4, 10),
      COLORS.particles.exhaust[Math.floor(Math.random() * COLORS.particles.exhaust.length)],
      'exhaust'
    ));
  }
}

export function createSparks(
  state: GameState,
  x: number,
  y: number,
  count: number
): void {
  for (let i = 0; i < count; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(3, 8);
    
    state.particles.push(createParticle(
      x,
      y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      randomRange(200, 500),
      randomRange(2, 4),
      '#ffff44',
      'spark'
    ));
  }
}

export function createTrail(
  state: GameState,
  x: number,
  y: number,
  angle: number,
  color: string
): void {
  state.particles.push(createParticle(
    x,
    y,
    randomRange(-0.5, 0.5),
    randomRange(-0.5, 0.5),
    randomRange(300, 600),
    randomRange(6, 12),
    color,
    'trail'
  ));
}

export function createShieldHit(
  state: GameState,
  x: number,
  y: number,
  angle: number
): void {
  for (let i = 0; i < 8; i++) {
    const spreadAngle = angle + randomRange(-0.5, 0.5) + Math.PI;
    const speed = randomRange(3, 7);
    
    state.particles.push(createParticle(
      x,
      y,
      Math.cos(spreadAngle) * speed,
      Math.sin(spreadAngle) * speed,
      randomRange(300, 600),
      randomRange(3, 6),
      '#88ccff',
      'glow'
    ));
  }
}

export function createDamageSparks(
  state: GameState,
  x: number,
  y: number,
  damageState: string
): void {
  let intensity = 1;
  switch (damageState) {
    case 'minor': intensity = 1; break;
    case 'moderate': intensity = 2; break;
    case 'severe': intensity = 3; break;
    case 'critical': intensity = 5; break;
  }
  
  if (Math.random() < 0.1 * intensity) {
    const offset = randomVector(15);
    createSparks(state, x + offset.x, y + offset.y, intensity * 2);
  }
}

export function createWeaponPickupEffect(
  state: GameState,
  x: number,
  y: number,
  color: string
): void {
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 / 20) * i;
    const speed = randomRange(2, 5);
    
    state.particles.push(createParticle(
      x,
      y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      randomRange(400, 800),
      randomRange(4, 8),
      color,
      'glow'
    ));
  }
}
