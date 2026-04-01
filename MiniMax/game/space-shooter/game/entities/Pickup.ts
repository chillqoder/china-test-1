import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { COLORS } from '../constants';
import type { PickupType } from '../weapons/types';

export class Pickup extends Entity {
  pickupType: PickupType;
  bobOffset: number;
  glow: PIXI.Graphics;

  constructor(x: number, y: number, type: PickupType) {
    super(x, y, 25);
    this.pickupType = type;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.glow = new PIXI.Graphics();
    this.sprite.addChild(this.glow);
    this.render();
  }

  update(delta: number, currentTime: number): void {
    this.sprite.y = this.y + Math.sin(currentTime * 0.005 + this.bobOffset) * 5;
    this.sprite.rotation += 0.02 * delta;
  }

  render(): void {
    this.glow.clear();
    this.sprite.removeChildren();

    const color = this.pickupType === 'repair' ? COLORS.pickup.repair : COLORS.pickup.weapon;
    const isWeapon = this.pickupType !== 'repair';

    if (isWeapon) {
      const g = new PIXI.Graphics();
      g.moveTo(0, -this.size * 0.5);
      g.lineTo(this.size * 0.3, this.size * 0.3);
      g.lineTo(0, this.size * 0.1);
      g.lineTo(-this.size * 0.3, this.size * 0.3);
      g.closePath();
      g.fill({ color });
      g.stroke({ color: 0xffffff, width: 2 });
      this.sprite.addChild(g);
    } else {
      const g = new PIXI.Graphics();
      g.roundRect(-this.size * 0.4, -this.size * 0.3, this.size * 0.8, this.size * 0.6, 5);
      g.fill({ color });
      g.stroke({ color: 0xffffff, width: 2 });
      g.moveTo(-this.size * 0.15, -this.size * 0.1);
      g.lineTo(this.size * 0.15, -this.size * 0.1);
      g.stroke({ color: 0xffffff, width: 2 });
      g.moveTo(0, -this.size * 0.1);
      g.lineTo(0, this.size * 0.15);
      g.stroke({ color: 0xffffff, width: 2 });
      this.sprite.addChild(g);
    }

    this.glow.circle(0, 0, this.size * 1.2);
    this.glow.fill({ color, alpha: 0.15 });
    this.sprite.addChildAt(this.glow, 0);
  }
}
