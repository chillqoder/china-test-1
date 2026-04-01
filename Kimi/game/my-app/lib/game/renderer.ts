import { GameState, Player, Enemy, Projectile, Particle, Pickup, Star, Nebula } from './types';
import { ENEMY_CONFIGS, WEAPON_CONFIGS, COLORS } from './constants';
import { createExhaust, createDamageSparks } from './systems/particles';

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { width, height } = ctx.canvas;
  
  // Clear canvas
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, width, height);
  
  // Render nebulae (background layer)
  for (const nebula of state.nebulae) {
    renderNebula(ctx, nebula);
  }
  
  // Render starfield
  for (const star of state.stars) {
    renderStar(ctx, star);
  }
  
  // Render particles
  for (const particle of state.particles) {
    renderParticle(ctx, particle);
  }
  
  // Render pickups
  for (const pickup of state.pickups) {
    renderPickup(ctx, pickup);
  }
  
  // Render projectiles
  for (const projectile of state.projectiles) {
    renderProjectile(ctx, projectile);
  }
  
  // Render enemies
  for (const enemy of state.enemies) {
    renderEnemy(ctx, enemy);
  }
  
  // Render player
  if (state.player.hp > 0) {
    renderPlayer(ctx, state.player, state);
  }
  
  // Render HUD
  renderHUD(ctx, state);
  
  // Render wave notification
  if (state.waveTimer > 0 && !state.waveInProgress) {
    renderWaveNotification(ctx, state.wave, state.waveTimer);
  }
  
  // Render game over
  if (state.gameOver) {
    renderGameOver(ctx, state);
  }
}

function renderNebula(ctx: CanvasRenderingContext2D, nebula: Nebula): void {
  const gradient = ctx.createRadialGradient(
    nebula.x, nebula.y, 0,
    nebula.x, nebula.y, nebula.radius
  );
  gradient.addColorStop(0, nebula.color + Math.floor(nebula.opacity * 255).toString(16).padStart(2, '0'));
  gradient.addColorStop(0.5, nebula.color + Math.floor(nebula.opacity * 128).toString(16).padStart(2, '0'));
  gradient.addColorStop(1, nebula.color + '00');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
  ctx.fill();
}

function renderStar(ctx: CanvasRenderingContext2D, star: Star): void {
  const twinkle = Math.sin(star.twinkle) * 0.3 + 0.7;
  const brightness = star.brightness * twinkle;
  
  ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
  ctx.beginPath();
  ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
  ctx.fill();
}

function renderParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  
  switch (particle.type) {
    case 'exhaust':
    case 'trail':
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = particle.size * 2;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'spark':
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffff88';
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'explosion':
      const gradient = ctx.createRadialGradient(
        particle.position.x, particle.position.y, 0,
        particle.position.x, particle.position.y, particle.size
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.5, particle.color + '88');
      gradient.addColorStop(1, particle.color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'debris':
      ctx.fillStyle = particle.color;
      ctx.fillRect(
        particle.position.x - particle.size / 2,
        particle.position.y - particle.size / 2,
        particle.size,
        particle.size
      );
      break;
      
    case 'glow':
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  
  ctx.restore();
}

function renderPickup(ctx: CanvasRenderingContext2D, pickup: Pickup): void {
  const pulseScale = 1 + Math.sin(pickup.pulse) * 0.15;
  const color = pickup.type === 'weapon' && pickup.weaponType 
    ? WEAPON_CONFIGS[pickup.weaponType]?.color || '#ffffff'
    : (pickup.type === 'repair' ? '#44ff44' : '#44aaff');
  const glowColor = pickup.type === 'weapon' && pickup.weaponType
    ? WEAPON_CONFIGS[pickup.weaponType]?.glowColor || '#cccccc'
    : (pickup.type === 'repair' ? '#22cc22' : '#2266cc');
  
  ctx.save();
  ctx.translate(pickup.position.x, pickup.position.y);
  ctx.scale(pulseScale, pulseScale);
  
  // Glow effect
  ctx.shadowBlur = 20;
  ctx.shadowColor = glowColor;
  
  // Outer ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, pickup.radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner glow
  ctx.fillStyle = color + '44';
  ctx.beginPath();
  ctx.arc(0, 0, pickup.radius * 0.7, 0, Math.PI * 2);
  ctx.fill();
  
  // Icon
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icon = pickup.type === 'weapon' ? 'W' : (pickup.type === 'repair' ? '+' : 'S');
  ctx.fillText(icon, 0, 1);
  
  ctx.restore();
}

function renderProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
  const config = WEAPON_CONFIGS[projectile.type] || { color: '#ff4444', glowColor: '#cc2222' };
  
  ctx.save();
  ctx.translate(projectile.position.x, projectile.position.y);
  ctx.rotate(projectile.rotation);
  
  ctx.shadowBlur = 15;
  ctx.shadowColor = config.glowColor;
  ctx.fillStyle = config.color;
  
  switch (projectile.type) {
    case 'laser':
    case 'enemyLaser':
      ctx.fillRect(-8, -2, 16, 4);
      break;
      
    case 'plasma':
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, config.color);
      gradient.addColorStop(1, config.glowColor + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'railgun':
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 25;
      ctx.fillRect(-15, -3, 30, 6);
      ctx.fillStyle = config.color;
      ctx.fillRect(-15, -1, 30, 2);
      break;
      
    case 'missile':
      ctx.fillStyle = '#ffaa44';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-4, -3);
      ctx.lineTo(-4, 3);
      ctx.closePath();
      ctx.fill();
      break;
      
    case 'emp':
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      break;
      
    default:
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
  }
  
  ctx.restore();
}

function renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  const config = ENEMY_CONFIGS[enemy.type];
  
  ctx.save();
  ctx.translate(enemy.position.x, enemy.position.y);
  ctx.rotate(enemy.rotation);
  
  ctx.shadowBlur = 15;
  ctx.shadowColor = config.glowColor;
  ctx.fillStyle = config.color;
  ctx.strokeStyle = config.glowColor;
  ctx.lineWidth = 2;
  
  const size = enemy.radius;
  
  // Elite glow
  if (enemy.elite) {
    ctx.shadowBlur = 25;
    ctx.strokeStyle = '#ffffff';
  }
  
  // Draw enemy shape based on type
  ctx.beginPath();
  switch (config.shape) {
    case 'triangle':
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.6, size * 0.7);
      ctx.lineTo(-size * 0.4, 0);
      ctx.lineTo(-size * 0.6, -size * 0.7);
      ctx.closePath();
      break;
      
    case 'diamond':
      ctx.moveTo(size, 0);
      ctx.lineTo(0, size * 0.7);
      ctx.lineTo(-size, 0);
      ctx.lineTo(0, -size * 0.7);
      ctx.closePath();
      break;
      
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
      
    case 'spike':
      ctx.moveTo(size * 1.2, 0);
      ctx.lineTo(-size * 0.4, size * 0.5);
      ctx.lineTo(-size * 0.2, 0);
      ctx.lineTo(-size * 0.4, -size * 0.5);
      ctx.closePath();
      break;
      
    case 'cross':
      ctx.moveTo(size, size * 0.3);
      ctx.lineTo(size * 0.3, size * 0.3);
      ctx.lineTo(size * 0.3, size);
      ctx.lineTo(-size * 0.3, size);
      ctx.lineTo(-size * 0.3, size * 0.3);
      ctx.lineTo(-size, size * 0.3);
      ctx.lineTo(-size, -size * 0.3);
      ctx.lineTo(-size * 0.3, -size * 0.3);
      ctx.lineTo(-size * 0.3, -size);
      ctx.lineTo(size * 0.3, -size);
      ctx.lineTo(size * 0.3, -size * 0.3);
      ctx.lineTo(size, -size * 0.3);
      ctx.closePath();
      break;
      
    case 'pentagon':
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
      
    case 'star':
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? size : size * 0.4;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
  }
  
  ctx.fill();
  ctx.stroke();
  
  // Health bar for elites and damaged enemies
  if (enemy.elite || enemy.hp < enemy.maxHp) {
    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.restore();
    ctx.save();
    ctx.translate(enemy.position.x, enemy.position.y);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(-20, -size - 10, 40, 5);
    
    ctx.fillStyle = hpPercent > 0.5 ? '#44ff44' : (hpPercent > 0.25 ? '#ffaa44' : '#ff4444');
    ctx.fillRect(-19, -size - 9, 38 * hpPercent, 3);
  }
  
  ctx.restore();
}

