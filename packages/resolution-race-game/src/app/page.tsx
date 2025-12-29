'use client';

import { useEffect, useRef, useState } from 'react';

export default function CyberpunkNeonChase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(50);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierTimer, setMultiplierTimer] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game state
    let animationId: number;
    let playerX = canvas.width / 2;
    const playerY = canvas.height - 150;
    const playerSize = 60;
    let tunnelOffset = 0;
    let gameSpeed = 2;
    let lastSpeedIncrease = Date.now();

    // Touch/mouse tracking
    let isDragging = false;

    // Obstacles
    interface Obstacle {
      x: number;
      y: number;
      type: 'good' | 'bad' | 'rocket';
      collected: boolean;
      rotation: number;
      label: string;
    }

    const goodLabels = ['FINANCIAL FREEDOM', 'WEALTH', 'SUCCESS', 'PROSPERITY'];
    const badLabels = ['RUG', 'SCAM', 'LOSS', 'BROKE'];

    const obstacles: Obstacle[] = [];
    let lastObstacleTime = Date.now();

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }

    const particles: Particle[] = [];

    // Screen shake
    let shakeAmount = 0;
    let shakeDecay = 0.9;

    // Collision effect
    let collisionGlitch = 0;

    // Create particles
    function createParticles(x: number, y: number, color: string, count: number) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1,
          maxLife: 1,
          color,
          size: Math.random() * 4 + 2,
        });
      }
    }

    // Spawn obstacles
    function spawnObstacle() {
      const now = Date.now();
      if (now - lastObstacleTime > 1500) {
        const type = Math.random();
        const obstacleType = type < 0.15 ? 'rocket' : type < 0.6 ? 'good' : 'bad';
        obstacles.push({
          x: Math.random() * (canvas.width - 100) + 50,
          y: -50,
          type: obstacleType,
          collected: false,
          rotation: 0,
          label: obstacleType === 'good' 
            ? goodLabels[Math.floor(Math.random() * goodLabels.length)]
            : obstacleType === 'bad'
            ? badLabels[Math.floor(Math.random() * badLabels.length)]
            : 'BOOST x2',
        });
        lastObstacleTime = now;
      }
    }

    // Check collision
    function checkCollision(obstacle: Obstacle) {
      const dist = Math.hypot(obstacle.x - playerX, obstacle.y - playerY);
      return dist < playerSize;
    }

    // Draw tunnel
    function drawTunnel() {
      ctx.save();
      
      // Apply screen shake
      if (shakeAmount > 0) {
        ctx.translate(
          (Math.random() - 0.5) * shakeAmount,
          (Math.random() - 0.5) * shakeAmount
        );
        shakeAmount *= shakeDecay;
      }

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0015');
      gradient.addColorStop(1, '#1a0030');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fog effect
      const fogGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.3, 0,
        canvas.width / 2, canvas.height * 0.3, canvas.width * 0.8
      );
      fogGradient.addColorStop(0, 'rgba(138, 0, 230, 0.1)');
      fogGradient.addColorStop(1, 'rgba(138, 0, 230, 0)');
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines with intense bloom
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#00ffff';

      // Vertical lines
      for (let i = 0; i < 10; i++) {
        const x = (i / 10) * canvas.width;
        const offset = (tunnelOffset % 100) / 100;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(canvas.width / 2 + (x - canvas.width / 2) * 0.3, canvas.height * offset);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 0; i < 20; i++) {
        const y = (i / 20) * canvas.height + (tunnelOffset % 50);
        const scale = 1 - (y / canvas.height) * 0.7;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - (canvas.width / 2) * scale, y);
        ctx.lineTo(canvas.width / 2 + (canvas.width / 2) * scale, y);
        ctx.stroke();
      }

      // Circuit patterns
      ctx.strokeStyle = '#8a00e6';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#8a00e6';
      for (let i = 0; i < 5; i++) {
        const x = Math.sin(tunnelOffset * 0.01 + i) * 100 + canvas.width / 2;
        const y = (i / 5) * canvas.height + (tunnelOffset % 100);
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw player (hoverboard)
    function drawPlayer() {
      ctx.save();

      // Light trail with intense bloom
      const trailGradient = ctx.createRadialGradient(playerX, playerY + 20, 0, playerX, playerY + 20, 100);
      trailGradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
      trailGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = trailGradient;
      ctx.fillRect(playerX - 100, playerY, 200, 120);

      // Hoverboard glow (intense bloom)
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#00ffff';

      // Hoverboard body
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.ellipse(playerX, playerY, playerSize * 0.8, playerSize * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hoverboard detail
      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.ellipse(playerX, playerY, playerSize * 0.6, playerSize * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic light on floor (casting light effect)
      const floorLight = ctx.createRadialGradient(playerX, playerY + 50, 0, playerX, playerY + 50, 120);
      floorLight.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
      floorLight.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = floorLight;
      ctx.fillRect(playerX - 120, playerY + 30, 240, 120);

      ctx.restore();
    }

    // Draw 3D holographic coin
    function drawHoloCoin(x: number, y: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Intense bloom
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#00ff00';

      // Outer ring with 3D effect
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Inner rings for depth
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Holographic core with gradient
      const coinGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
      coinGradient.addColorStop(0, 'rgba(0, 255, 0, 0.9)');
      coinGradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.5)');
      coinGradient.addColorStop(1, 'rgba(0, 255, 0, 0.1)');
      ctx.fillStyle = coinGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle effect
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(-8, -8, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw 3D spike sphere
    function drawSpikeSphere(x: number, y: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);

      // Intense bloom
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#ff0066';

      // Animated spikes
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + rotation;
        const x1 = Math.cos(angle) * 18;
        const y1 = Math.sin(angle) * 18;
        const x2 = Math.cos(angle) * 35;
        const y2 = Math.sin(angle) * 35;

        // Spike gradient
        const spikeGrad = ctx.createLinearGradient(x1, y1, x2, y2);
        spikeGrad.addColorStop(0, '#ff0066');
        spikeGrad.addColorStop(1, '#8a00e6');
        ctx.strokeStyle = spikeGrad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Core sphere with 3D gradient
      const spikeGradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, 25);
      spikeGradient.addColorStop(0, 'rgba(255, 0, 102, 1)');
      spikeGradient.addColorStop(0.5, 'rgba(255, 0, 102, 0.8)');
      spikeGradient.addColorStop(1, 'rgba(138, 0, 230, 0.6)');
      ctx.fillStyle = spikeGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Inner dark core
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw obstacles
    function drawObstacles() {
      obstacles.forEach((obs) => {
        if (obs.collected) return;

        obs.rotation += 0.05;

        ctx.save();

        if (obs.type === 'good') {
          drawHoloCoin(obs.x, obs.y, obs.rotation);

          // Floating text with bloom
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#00ff00';
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, obs.x, obs.y - 50);
        } else if (obs.type === 'bad') {
          drawSpikeSphere(obs.x, obs.y, obs.rotation);

          // Floating text with bloom
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#ff0066';
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, obs.x, obs.y - 50);
        } else if (obs.type === 'rocket') {
          // Rocket power-up with intense bloom
          ctx.shadowBlur = 40;
          ctx.shadowColor = '#ffaa00';

          // Outer glow ring
          const rocketGlow = ctx.createRadialGradient(obs.x, obs.y, 0, obs.x, obs.y, 40);
          rocketGlow.addColorStop(0, 'rgba(255, 170, 0, 0.8)');
          rocketGlow.addColorStop(1, 'rgba(255, 170, 0, 0)');
          ctx.fillStyle = rocketGlow;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 40, 0, Math.PI * 2);
          ctx.fill();

          // Rocket body
          const rocketGradient = ctx.createRadialGradient(obs.x, obs.y, 0, obs.x, obs.y, 28);
          rocketGradient.addColorStop(0, 'rgba(255, 170, 0, 1)');
          rocketGradient.addColorStop(1, 'rgba(255, 170, 0, 0.4)');
          ctx.fillStyle = rocketGradient;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 28, 0, Math.PI * 2);
          ctx.fill();

          // Rocket icon
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffffff';
          ctx.font = 'bold 32px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚀', obs.x, obs.y);

          // Text above
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#ffaa00';
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, obs.x, obs.y - 50);
        }

        ctx.restore();
      });
    }

    // Draw particles (burst effect)
    function drawParticles() {
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.life -= 0.015;

        if (p.life <= 0) {
          particles.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // Apply chromatic aberration on collision
    function applyGlitch() {
      if (collisionGlitch > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 0, 0, ${collisionGlitch * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        collisionGlitch -= 0.05;
      }
    }

    // Game loop
    function gameLoop() {
      if (gameOver || won) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update tunnel
      tunnelOffset += gameSpeed;

      // Increase speed over time
      const now = Date.now();
      if (now - lastSpeedIncrease > 5000) {
        gameSpeed += 0.2;
        lastSpeedIncrease = now;
      }

      // Draw everything
      drawTunnel();
      drawPlayer();
      drawObstacles();
      drawParticles();
      applyGlitch();

      // Spawn and update obstacles
      spawnObstacle();
      obstacles.forEach((obs, index) => {
        obs.y += gameSpeed * 2;

        // Check collision
        if (!obs.collected && checkCollision(obs)) {
          obs.collected = true;

          if (obs.type === 'good') {
            createParticles(obs.x, obs.y, '#00ff00', 30);
            setScore((s) => s + 10 * multiplier);
          } else if (obs.type === 'bad') {
            createParticles(obs.x, obs.y, '#ff0066', 40);
            setScore((s) => s - 10);
            shakeAmount = 25;
            collisionGlitch = 1;
          } else if (obs.type === 'rocket') {
            createParticles(obs.x, obs.y, '#ffaa00', 35);
            setMultiplier(2);
            setMultiplierTimer(10);
          }
        }

        // Remove off-screen obstacles
        if (obs.y > canvas.height + 100) {
          obstacles.splice(index, 1);
        }
      });

      animationId = requestAnimationFrame(gameLoop);
    }

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = 25;
      if (e.key === 'ArrowLeft') {
        playerX = Math.max(50, playerX - moveSpeed);
      } else if (e.key === 'ArrowRight') {
        playerX = Math.min(canvas.width - 50, playerX + moveSpeed);
      }
    };

    // Mouse control
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging || e.buttons === 1) {
        playerX = e.clientX;
      }
    };

    const handleMouseDown = () => {
      isDragging = true;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Touch controls
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        playerX = e.touches[0].clientX;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        playerX = e.touches[0].clientX;
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

    // Start game
    gameLoop();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [gameOver, won, multiplier]);

  // Multiplier countdown
  useEffect(() => {
    if (multiplierTimer > 0) {
      const timer = setInterval(() => {
        setMultiplierTimer((t) => {
          if (t <= 1) {
            setMultiplier(1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [multiplierTimer]);

  // Check win/lose
  useEffect(() => {
    if (score <= 0) {
      setGameOver(true);
    } else if (score >= 500) {
      setWon(true);
    }
  }, [score]);

  const resetGame = () => {
    setScore(50);
    setGameOver(false);
    setWon(false);
    setMultiplier(1);
    setMultiplierTimer(0);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <div className="text-center">
          <div
            className="text-6xl font-bold mb-2"
            style={{
              color: '#00ffff',
              textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff',
              fontFamily: 'monospace',
            }}
          >
            {score}
          </div>
          {multiplier > 1 && (
            <div
              className="text-2xl font-bold animate-pulse"
              style={{
                color: '#ffaa00',
                textShadow: '0 0 15px #ffaa00, 0 0 30px #ffaa00',
                fontFamily: 'monospace',
              }}
            >
              BOOST x{multiplier} ({multiplierTimer}s)
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center">
        <p
          className="text-lg"
          style={{
            color: '#00ffff',
            textShadow: '0 0 10px #00ffff',
            fontFamily: 'monospace',
          }}
        >
          ← → Keys | Mouse | Touch to Move
        </p>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center">
            <h1
              className="text-7xl font-bold mb-4"
              style={{
                color: '#ff0066',
                textShadow: '0 0 30px #ff0066, 0 0 60px #ff0066, 0 0 90px #ff0066',
                fontFamily: 'monospace',
              }}
            >
              GAME OVER
            </h1>
            <p className="text-2xl text-cyan-400 mb-8">Score reached 0</p>
            <button
              onClick={resetGame}
              className="px-8 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all"
              style={{
                boxShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
                fontFamily: 'monospace',
              }}
            >
              RESTART
            </button>
          </div>
        </div>
      )}

      {/* Win Screen */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center">
            <h1
              className="text-7xl font-bold mb-4"
              style={{
                color: '#00ff00',
                textShadow: '0 0 30px #00ff00, 0 0 60px #00ff00, 0 0 90px #00ff00',
                fontFamily: 'monospace',
              }}
            >
              VICTORY!
            </h1>
            <p className="text-2xl text-cyan-400 mb-8">You reached 500 points!</p>
            <button
              onClick={resetGame}
              className="px-8 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all"
              style={{
                boxShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
                fontFamily: 'monospace',
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

