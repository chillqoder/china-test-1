import { Vector2 } from './types';

const keys = new Map<string, boolean>();
let mouseX = 0;
let mouseY = 0;
let mouseDown = false;
let mouseWheel = 0;

export function initInput(canvas: HTMLCanvasElement) {
  window.addEventListener('keydown', (e) => {
    keys.set(e.code, true);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.set(e.code, false);
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) mouseDown = true;
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouseDown = false;
  });

  canvas.addEventListener('wheel', (e) => {
    mouseWheel += e.deltaY > 0 ? 1 : -1;
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function isKeyDown(code: string): boolean {
  return keys.get(code) === true;
}

export function getMousePos(): Vector2 {
  return { x: mouseX, y: mouseY };
}

export function isMouseDown(): boolean {
  return mouseDown;
}

export function consumeMouseWheel(): number {
  const w = mouseWheel;
  mouseWheel = 0;
  return w;
}

export function resetInput() {
  keys.clear();
  mouseDown = false;
  mouseWheel = 0;
}