function renderPlayer(ctx: CanvasRenderingContext2D, player: Player, state: GameState): void {
  const now = Date.now();
  const isInvulnerable = now < player.invulnerableUntil;
  
  if (isInvulnerable && Math.floor(now / 100) % 2 === 0) {
    return; // Flicker effect
  }
  
  ctx.save();
  ctx.translate(player.position.x, player.position.y);
  ctx.rotate(player.rotation);
  
  // Create exhaust particles
  if (player.thrusterIntensity > 0.1) {
    const exhaustX = -25;
    const exhaustY = 0;
    const exhaustAngle = player.rotation + Math.PI;
    createExhaust(state, 
      player.position.x - Math.cos(player.rotation) * 25,
      player.position.y - Math.sin(player.rotation) * 25,
      exhaustAngle,
      player.thrusterIntensity * 3
    );
  }
  
  // Create damage sparks
  if (player.damageState !== 'pristine') {
    createDamageSparks(state, player.position.x, player.position.y, player.damageState);
  }
  
  // Shield bubble
  if (player.shield > 0) {
    ctx.save();
    ctx.rotate(-player.rotation); // Keep shield aligned with screen
    const shieldAlpha = (player.shield / player.maxShield) * 0.3;
    ctx.strokeStyle = `rgba(100, 200, 255, ${shieldAlpha + 0.1})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#44aaff';
    
    // Hexagonal shield pattern
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = Math.cos(angle) * (player.radius + 10);
      const y = Math.sin(angle) * (player.radius + 10);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillStyle = `rgba(100, 200, 255, ${shieldAlpha * 0.3})`;
    ctx.fill();
    ctx.restore();
  }
  
  // Get damage-based color
  let hullColor = COLORS.player.hull;
  let glowColor = COLORS.player.glow;
  
  switch (player.damageState) {
    case 'minor':
      hullColor = COLORS.player.damage.minor;
      break;
    case 'moderate':
      hullColor = COLORS.player.damage.moderate;
      glowColor = '#cc6622';
      break;
    case 'severe':
      hullColor = COLORS.player.damage.severe;
      glowColor = '#cc2222';
      break;
    case 'critical':
      hullColor = COLORS.player.damage.critical;
      glowColor = '#aa0000';
      break;
  }
  
  ctx.shadowBlur = 20;
  ctx.shadowColor = glowColor;
  ctx.fillStyle = hullColor;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 2;
  
  // Main hull - sophisticated ship shape
  ctx.beginPath();
  // Nose
  ctx.moveTo(30, 0);
  // Right wing tip
  ctx.lineTo(-10, 20);
  // Right engine housing
  ctx.lineTo(-25, 12);
  // Rear center
  ctx.lineTo(-30, 0);
  // Left engine housing
  ctx.lineTo(-25, -12);
  // Left wing tip
  ctx.lineTo(-10, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Cockpit
  ctx.fillStyle = '#88ccff';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#44aaff';
  ctx.beginPath();
  ctx.ellipse(5, 0, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine glow
  ctx.fillStyle = COLORS.player.engine;
  ctx.shadowBlur = 25;
  ctx.shadowColor = COLORS.player.engine;
  ctx.beginPath();
  ctx.arc(-28, 0, 6 + player.thrusterIntensity * 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Damage decals
  if (player.damageState !== 'pristine') {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    
    if (player.damageState === 'moderate' || player.damageState === 'severe' || player.damageState === 'critical') {
      // Hull cracks
      ctx.beginPath();
      ctx.moveTo(-5, 5);
      ctx.lineTo(5, 8);
      ctx.moveTo(0, -8);
      ctx.lineTo(8, -5);
      ctx.stroke();
    }
    
    if (player.damageState === 'severe' || player.damageState === 'critical') {
      // Missing panel
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.moveTo(-15, 8);
      ctx.lineTo(-5, 12);
      ctx.lineTo(-8, 5);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

function renderHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { width, height } = ctx.canvas;
  
  ctx.save();
  
  // Health bar (bottom left)
  const hpPercent = state.player.hp / state.player.maxHp;
  ctx.fillStyle = '#00000088';
  ctx.fillRect(20, height - 70, 200, 50);
  
  ctx.fillStyle = '#333333';
  ctx.fillRect(30, height - 50, 180, 20);
  
  ctx.fillStyle = hpPercent > 0.5 ? COLORS.hud.health : '#ff0000';
  ctx.fillRect(32, height - 48, 176 * hpPercent, 16);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HULL', 30, height - 55);
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.ceil(state.player.hp)}/${state.player.maxHp}`, 205, height - 38);
  
  // Shield bar (bottom left, above health)
  const shieldPercent = state.player.shield / state.player.maxShield;
  ctx.fillStyle = '#333333';
  ctx.fillRect(30, height - 75, 180, 8);
  
  ctx.fillStyle = COLORS.hud.shield;
  ctx.fillRect(32, height - 73, 176 * shieldPercent, 4);
  
  // Weapon info (bottom right)
  const weapon = state.player.weapons[state.player.currentWeaponIndex];
  const weaponConfig = WEAPON_CONFIGS[weapon.type];
  
  ctx.fillStyle = '#00000088';
  ctx.fillRect(width - 220, height - 70, 200, 50);
  
  ctx.fillStyle = weaponConfig.color;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(weapon.type.toUpperCase(), width - 30, height - 45);
  
  if (weapon.infinite) {
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '12px monospace';
    ctx.fillText('∞', width - 30, height - 28);
  } else {
    const ammoPercent = weapon.ammo / weapon.maxAmmo;
    ctx.fillStyle = ammoPercent > 0.3 ? COLORS.hud.ammo : '#ff4444';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`${weapon.ammo}/${weapon.maxAmmo}`, width - 30, height - 28);
  }
  
  // Weapon slots
  const slotY = height - 55;
  for (let i = 0; i < 3; i++) {
    const slotX = width - 200 + i * 25;
    
    if (i < state.player.weapons.length) {
      const w = state.player.weapons[i];
      const isActive = i === state.player.currentWeaponIndex;
      
      ctx.strokeStyle = isActive ? '#ffffff' : '#666666';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(slotX, slotY, 20, 20);
      
      ctx.fillStyle = WEAPON_CONFIGS[w.type].color;
      ctx.fillRect(slotX + 2, slotY + 2, 16, 16);
      
      if (isActive) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = WEAPON_CONFIGS[w.type].glowColor;
        ctx.strokeRect(slotX, slotY, 20, 20);
        ctx.shadowBlur = 0;
      }
    } else {
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX, slotY, 20, 20);
    }
  }
  
  // Score and wave (top center)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`SCORE: ${state.score.toLocaleString()}`, width / 2, 40);
  
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '16px monospace';
  ctx.fillText(`WAVE ${state.wave}`, width / 2, 65);
  
  // Combo multiplier
  if (state.combo > 1) {
    ctx.fillStyle = COLORS.hud.combo;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${state.combo}x COMBO`, width / 2, 90);
    
    // Combo bar
    const comboPercent = state.comboTimer / 2000;
    ctx.fillStyle = '#333333';
    ctx.fillRect(width / 2 - 50, 95, 100, 4);
    ctx.fillStyle = COLORS.hud.combo;
    ctx.fillRect(width / 2 - 50, 95, 100 * comboPercent, 4);
  }
  
  ctx.restore();
}

function renderWaveNotification(ctx: CanvasRenderingContext2D, wave: number, timer: number): void {
  const { width, height } = ctx.canvas;
  const progress = 1 - (timer / 3000);
  const alpha = progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`WAVE ${wave}`, width / 2, height / 2 - 30);
  
  ctx.font = '24px monospace';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('INCOMING', width / 2, height / 2 + 20);
  
  ctx.restore();
}

function renderGameOver(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { width, height } = ctx.canvas;
  
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', width / 2, height / 2 - 80);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '32px monospace';
  ctx.fillText(`FINAL SCORE: ${state.score.toLocaleString()}`, width / 2, height / 2);
  
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '24px monospace';
  ctx.fillText(`WAVES SURVIVED: ${state.wave - 1}`, width / 2, height / 2 + 50);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.fillText('Press R to restart', width / 2, height / 2 + 120);
  
  ctx.restore();
}
