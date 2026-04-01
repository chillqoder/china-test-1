export class InputManager {
  keys: Set<string>;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  scrollDelta: number;

  constructor() {
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.scrollDelta = 0;
  }

  init(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouseDown = true;
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouseDown = false;
      }
    });

    canvas.addEventListener('wheel', (e) => {
      this.scrollDelta = e.deltaY;
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Digit1') this.emitWeaponSwitch(0);
      if (e.code === 'Digit2') this.emitWeaponSwitch(1);
      if (e.code === 'Digit3') this.emitWeaponSwitch(2);
    });
  }

  private weaponSwitchCallbacks: ((index: number) => void)[] = [];
  
  onWeaponSwitch(callback: (index: number) => void): void {
    this.weaponSwitchCallbacks.push(callback);
  }

  private emitWeaponSwitch(index: number): void {
    for (const cb of this.weaponSwitchCallbacks) {
      cb(index);
    }
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  getMovement(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) y -= 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) y += 1;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;

    const mag = Math.sqrt(x * x + y * y);
    if (mag > 0) {
      x /= mag;
      y /= mag;
    }

    return { x, y };
  }

  consumeScroll(): number {
    const delta = this.scrollDelta;
    this.scrollDelta = 0;
    return delta;
  }

  reset(): void {
    this.keys.clear();
    this.scrollDelta = 0;
  }
}
