'use client';

import { useEffect, useRef } from 'react';
import { Game } from '@/engine/Game';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas);
    gameRef.current = game;
    game.start();

    const handleResize = () => game.resize();
    window.addEventListener('resize', handleResize);

    const handleClick = () => {
      if (!game.state.gameStarted) {
        game.reset();
      } else if (game.state.gameOver) {
        game.reset();
      }
    };
    canvas.addEventListener('click', handleClick);

    return () => {
      game.stop();
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        cursor: 'crosshair',
      }}
    />
  );
}
