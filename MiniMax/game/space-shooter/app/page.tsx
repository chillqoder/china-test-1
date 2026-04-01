'use client';

import { useEffect, useRef, useState } from 'react';
import { Game } from '@/game/Game';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!started || !canvasRef.current || gameRef.current) return;

    const initGame = async () => {
      setLoading(true);
      try {
        const game = new Game();
        await game.init(canvasRef.current!);
        gameRef.current = game;
        
        game.spawner.startNextWave();
        game.wave = game.spawner.currentWave;
        
        setLoading(false);
        
        let lastTime = performance.now();
        const gameLoop = (currentTime: number) => {
          if (gameRef.current) {
            gameRef.current.lastTime = lastTime;
            gameRef.current.update(currentTime);
            lastTime = currentTime;
          }
          requestAnimationFrame(gameLoop);
        };
        requestAnimationFrame(gameLoop);
      } catch (err) {
        console.error('Game init error:', err);
        setLoading(false);
      }
    };

    initGame();

    const handleRestart = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameRef.current?.gameOver) {
        e.preventDefault();
        gameRef.current.restart();
      }
    };

    window.addEventListener('keydown', handleRestart);

    return () => {
      window.removeEventListener('keydown', handleRestart);
    };
  }, [started]);

  const handleStart = () => {
    setStarted(true);
  };

  if (!started) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#0a0a1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          color: '#ffffff',
        }}
      >
        <h1 style={{ fontSize: '64px', marginBottom: '20px', textShadow: '0 0 20px #4a9eff' }}>
          SPACE SHOOTER
        </h1>
        <p style={{ fontSize: '18px', color: '#888888', marginBottom: '40px' }}>
          A Next.js 2D Space Shooter Game
        </p>
        <div style={{ textAlign: 'left', marginBottom: '40px', lineHeight: '2' }}>
          <p><span style={{ color: '#00ffff' }}>WASD</span> - Move</p>
          <p><span style={{ color: '#00ffff' }}>MOUSE</span> - Aim</p>
          <p><span style={{ color: '#00ffff' }}>CLICK / SPACE</span> - Fire</p>
          <p><span style={{ color: '#00ffff' }}>SCROLL / 1-2-3</span> - Switch Weapons</p>
        </div>
        <button
          onClick={handleStart}
          style={{
            padding: '15px 50px',
            fontSize: '24px',
            fontFamily: 'monospace',
            backgroundColor: '#4a9eff',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#6ab4ff')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4a9eff')}
        >
          START GAME
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0a0a1a' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '24px',
            zIndex: 10,
          }}
        >
          Loading...
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
