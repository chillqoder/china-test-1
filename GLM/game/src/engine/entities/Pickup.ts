import { GameState, Pickup } from '../types';
import { vec2 } from '../math';
import { PICKUP_LIFETIME } from '../constants';
import { Game } from '../Game';

export function updatePickup(state: GameState, pickup: Pickup, dt: number, game: Game) {
  if (!pickup.alive) return;

  pickup.pos.x += pickup.vel.x * dt;
  pickup.pos.y += pickup.vel.y * dt;
  pickup.vel.x *= 0.98;
  pickup.vel.y *= 0.98;

  pickup.lifetime -= dt;
  pickup.pulseTimer += dt;

  if (pickup.lifetime <= 0) {
    pickup.alive = false;
  }
}
