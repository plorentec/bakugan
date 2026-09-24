'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '@/stores/battle-store';
import { ScratchBattle } from '@/minigames/scratch-battle';
import balanceConfig from '@/data/config/balance.json';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const TARGET_RADIUS = 50;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function MinigameOverlay() {
  const { minigameActive, resolveMinigame } = useBattleStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<ScratchBattle | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isComplete, setIsComplete] = useState(false);

  /* ================================================================== */
  /*  Game lifecycle                                                      */
  /* ================================================================== */

  useEffect(() => {
    if (!minigameActive) {
      // Clean up
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setScore(0);
      setTimeLeft(10);
      setIsComplete(false);
      return;
    }

    // Create minigame
    const game = new ScratchBattle({
      type: 'scratch',
      duration: 10,
      difficulty: 1.0,
    });

    // Position target in center of canvas
    game.setTarget(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, TARGET_RADIUS);
    game.start();
    gameRef.current = game;

    // Start game loop
    lastTimeRef.current = performance.now();

    const gameLoop = (timestamp: number) => {
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const g = gameRef.current;
      if (!g || g.isComplete()) {
        setIsComplete(true);
        // Auto-resolve after short delay
        setTimeout(() => {
          const result = g?.getResult();
          if (result) {
            resolveMinigame(0, result.score);
          }
        }, 1500);
        return;
      }

      g.update(delta);
      setScore(g.getCurrentScore());
      setTimeLeft(g.getRemainingTime());

      // Render
      renderCanvas(g);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [minigameActive, resolveMinigame]);

  /* ================================================================== */
  /*  Input handling                                                      */
  /* ================================================================== */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const game = gameRef.current;
      if (!game || game.isComplete()) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

      game.onScratchStart(x, y);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const game = gameRef.current;
      if (!game || game.isComplete()) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

      game.onScratchMove(x, y);
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    game.onScratchEnd();
  }, []);

  /* ================================================================== */
  /*  Rendering                                                           */
  /* ================================================================== */

  function renderCanvas(game: ScratchBattle): void {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw target area
    const target = game.getTargetPosition();
    const state = game.getState();

    // Target glow
    const gradient = ctx.createRadialGradient(
      target.x,
      target.y,
      0,
      target.x,
      target.y,
      target.radius * 1.5,
    );
    gradient.addColorStop(0, state.isOnTarget ? 'rgba(255, 215, 0, 0.4)' : 'rgba(100, 100, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Target circle
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fillStyle = state.isOnTarget ? 'rgba(255, 215, 0, 0.6)' : 'rgba(100, 100, 255, 0.5)';
    ctx.fill();
    ctx.strokeStyle = state.isOnTarget ? '#ffd700' : '#6464ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Target symbol (attribute icon placeholder — just a star)
    ctx.fillStyle = state.isOnTarget ? '#ffffff' : '#aaaaff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', target.x, target.y);

    // Scratch trail
    if (state.totalDistance > 0) {
      ctx.fillStyle = 'rgba(255, 255, 100, 0.3)';
      for (let i = 0; i < Math.min(state.strokeCount, 20); i++) {
        const angle = (i / 20) * Math.PI * 2;
        const dist = 10 + (i % 5) * 8;
        ctx.beginPath();
        ctx.arc(
          target.x + Math.cos(angle) * dist,
          target.y + Math.sin(angle) * dist,
          3,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH the symbol repeatedly!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
  }

  /* ================================================================== */
  /*  Render                                                              */
  /* ================================================================== */

  if (!minigameActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-xl border border-gray-600 bg-gray-900 p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="font-mono text-xl font-bold text-yellow-400">SCRATCH BATTLE</h2>
            <p className="mt-1 font-mono text-sm text-gray-400">
              Scratch the symbol as fast as you can!
            </p>
          </div>

          {/* Timer and Score */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-white">
                {timeLeft.toFixed(1)}s
              </div>
              <div className="font-mono text-[10px] text-gray-500">TIME</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-yellow-400">
                {(score * 100).toFixed(0)}%
              </div>
              <div className="font-mono text-[10px] text-gray-500">SCORE</div>
            </div>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="cursor-crosshair rounded-lg border border-gray-600"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          {/* G-Power preview */}
          <div className="font-mono text-sm text-gray-400">
            G-Power earned:{' '}
            <span className="font-bold text-green-400">
              +{Math.round(score * balanceConfig.minigame.g_power_per_result_point)} G
            </span>
          </div>

          {/* Completion message */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-lg font-bold text-yellow-400"
            >
              Time&apos;s up!
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
