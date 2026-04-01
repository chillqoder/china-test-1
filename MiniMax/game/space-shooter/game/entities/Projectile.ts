import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { COLORS, WEAPONS } from '../constants';
import type { WeaponType } from '../weapons/types';

export class Projectile extends Entity {
  weaponType: WeaponType;
  damage: number;
  owner: 'player' | 'enemy';
  target: Entity | null = null;
  trail: PIXI.Graphics;
  age: number;

  constructor(x: number, y: number, angle: number, weaponType: WeaponType, owner: 'player' | 'enemy', target?: Entity) {
    const config = WEAPONS[weaponType];
    super(x, y, config.size);
    this.weaponType = weaponType;
    this.damage = config.damage;
    this.owner = owner;
    this.target = target || null;
    this.age = 0;
    
    const speed = config.speed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotation = angle;
    
    this.trail = new PIXI.Graphics();
    this.sprite.addChild(this.trail);
    
    this.render();
  }

  update(delta: number): void {
    const config = WEAPONS[this.weaponType];
    
    if (this.weaponType === 'missile' && this.target && this.target.alive) {
      const angle = this.angleTo(this.target);
      const turnSpeed = 0.1 * delta;
      const currentAngle = Math.atan2(this.vy, this.vx);
      let diff = angle - currentAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.vx = Math.cos(newAngle) * speed;
      this.vy = Math.sin(newAngle) * speed;
      this.rotation = newAngle;
    }

    if (this.weaponType === 'emp') {
      const expandRate = 1.5 * delta;
      this.size += expandRate;
      this.colliderRadius = this.size;
    }

    this.age += delta;
    
    this.trail.clear();
    if (this.weaponType === 'missile') {
      this.trail.moveTo(0, 0);
      this.trail.lineTo(-this.vx * 0.5, -this.vy * 0.5);
      this.trail.stroke({ color: 0x888888, width: 3 });
      this.trail.circle(-this.vx * 0.5, -this.vy * 0.5, 4);
      this.trail.fill({ color: 0xffffff });
    }

    super.update(delta);
  }

  isExpired(): boolean {
    if (this.weaponType === 'emp') {
      return this.age > 60 || this.size > 300;
    }
    return this.age > 120;
  }

  render(): void {
    const config = WEAPONS[this.weaponType];
    const g = new PIXI.Graphics();
    const weaponColors: Record<string, number> = {
      laser: COLORS.laser,
      spread: COLORS.spread,
      railgun: COLORS.railgun,
      missile: COLORS.missile,
      emp: COLORS.emp,
      plasma: COLORS.plasma,
    };
    const color = this.owner === 'player' ? (weaponColors[this.weaponType] || COLORS.laser) : 0xff4444;

    switch (this.weaponType) {
      case 'laser':
        g.rect(-config.size / 2, -1, config.size, 2);
        g.fill({ color });
        g.circle(0, 0, config.size * 0.5);
        g.fill({ color: 0xffffff, alpha: 0.8 });
        break;
      case 'spread':
        g.circle(0, 0, config.size);
        g.fill({ color, alpha: 0.8 });
        g.circle(0, 0, config.size * 0.5);
        g.fill({ color: 0xffffff, alpha: 0.6 });
        break;
      case 'railgun':
        g.rect(-config.size * 2, -config.size / 2, config.size * 4, config.size);
        g.fill({ color: 0xffffff, alpha: 0.9 });
        g.rect(-config.size * 2, -config.size, config.size * 4, config.size * 2);
        g.fill({ color, alpha: 0.3 });
        break;
      case 'missile':
        g.moveTo(config.size, 0);
        g.lineTo(-config.size * 0.5, -config.size * 0.5);
        g.lineTo(-config.size * 0.5, config.size * 0.5);
        g.closePath();
        g.fill({ color });
        break;
      case 'emp':
        g.circle(0, 0, this.size);
        g.stroke({ color, width: 3 });
        g.circle(0, 0, this.size * 0.7);
        g.stroke({ color: 0xffffff, width: 1, alpha: 0.5 });
        break;
      case 'plasma':
        g.circle(0, 0, config.size);
        g.fill({ color, alpha: 0.7 });
        g.circle(0, 0, config.size * 0.6);
        g.fill({ color: 0xffffff, alpha: 0.5 });
        break;
    }

    this.sprite.addChild(g);

    const glow = new PIXI.Graphics();
    glow.circle(0, 0, config.size * 2);
    glow.fill({ color, alpha: 0.2 });
    this.sprite.addChildAt(glow, 0);
  }
}
