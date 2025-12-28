'use client';

import { useEffect, useRef, useState } from 'react';

const GOOD_WORDS = ["Profit", "Holiday", "Healthy", "Financial Freedom", "Happy", "100x Gem", "Airdrop", "WAGMI", "Bull Market", "Passive Income", "New ATH", "Green Candle", "Freedom", "Good Sleep", "Promotion", "Diamond Hands", "Inner Peace", "Debt Free", "Confidence", "Smart Move"];
const BAD_WORDS = ["Rekt", "Drain", "Rug Pull", "Bear Market", "Liquidation", "FOMO", "FUD", "High Gas Fee", "Scam", "Phishing", "Red Candle", "Inflation", "Burnout", "Overthinking", "Bad Vibes", "Procrastination", "Insomnia", "Hack", "Panic Sell", "Paper Hands"];

interface FallingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  isGood: boolean;
  speed: number;
}

export default function ResolutionRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(50);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const gameStateRef = useRef({
    playerX: 0,
    words: [] as FallingWord[],
    nextWordId: 0,
    baseSpeed: 2,
    speedMultiplier: 1,
    lastSpawnTime: 0,
    animationId: 0,
    shake: 0,
    mouseX: 0,
    touchX: 0,
    isTouch: false
  });

  const resetGame = () => {
    setScore(50);
    setGameOver(false);
    setVictory(false);
    setFinalScore(0);
    const state = gameStateRef.current;
    state.words = [];
    state.nextWordId = 0;
    state.speedMultiplier = 1;
    state.lastSpawnTime = 0;
    state.shake = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gameStateRef.current.playerX = canvas.width / 2;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      gameStateRef.current.mouseX = e.clientX;
      gameStateRef.current.isTouch = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        gameStateRef.current.touchX = e.touches[0].clientX;
        gameStateRef.current.isTouch = true;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchMove, { passive: false });

    const spawnWord = (timestamp: number) => {
      const state = gameStateRef.current;
      if (timestamp - state.lastSpawnTime > 1000) {
        const isGood = Math.random() > 0.5;
        const wordList = isGood ? GOOD_WORDS : BAD_WORDS;
        const word = wordList[Math.floor(Math.random() * wordList.length)];
        
        state.words.push({
          id: state.nextWordId++,
          text: word,
          x: Math.random() * (canvas.width - 200) + 100,
          y: -50,
          isGood,
          speed: state.baseSpeed * state.speedMultiplier
        });
        
        state.lastSpawnTime = timestamp;
      }
    };

    const checkCollision = (word: FallingWord) => {
      const state = gameStateRef.current;
      const playerSize = 50;
      const playerY = canvas.height - 80;
      
      ctx.font = 'bold 20px Arial';
      const wordWidth = ctx.measureText(word.text).width + 20;
      const wordHeight = 40;
      
      const dx = Math.abs(word.x + wordWidth / 2 - state.playerX);
      const dy = Math.abs(word.y + wordHeight / 2 - playerY);
      
      return dx < (wordWidth / 2 + playerSize / 2) && dy < (wordHeight / 2 + playerSize / 2);
    };

    const gameLoop = (timestamp: number) => {
      if (gameOver) return;

      const state = gameStateRef.current;
      
      // Update player position
      if (state.isTouch) {
        state.playerX = state.touchX;
      } else {
        state.playerX = state.mouseX;
      }

      // Clear canvas with shake effect
      ctx.save();
      if (state.shake > 0) {
        ctx.translate(
          Math.random() * state.shake - state.shake / 2,
          Math.random() * state.shake - state.shake / 2
        );
        state.shake *= 0.9;
      }

      // Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid pattern
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Spawn words
      spawnWord(timestamp);

      // Update and draw words
      state.words = state.words.filter(word => {
        word.y += word.speed;

        // Check collision
        if (checkCollision(word)) {
          if (word.isGood) {
            setScore(prev => prev + 10);
          } else {
            setScore(prev => prev - 10);
            state.shake = 10;
          }
          return false;
        }

        // Remove if off screen
        if (word.y > canvas.height) {
          return false;
        }

        // Draw word
        ctx.font = 'bold 20px Arial';
        const wordWidth = ctx.measureText(word.text).width + 20;
        
        if (word.isGood) {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
        }
        
        ctx.fillRect(word.x, word.y, wordWidth, 40);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(word.text, word.x + 10, word.y + 27);

        return true;
      });

      // Draw player
      ctx.font = '50px Arial';
      ctx.fillText('😎', state.playerX - 25, canvas.height - 40);

      // Draw HUD
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`Current Resolution Capital: ${score}`, canvas.width / 2, 40);
      ctx.textAlign = 'left';

      ctx.restore();

      // Increase difficulty
      state.speedMultiplier = 1 + (timestamp / 100000);

      state.animationId = requestAnimationFrame(gameLoop);
    };

    if (!gameOver) {
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
    }

    return () => {
      cancelAnimationFrame(gameStateRef.current.animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchMove);
    };
  }, [gameOver, score]);

  useEffect(() => {
    if (score <= 0 && !gameOver) {
      setGameOver(true);
      setVictory(false);
      setFinalScore(score);
    } else if (score >= 500 && !gameOver) {
      setGameOver(true);
      setVictory(true);
      setFinalScore(score);
    }
  }, [score, gameOver]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        style={{ touchAction: 'none' }}
      />
      
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center text-white px-6">
            {victory ? (
              <>
                <h1 className="text-6xl font-bold mb-4 text-green-400">🎉 Congratulations! 🎉</h1>
                <p className="text-3xl mb-2">Final Score: {finalScore}</p>
                <p className="text-4xl font-bold mb-8 text-yellow-400">You&apos;ve set your resolutions!</p>
              </>
            ) : (
              <>
                <h1 className="text-6xl font-bold mb-4">Game Over!</h1>
                <p className="text-3xl mb-2">Final Score: {finalScore}</p>
                <p className="text-4xl font-bold mb-8 text-yellow-400">Set your new resolutions!</p>
              </>
            )}
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

