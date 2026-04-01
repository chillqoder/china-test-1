"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gameEngine, GameEvents } from "../game/engine";

export default function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState({
    score: 0,
    hp: 100,
    maxHp: 100,
    shield: 50,
    maxShield: 50,
    wave: 0,
    enemiesRemaining: 0,
    combo: 0,
    gameOver: false,
    weapons: [] as { weapon: string; ammo: number }[],
    activeWeapon: 0,
  });

  const onScoreChange = useCallback((score: number) => {
    setHud((prev) => ({ ...prev, score }));
  }, []);

  const onHpChange = useCallback((hp: number, maxHp: number, shield: number, maxShield: number) => {
    setHud((prev) => ({ ...prev, hp, maxHp, shield, maxShield }));
  }, []);

  const onWaveChange = useCallback((wave: number, enemiesRemaining: number) => {
    setHud((prev) => ({ ...prev, wave, enemiesRemaining }));
  }, []);

  const onComboChange = useCallback((combo: number) => {
    setHud((prev) => ({ ...prev, combo }));
  }, []);

  const onGameOver = useCallback(() => {
    setHud((prev) => ({ ...prev, gameOver: true }));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const events: GameEvents = {
      onScoreChange,
      onHpChange,
      onWaveChange,
      onComboChange,
      onGameOver,
    };

    let destroyed = false;

    gameEngine.init(containerRef.current, events).then(() => {
      if (!destroyed) {
        gameEngine.start();
      }
    });

    return () => {
      destroyed = true;
      gameEngine.destroy();
    };
  }, [onScoreChange, onHpChange, onWaveChange, onComboChange, onGameOver]);

  const handleRestart = () => {
    gameEngine.reset();
    setHud({
      score: 0,
      hp: 100,
      maxHp: 100,
      shield: 50,
      maxShield: 50,
      wave: 0,
      enemiesRemaining: 0,
      combo: 0,
      gameOver: false,
      weapons: [],
      activeWeapon: 0,
    });
  };

  const hpPercent = hud.hp / hud.maxHp;
  const shieldPercent = hud.shield / hud.maxShield;

  return (
    <div ref={containerRef} className="game-container">
      <div className="hud-overlay">
        <div className="hud-top">
          <div className="hud-score">
            <span className="hud-label">SCORE</span>
            <span className="hud-value">{hud.score.toLocaleString()}</span>
          </div>
          <div className="hud-wave">
            <span className="hud-label">WAVE</span>
            <span className="hud-value">{hud.wave}</span>
            {hud.enemiesRemaining > 0 && (
              <span className="hud-enemies">{hud.enemiesRemaining} left</span>
            )}
          </div>
          {hud.combo > 1 && (
            <div className="hud-combo">
              <span className="combo-value">x{hud.combo}</span>
              <span className="combo-label">COMBO</span>
            </div>
          )}
        </div>

        <div className="hud-bottom">
          <div className="hud-hull">
            <span className="hud-label">HULL</span>
            <div className="hud-bar-container">
              <div
                className="hud-bar hull-bar"
                style={{
                  width: `${hpPercent * 100}%`,
                  backgroundColor:
                    hpPercent > 0.5 ? "#00ff88" : hpPercent > 0.25 ? "#ffaa00" : "#ff4444",
                }}
              />
            </div>
            <span className="hud-bar-value">
              {Math.ceil(hud.hp)}/{hud.maxHp}
            </span>
          </div>

          <div className="hud-shield">
            <span className="hud-label">SHIELD</span>
            <div className="hud-bar-container">
              <div
                className="hud-bar shield-bar"
                style={{ width: `${shieldPercent * 100}%` }}
              />
            </div>
            <span className="hud-bar-value">
              {Math.ceil(hud.shield)}/{hud.maxShield}
            </span>
          </div>
        </div>
      </div>

      {hud.gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h1 className="game-over-title">SHIP DESTROYED</h1>
            <div className="game-over-stats">
              <div className="stat-row">
                <span className="stat-label">Final Score</span>
                <span className="stat-value">{hud.score.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Waves Survived</span>
                <span className="stat-value">{hud.wave}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Best Combo</span>
                <span className="stat-value">x{hud.combo}</span>
              </div>
            </div>
            <button className="restart-button" onClick={handleRestart}>
              RELAUNCH
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
