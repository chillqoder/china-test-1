import { Pickup, PickupType, WeaponType } from '../types';
import { WEAPON_CONFIGS } from '../constants';
import { generateId } from '../utils';

export function createPickup(
  x: number,
  y: number,
  type: PickupType,
  weaponType?: string
): Pickup {
  let radius = 12;
  let color = '#ffffff';
  
  if (type === 'weapon' && weaponType) {
    const config = WEAPON_CONFIGS[weaponType];
    color = config?.color || '#ffffff';
    radius = 15;
  } else if (type === 'repair') {
    color = '#44ff44';
    radius = 12;
  } else if (type === 'shield') {
    color = '#44aaff';
    radius = 12;
  }
  
  return {
    id: generateId(),
    position: { x, y },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    radius,
    hp: 1,
    maxHp: 1,
    active: true,
    type,
    weaponType: weaponType as WeaponType,
    lifetime: 15000,
    pulse: 0,
  };
}

export function getPickupColor(type: PickupType, weaponType?: WeaponType): string {
  if (type === 'weapon' && weaponType) {
    return WEAPON_CONFIGS[weaponType]?.color || '#ffffff';
  }
  if (type === 'repair') return '#44ff44';
  if (type === 'shield') return '#44aaff';
  return '#ffffff';
}

export function getPickupGlowColor(type: PickupType, weaponType?: WeaponType): string {
  if (type === 'weapon' && weaponType) {
    return WEAPON_CONFIGS[weaponType]?.glowColor || '#cccccc';
  }
  if (type === 'repair') return '#22cc22';
  if (type === 'shield') return '#2266cc';
  return '#cccccc';
}

export function getPickupIcon(type: PickupType): string {
  switch (type) {
    case 'weapon': return 'W';
    case 'repair': return '+';
    case 'shield': return 'S';
    default: return '?';
  }
}

export function getPickupLabel(type: PickupType, weaponType?: WeaponType): string {
  if (type === 'weapon' && weaponType) {
    return weaponType.charAt(0).toUpperCase() + weaponType.slice(1);
  }
  if (type === 'repair') return 'Repair';
  if (type === 'shield') return 'Shield';
  return 'Unknown';
}
