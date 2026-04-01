import { InputState } from './types';

export function createInputState(): InputState {
  return {
    keys: new Set(),
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    mouseJustDown: false,
    mouseJustUp: false,
    scrollDelta: 0,
    numberKeys: [],
  };
}

export function setupInput(canvas: HTMLCanvasElement, state: InputState): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    state.keys.add(e.key.toLowerCase());
    const num = parseInt(e.key);
    if (num >= 1 && num <= 3) {
      state.numberKeys.push(num);
    }
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    state.keys.delete(e.key.toLowerCase());
  };

  const onMouseMove = (e: MouseEvent) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      state.mouseDown = true;
      state.mouseJustDown = true;
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      state.mouseDown = false;
      state.mouseJustUp = true;
    }
  };

  const onWheel = (e: WheelEvent) => {
    state.scrollDelta += Math.sign(e.deltaY);
    e.preventDefault();
  };

  const onContextMenu = (e: MouseEvent) => e.preventDefault();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onContextMenu);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('contextmenu', onContextMenu);
  };
}

export function clearFrameInput(state: InputState) {
  state.mouseJustDown = false;
  state.mouseJustUp = false;
  state.scrollDelta = 0;
  state.numberKeys = [];
}
