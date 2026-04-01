import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Player } from './Player';
import { ENEMIES, COLORS } from '../constants';
import type { EnemyType } from '../weapons/types';

export class Enemy extends Entity {
  type: EnemyType;
  speed: number;
  damage: number;
  score: number;
  color: number;
  lastFireTime: number;
  fireRate: number;
  behavior: string;
  targetPlayer: Player | null = null;
  healthBar!: PIXI.Graphics;

  constructor(x: number, y: number, type: EnemyType) {
    const config = ENEMIES[type];
    super(x, y, config.size);
    this.type = type;
    this.speed = config.speed;
    this.health = config.health;
    this.maxHealth = config.health;
    this.damage = config.damage;
    this.score = config.score;
    this.color = config.color;
    this.fireRate = type === 'sniper' ? 2000 : type === 'scout' ? 500 : type === 'kamikaze' ? 0 : 1000;
    this.lastFireTime = 0;
    this.behavior = this.getBehavior();
    this.render();
  }

  getBehavior(): string {
    switch (this.type) {
      case 'scout': return 'flank';
      case 'fighter': return 'circle';
      case 'gunship': return 'direct';
      case 'kamikaze': return 'rush';
      case 'sniper': return 'distance';
      case 'swarm': return 'swarm';
      case 'elite': return 'elite';
      default: return 'flank';
    }
  }

  update(delta: number, player: Player, currentTime: number): void {
    if (!player || !player.alive) return;
    this.targetPlayer = player;

    const angle = this.angleTo(player);
    const dist = this.distanceTo(player);

    switch (this.behavior) {
      case 'flank':
        this.vx += Math.cos(angle + Math.PI / 3) * this.speed * 0.1 * delta;
        this.vy += Math.sin(angle + Math.PI / 3) * this.speed * 0.1 * delta;
        break;
      case 'circle':
        const circleAngle = angle + Math.PI / 2;
        this.vx += Math.cos(circleAngle) * this.speed * 0.15 * delta;
        this.vy += Math.sin(circleAngle) * this.speed * 0.15 * delta;
        break;
      case 'direct':
        this.vx += Math.cos(angle) * this.speed * 0.08 * delta;
        this.vy += Math.sin(angle) * this.speed * 0.08 * delta;
        break;
      case 'rush':
        this.vx += Math.cos(angle) * this.speed * 0.2 * delta;
        this.vy += Math.sin(angle) * this.speed * 0.2 * delta;
        break;
      case 'distance':
        if (dist < 400) {
          this.vx -= Math.cos(angle) * this.speed * 0.1 * delta;
          this.vy -= Math.sin(angle) * this.speed * 0.1 * delta;
        } else if (dist > 500) {
          this.vx += Math.cos(angle) * this.speed * 0.05 * delta;
          this.vy += Math.sin(angle) * this.speed * 0.05 * delta;
        }
        break;
      case 'swarm':
        this.vx += Math.cos(angle + Math.random() * 0.5 - 0.25) * this.speed * 0.15 * delta;
        this.vy += Math.sin(angle + Math.random() * 0.5 - 0.25) * this.speed * 0.15 * delta;
        break;
      case 'elite':
        const eliteAngle = angle + Math.sin(currentTime * 0.003) * 0.5;
        this.vx += Math.cos(eliteAngle) * this.speed * 0.12 * delta;
        this.vy += Math.sin(eliteAngle) * this.speed * 0.12 * delta;
        break;
    }

    const maxSpeed = this.type === 'swarm' ? this.speed : this.type === 'kamikaze' ? this.speed : this.speed * 0.8;
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }

    this.rotation = angle + Math.PI / 2;
    super.update(delta);
    this.updateHealthBar();
  }

  updateHealthBar(): void {
    if (!this.healthBar) return;
    this.healthBar.clear();
    if (this.health < this.maxHealth) {
      const barWidth = this.size * 1.2;
      const barHeight = 4;
      this.healthBar.rect(-barWidth / 2, -this.size * 0.7, barWidth, barHeight);
      this.healthBar.fill({ color: 0x333333 });
      this.healthBar.rect(-barWidth / 2, -this.size * 0.7, barWidth * (this.health / this.maxHealth), barHeight);
      this.healthBar.fill({ color: this.health > this.maxHealth * 0.3 ? 0x00ff00 : 0xff0000 });
    }
  }

  canFire(currentTime: number): boolean {
    if (this.fireRate === 0) return false;
    return currentTime - this.lastFireTime > this.fireRate;
  }

  fire(currentTime: number): void {
    this.lastFireTime = currentTime;
  }

  render(): void {
    this.sprite.removeChildren();

    const body = new PIXI.Graphics();
    
    switch (this.type) {
      case 'scout':
        body.moveTo(0, -this.size * 0.5);
        body.lineTo(this.size * 0.3, this.size * 0.4);
        body.lineTo(0, this.size * 0.2);
        body.lineTo(-this.size * 0.3, this.size * 0.4);
        break;
      case 'fighter':
        body.moveTo(0, -this.size * 0.5);
        body.lineTo(this.size * 0.4, this.size * 0.1);
        body.lineTo(this.size * 0.3, this.size * 0.5);
        body.lineTo(-this.size * 0.3, this.size * 0.5);
        body.lineTo(-this.size * 0.4, this.size * 0.1);
        break;
      case 'gunship':
        body.rect(-this.size * 0.4, -this.size * 0.3, this.size * 0.8, this.size * 0.6);
        body.moveTo(-this.size * 0.5, -this.size * 0.4);
        body.lineTo(-this.size * 0.3, -this.size * 0.5);
        body.lineTo(this.size * 0.3, -this.size * 0.5);
        body.lineTo(this.size * 0.5, -this.size * 0.4);
        break;
      case 'kamikaze':
        body.moveTo(0, -this.size * 0.6);
        body.lineTo(this.size * 0.2, 0);
        body.lineTo(0, this.size * 0.3);
        body.lineTo(-this.size * 0.2, 0);
        break;
      case 'sniper':
        body.moveTo(0, -this.size * 0.6);
        body.lineTo(this.size * 0.15, this.size * 0.4);
        body.lineTo(-this.size * 0.15, this.size * 0.4);
        body.moveTo(this.size * 0.2, -this.size * 0.2);
        body.lineTo(this.size * 0.35, -this.size * 0.2);
        body.lineTo(this.size * 0.35, this.size * 0.2);
        body.lineTo(this.size * 0.2, this.size * 0.2);
        break;
      case 'swarm':
        body.circle(0, 0, this.size * 0.4);
        break;
      case 'elite':
        body.moveTo(0, -this.size * 0.5);
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? this.size * 0.5 : this.size * 0.25;
          body.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        body.moveTo(-this.size * 0.3, this.size * 0.3);
        body.lineTo(-this.size * 0.5, this.size * 0.5);
        body.lineTo(-this.size * 0.3, this.size * 0.5);
        body.moveTo(this.size * 0.3, this.size * 0.3);
        body.lineTo(this.size * 0.5, this.size * 0.5);
        body.lineTo(this.size * 0.3, this.size * 0.5);
        break;
    }
    
    body.closePath();
    body.fill({ color: this.color });
    
    if (this.type === 'elite') {
      body.stroke({ color: 0xffffff, width: 3 });
      const glow = new PIXI.Graphics();
      glow.circle(0, 0, this.size * 0.6);
      glow.fill({ color: this.color, alpha: 0.2 });
      this.sprite.addChild(glow);
    }

    this.sprite.addChild(body);

    this.healthBar = new PIXI.Graphics();
    this.sprite.addChild(this.healthBar);
  }
}
