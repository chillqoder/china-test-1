import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { PLAYER, COLORS, DAMAGE_STATES } from '../constants';

export class Player extends Entity {
  hull: number;
  maxHull: number;
  shield: number;
  maxShield: number;
  shieldRegenRate: number;
  weapons: string[];
  currentWeaponIndex: number;
  lastFireTime: number;
  invulnerable: boolean;
  invulnerableTime: number;
  engineParticles!: PIXI.Graphics;
  shieldGraphic!: PIXI.Graphics;
  damageOverlay!: PIXI.Container;
  damageSparks: PIXI.Graphics[];

  constructor(x: number, y: number) {
    super(x, y, PLAYER.size);
    this.maxHull = PLAYER.maxHull;
    this.hull = this.maxHull;
    this.maxShield = PLAYER.maxShield;
    this.shield = this.maxShield;
    this.shieldRegenRate = PLAYER.shieldRegenRate;
    this.colliderRadius = PLAYER.collisionRadius;
    this.weapons = ['laser'];
    this.currentWeaponIndex = 0;
    this.lastFireTime = 0;
    this.invulnerable = false;
    this.invulnerableTime = 0;
    this.damageSparks = [];
    this.render();
  }

  get currentWeapon(): string {
    return this.weapons[this.currentWeaponIndex];
  }

  get hullPercentage(): number {
    return this.hull / this.maxHull;
  }

  get damageState(): number {
    if (this.hullPercentage >= DAMAGE_STATES.minor) return DAMAGE_STATES.full;
    if (this.hullPercentage >= DAMAGE_STATES.moderate) return DAMAGE_STATES.minor;
    if (this.hullPercentage >= DAMAGE_STATES.severe) return DAMAGE_STATES.moderate;
    if (this.hullPercentage >= DAMAGE_STATES.critical) return DAMAGE_STATES.severe;
    return DAMAGE_STATES.critical;
  }

  update(delta: number, mouseX: number, mouseY: number, currentTime: number): void {
    const targetRotation = Math.atan2(mouseY - this.y, mouseX - this.x) + Math.PI / 2;
    let rotDiff = targetRotation - this.rotation;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    this.rotation += rotDiff * PLAYER.rotationSpeed * delta;

    this.vx *= PLAYER.friction;
    this.vy *= PLAYER.friction;
    
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const maxSpeedMod = this.hullPercentage < 0.5 ? 0.7 : this.hullPercentage < 0.25 ? 0.4 : 1;
    if (speed > PLAYER.maxSpeed * maxSpeedMod) {
      this.vx = (this.vx / speed) * PLAYER.maxSpeed * maxSpeedMod;
      this.vy = (this.vy / speed) * PLAYER.maxSpeed * maxSpeedMod;
    }

    super.update(delta);

    if (!this.invulnerable) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * delta);
    }

    if (this.invulnerable) {
      this.invulnerableTime -= delta;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }

    this.updateDamageVisuals(currentTime);
    this.updateShield();
  }

  updateDamageVisuals(currentTime: number): void {
    const damageContainer = this.sprite.getChildByLabel('damage') as PIXI.Container;
    if (!damageContainer) return;

    damageContainer.removeChildren();

    if (this.hullPercentage < 0.75) {
      const sparkCount = Math.floor((1 - this.hullPercentage) * 10);
      for (let i = 0; i < sparkCount; i++) {
        const spark = new PIXI.Graphics();
        spark.circle(0, 0, 2);
        spark.fill({ color: 0xffff00, alpha: 0.8 + Math.sin(currentTime * 0.02 + i) * 0.2 });
        spark.x = (Math.random() - 0.5) * this.size;
        spark.y = (Math.random() - 0.5) * this.size;
        damageContainer.addChild(spark);
      }
    }
  }

  updateShield(): void {
    if (!this.shieldGraphic) return;
    this.shieldGraphic.clear();
    if (this.shield > 0) {
      const shieldAlpha = 0.2 + (this.shield / this.maxShield) * 0.3;
      this.shieldGraphic.circle(0, 0, this.size * 0.8);
      this.shieldGraphic.stroke({ color: COLORS.shield, width: 2, alpha: shieldAlpha });
    }
  }

  takeDamage(amount: number, currentTime: number): void {
    if (this.invulnerable) return;

    const shieldDamage = Math.min(this.shield, amount);
    this.shield -= shieldDamage;
    const hullDamage = amount - shieldDamage;
    
    if (hullDamage > 0) {
      this.hull = Math.max(0, this.hull - hullDamage);
      this.invulnerable = true;
      this.invulnerableTime = 30;

      if (this.hull <= 0) {
        this.alive = false;
      }
    }
  }

  heal(amount: number): void {
    this.hull = Math.min(this.maxHull, this.hull + amount);
  }

  addWeapon(weapon: string): boolean {
    if (this.weapons.length >= 3) return false;
    if (this.weapons.includes(weapon)) return false;
    this.weapons.push(weapon);
    return true;
  }

  switchWeapon(index: number): void {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
    }
  }

  render(): void {
    this.sprite.removeChildren();

    const body = new PIXI.Graphics();
    body.moveTo(0, -this.size * 0.6);
    body.lineTo(this.size * 0.4, this.size * 0.3);
    body.lineTo(this.size * 0.2, this.size * 0.5);
    body.lineTo(-this.size * 0.2, this.size * 0.5);
    body.lineTo(-this.size * 0.4, this.size * 0.3);
    body.closePath();
    body.fill({ color: COLORS.player });
    body.stroke({ color: COLORS.playerGlow, width: 2 });

    const cockpit = new PIXI.Graphics();
    cockpit.ellipse(0, -this.size * 0.1, this.size * 0.15, this.size * 0.25);
    cockpit.fill({ color: 0x88ccff, alpha: 0.8 });

    const wings = new PIXI.Graphics();
    wings.moveTo(-this.size * 0.3, this.size * 0.2);
    wings.lineTo(-this.size * 0.6, this.size * 0.4);
    wings.lineTo(-this.size * 0.5, this.size * 0.5);
    wings.lineTo(-this.size * 0.2, this.size * 0.4);
    wings.closePath();
    wings.fill({ color: COLORS.playerGlow });

    wings.moveTo(this.size * 0.3, this.size * 0.2);
    wings.lineTo(this.size * 0.6, this.size * 0.4);
    wings.lineTo(this.size * 0.5, this.size * 0.5);
    wings.lineTo(this.size * 0.2, this.size * 0.4);
    wings.closePath();
    wings.fill({ color: COLORS.playerGlow });

    const damageContainer = new PIXI.Container();
    damageContainer.label = 'damage';

    this.sprite.addChild(body);
    this.sprite.addChild(cockpit);
    this.sprite.addChild(wings);
    this.sprite.addChild(damageContainer);

    this.shieldGraphic = new PIXI.Graphics();
    this.sprite.addChild(this.shieldGraphic);
    this.updateShield();
  }
}
