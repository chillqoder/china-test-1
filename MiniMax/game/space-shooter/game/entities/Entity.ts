import * as PIXI from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export abstract class Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  size: number;
  health: number;
  maxHealth: number;
  alive: boolean;
  sprite: PIXI.Container;
  colliderRadius: number;

  constructor(x: number, y: number, size: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.size = size;
    this.health = 100;
    this.maxHealth = 100;
    this.alive = true;
    this.sprite = new PIXI.Container();
    this.colliderRadius = size / 2;
  }

  update(delta: number, ...args: unknown[]): void {
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.rotation = this.rotation;
    this.handleBounds();
  }

  handleBounds(): void {
    const margin = 100;
    if (this.x < -margin) this.x = GAME_WIDTH + margin;
    if (this.x > GAME_WIDTH + margin) this.x = -margin;
    if (this.y < -margin) this.y = GAME_HEIGHT + margin;
    if (this.y > GAME_HEIGHT + margin) this.y = -margin;
  }

  takeDamage(amount: number, ...args: unknown[]): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }

  abstract render(): void;

  destroy(): void {
    this.sprite.destroy();
  }

  distanceTo(other: Entity): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  angleTo(other: Entity): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }
}
