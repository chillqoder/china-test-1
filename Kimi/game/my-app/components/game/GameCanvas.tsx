'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GameState } from '@/lib/game/types';
import { initGame, updateGame, handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown, handleScroll, restartGame } from '@/lib/game/engine';
import { renderGame } from '@/lib/game/renderer';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export default function GameCanvas({ width = 1920, height = 1080 }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(true);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Initialize game state
    gameStateRef.current = initGame(width, height);
    lastTimeRef.current = performance.now();

    // Start game loop
    isRunningRef.current = true;
    gameLoop();

    return () => {
      isRunningRef.current = false;
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [width, height]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isRunningRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const state = gameStateRef.current;

    if (!canvas || !ctx || !state) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Update game state
    updateGame(state, deltaTime);

    // Render
    renderGame(ctx, state);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Input handlers
  const handleKeyDownEvent = useCallback((e: React.KeyboardEvent) => {
    const state = gameStateRef.current;
    if (!state) return;

    if (e.key === 'r' || e.key === 'R') {
      if (state.gameOver) {
        gameStateRef.current = restartGame(state);
        return;
      }
    }

    handleKeyDown(state, e.key);
  }, []);

  const handleKeyUpEvent = useCallback((e: React.KeyboardEvent) => {
    const state = gameStateRef.current;
    if (!state) return;

    handleKeyUp(state, e.key);
  }, []);

  const handleMouseMoveEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!state || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    handleMouseMove(
      state,
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY
    );
  }, []);

  const handleMouseDownEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = gameStateRef.current;
    if (!state) return;

    handleMouseDown(state, true);
  }, []);

  const handleMouseUpEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = gameStateRef.current;
    if (!state) return;

    handleMouseDown(state, false);
  }, []);

  const handleWheelEvent = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    const state = gameStateRef.current;
    if (!state) return;

    handleScroll(state, e.deltaY);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-contain cursor-crosshair"
        tabIndex={0}
        autoFocus
        onKeyDown={handleKeyDownEvent}
        onKeyUp={handleKeyUpEvent}
        onMouseMove={handleMouseMoveEvent}
        onMouseDown={handleMouseDownEvent}
        onMouseUp={handleMouseUpEvent}
        onMouseLeave={handleMouseUpEvent}
        onWheel={handleWheelEvent}
        onContextMenu={handleContextMenu}
      />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-mono pointer-events-none select-none">
        WASD / Arrows to move • Mouse to aim • Click to shoot • 1-3 to switch weapons • Scroll to cycle
      </div>
    </div>
  );
}
