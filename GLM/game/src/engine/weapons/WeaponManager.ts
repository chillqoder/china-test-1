import { GameState, WeaponType } from '../types';
import { WEAPON_DEFS } from '../constants';
import { vec2, vecFromAngle } from '../math';
import { Game } from '../Game';

export class WeaponManager {
  private fireTimer: number = 0;

  reset() {
    this.fireTimer = 0;
  }

  update(state: GameState, input: import('../types').InputState, dt: number, game: Game) {
    if (!state.player.alive) return;

    this.fireTimer -= dt;

    if (input.scrollDelta !== 0) {
      let newIdx = state.activeWeapon + input.scrollDelta;
      while (newIdx < 0) newIdx += state.weapons.length;
      newIdx = newIdx % state.weapons.length;
      state.activeWeapon = newIdx;
    }

    for (const num of input.numberKeys) {
      const idx = num - 1;
      if (idx < state.weapons.length) {
        state.activeWeapon = idx;
      }
    }

    const firing = input.mouseDown || input.keys.has(' ');
    if (firing && this.fireTimer <= 0) {
      this.fire(state, game);
    }
  }

  private fire(state: GameState, game: Game) {
    const slot = state.weapons[state.activeWeapon];
    if (!slot) return;

    const def = WEAPON_DEFS[slot.type];
    if (!def) return;

    if (slot.ammo !== Infinity && slot.ammo <= 0) return;

    this.fireTimer = def.fireRate;

    if (slot.ammo !== Infinity) {
      slot.ammo--;
    }

    const p = state.player;
    const count = def.count;

    for (let i = 0; i < count; i++) {
      const spreadAngle = def.spread > 0
        ? (i - (count - 1) / 2) * (def.spread / count)
        : (Math.random() - 0.5) * def.spread;
      const angle = p.angle + spreadAngle;

      state.projectiles.push({
        id: game.getNextId(),
        pos: vec2(p.pos.x + Math.cos(p.angle) * 30, p.pos.y + Math.sin(p.angle) * 30),
        vel: vecFromAngle(angle, def.speed),
        angle,
        weaponType: def.type,
        damage: def.damage,
        owner: 'player',
        alive: true,
        lifetime: def.range,
        maxLifetime: def.range,
        radius: def.radius,
        homing: def.homing,
      });
    }

    if (def.type === 'railgun') {
      state.screenShake = Math.max(state.screenShake, 3);
      for (let i = 0; i < 5; i++) {
        const a = p.angle + (Math.random() - 0.5) * 0.5;
        game.spawnParticle({
          pos: vec2(p.pos.x + Math.cos(p.angle) * 30, p.pos.y + Math.sin(p.angle) * 30),
          vel: vecFromAngle(a, 200 + Math.random() * 100),
          color: '#ffffff',
          alpha: 0.8,
          size: 2 + Math.random() * 2,
          lifetime: 0.2,
          maxLifetime: 0.2,
          decay: 1,
          glow: true,
        });
      }
    }
  }

  collectWeapon(state: GameState, type: WeaponType) {
    const def = WEAPON_DEFS[type];
    if (!def) return;

    const existing = state.weapons.find(w => w.type === type);
    if (existing && existing.ammo !== Infinity) {
      existing.ammo = Math.min(existing.ammo + def.ammo * 0.5, def.ammo);
      return;
    }

    if (state.weapons.length < 3) {
      state.weapons.push({ type, ammo: def.ammo });
    } else {
      const slot = state.weapons[state.activeWeapon];
      if (slot.type !== 'laser') {
        slot.type = type;
        slot.ammo = def.ammo;
      }
    }
  }
}
