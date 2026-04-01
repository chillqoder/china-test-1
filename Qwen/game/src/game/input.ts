export class InputHandler {
  private keys = new Map<string, boolean>();
  private mousePos = { x: 0, y: 0 };
  private mouseDown = false;
  private scrollDelta = 0;
  private initialized = false;

  constructor() {}

  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    this.setupKeyboardListeners();
    this.setupMouseListeners();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keys.set(e.code, true);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keys.set(e.code, false);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseDown = false;
    });
  }

  private setupMouseListeners(): void {
    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
    });

    document.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) {
        this.mouseDown = true;
      }
    });

    document.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 0) {
        this.mouseDown = false;
      }
    });

    document.addEventListener('wheel', (e: WheelEvent) => {
      this.scrollDelta += e.deltaY;
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('contextmenu', (e: Event) => {
      e.preventDefault();
    });
  }

  isKeyDown(key: string): boolean {
    return this.keys.get(key) === true;
  }

  getMousePos(): { x: number; y: number } {
    return { ...this.mousePos };
  }

  isMouseDown(): boolean {
    return this.mouseDown;
  }

  getScrollDelta(): number {
    const delta = this.scrollDelta;
    this.scrollDelta = 0;
    return delta;
  }

  isMovementKey(): boolean {
    return (
      this.isKeyDown('KeyW') || this.isKeyDown('KeyS') ||
      this.isKeyDown('KeyA') || this.isKeyDown('KeyD') ||
      this.isKeyDown('ArrowUp') || this.isKeyDown('ArrowDown') ||
      this.isKeyDown('ArrowLeft') || this.isKeyDown('ArrowRight')
    );
  }

  getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) y -= 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) y += 1;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;

    const length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  isWeaponSwitch(): number {
    if (this.isKeyDown('Digit1')) return 0;
    if (this.isKeyDown('Digit2')) return 1;
    if (this.isKeyDown('Digit3')) return 2;
    return -1;
  }

  destroy(): void {
    this.keys.clear();
    this.mouseDown = false;
    this.scrollDelta = 0;
  }
}
