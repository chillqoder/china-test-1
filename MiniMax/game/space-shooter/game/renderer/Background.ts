import * as PIXI from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: number;
  alpha: number;
  rotationSpeed: number;
  rotation: number;
}

export class Background {
  container: PIXI.Container;
  stars: Star[][];
  starLayers: PIXI.Graphics[];
  nebulae: Nebula[];
  nebulaGraphics: PIXI.Graphics[];
  screenFlash: PIXI.Graphics;

  constructor() {
    this.container = new PIXI.Container();
    this.stars = [];
    this.starLayers = [];
    this.nebulae = [];
    this.nebulaGraphics = [];
    this.screenFlash = new PIXI.Graphics();
    
    this.createLayers();
    this.createNebulae();
    this.screenFlash.clear();
  }

  private createLayers(): void {
    const layerConfigs = [
      { count: 100, speed: 0.2, sizeRange: [0.5, 1], brightness: 0.3 },
      { count: 80, speed: 0.5, sizeRange: [1, 2], brightness: 0.5 },
      { count: 50, speed: 1, sizeRange: [1.5, 2.5], brightness: 0.7 },
      { count: 30, speed: 2, sizeRange: [2, 3], brightness: 1 },
    ];

    for (let l = 0; l < layerConfigs.length; l++) {
      const config = layerConfigs[l];
      const stars: Star[] = [];
      const graphics = new PIXI.Graphics();
      
      for (let i = 0; i < config.count; i++) {
        const star: Star = {
          x: Math.random() * GAME_WIDTH,
          y: Math.random() * GAME_HEIGHT,
          size: config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]),
          speed: config.speed,
          brightness: config.brightness,
          twinkleSpeed: 0.02 + Math.random() * 0.03,
          twinkleOffset: Math.random() * Math.PI * 2,
        };
        stars.push(star);
        
        graphics.circle(star.x, star.y, star.size);
        graphics.fill({ color: COLORS.star, alpha: star.brightness * (0.5 + Math.random() * 0.5) });
      }
      
      this.stars.push(stars);
      this.starLayers.push(graphics);
      this.container.addChild(graphics);
    }
  }

  private createNebulae(): void {
    const nebulaConfig = [
      { x: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.3, radius: 300, color: 0x4400aa, alpha: 0.1 },
      { x: GAME_WIDTH * 0.7, y: GAME_HEIGHT * 0.6, radius: 250, color: 0x004488, alpha: 0.08 },
      { x: GAME_WIDTH * 0.5, y: GAME_HEIGHT * 0.8, radius: 200, color: 0x660044, alpha: 0.06 },
    ];

    for (const config of nebulaConfig) {
      const nebula: Nebula = {
        ...config,
        rotationSpeed: 0.0001,
        rotation: Math.random() * Math.PI * 2,
      };
      this.nebulae.push(nebula);
      
      const g = new PIXI.Graphics();
      this.nebulaGraphics.push(g);
      this.container.addChildAt(g, 0);
    }
  }

  update(delta: number, playerVx: number, playerVy: number, currentTime: number): void {
    for (let l = 0; l < this.stars.length; l++) {
      const layer = this.stars[l];
      const graphics = this.starLayers[l];
      graphics.clear();
      
      for (const star of layer) {
        star.x -= playerVx * star.speed * delta * 0.1;
        star.y -= playerVy * star.speed * delta * 0.1;
        
        if (star.x < 0) star.x += GAME_WIDTH;
        if (star.x > GAME_WIDTH) star.x -= GAME_WIDTH;
        if (star.y < 0) star.y += GAME_HEIGHT;
        if (star.y > GAME_HEIGHT) star.y -= GAME_HEIGHT;
        
        const twinkle = Math.sin(currentTime * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        
        graphics.circle(star.x, star.y, star.size);
        graphics.fill({ color: COLORS.star, alpha: star.brightness * twinkle });
      }
    }

    for (let i = 0; i < this.nebulae.length; i++) {
      const nebula = this.nebulae[i];
      const g = this.nebulaGraphics[i];
      nebula.rotation += nebula.rotationSpeed * delta;
      
      g.clear();
      g.x = nebula.x;
      g.y = nebula.y;
      g.rotation = nebula.rotation;
      
      for (let j = 0; j < 3; j++) {
        const offset = j * 30;
        const size = nebula.radius + offset;
        g.circle(Math.cos(nebula.rotation + j) * offset, Math.sin(nebula.rotation + j) * offset, size);
        g.fill({ color: nebula.color, alpha: nebula.alpha / (j + 1) });
      }
    }
  }

  flash(color: number, intensity: number = 1): void {
    this.screenFlash.clear();
    this.screenFlash.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.screenFlash.fill({ color, alpha: 0.3 * intensity });
    this.container.addChild(this.screenFlash);
    
    setTimeout(() => {
      this.screenFlash.clear();
    }, 50);
  }

  getContainer(): PIXI.Container {
    return this.container;
  }
}
