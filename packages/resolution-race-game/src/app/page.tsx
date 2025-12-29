// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';

export default function MidnightIceRun() {
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

    const goodLabels = ['Profit', 'Holiday', 'Healthy', 'Financial Freedom', 'Happy', '100x Gem', 'Airdrop', 'WAGMI', 'Bull Market', 'Passive Income', 'New ATH', 'Green Candle', 'Freedom', 'Good Sleep', 'Promotion', 'Diamond Hands', 'Inner Peace', 'Debt Free', 'Confidence', 'Smart Move'];
    const badLabels = ['Rekt', 'Drain', 'Rug Pull', 'Bear Market', 'Liquidation', 'FOMO', 'FUD', 'High Gas Fee', 'Scam', 'Phishing', 'Red Candle', 'Inflation', 'Burnout', 'Overthinking', 'Bad Vibes', 'Procrastination', 'Insomnia', 'Hack', 'Panic Sell', 'Paper Hands'];

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

    // Snow/Confetti particles
    interface SnowParticle {
      x: number;
      y: number;
      z: number;
      speed: number;
      size: number;
      color: string;
    }

    const snowParticles: SnowParticle[] = [];

    // Initialize snow particles
    for (let i = 0; i < 150; i++) {
      snowParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random(),
        speed: Math.random() * 3 + 2,
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? '#ffffff' : ['#ffd700', '#ff69b4', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 4)],
      });
    }

    // Screen shake
    let shakeAmount = 0;
    const shakeDecay = 0.9;

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

    // Draw background
    function drawBackground() {
      ctx.save();
      
      // Apply screen shake
      if (shakeAmount > 0) {
        ctx.translate(
          (Math.random() - 0.5) * shakeAmount,
          (Math.random() - 0.5) * shakeAmount
        );
        shakeAmount *= shakeDecay;
      }

      // Dark winter night sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#000814');
      skyGradient.addColorStop(0.5, '#001d3d');
      skyGradient.addColorStop(1, '#003566');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();
    }

    // Draw snow/confetti
    function drawSnow() {
      snowParticles.forEach((snow) => {
        // Move towards player (speed effect)
        snow.y += snow.speed * (1 + snow.z * 2);
        snow.x += (snow.x - canvas.width / 2) * 0.002 * snow.z;

        // Reset if off screen
        if (snow.y > canvas.height) {
          snow.y = -10;
          snow.x = Math.random() * canvas.width;
        }

        // Draw with depth
        const size = snow.size * (0.5 + snow.z * 0.5);
        const alpha = 0.6 + snow.z * 0.4;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = snow.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = snow.color;
        ctx.beginPath();
        ctx.arc(snow.x, snow.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // Draw ice road with reflections
    function drawIceRoad() {
      ctx.save();

      // Ice surface gradient
      const iceGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      iceGradient.addColorStop(0, 'rgba(200, 230, 255, 0.1)');
      iceGradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.3)');
      iceGradient.addColorStop(1, 'rgba(200, 230, 255, 0.5)');
      ctx.fillStyle = iceGradient;
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

      // Reflective streaks (simulating raytracing)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

      for (let i = 0; i < 8; i++) {
        const x = (i / 8) * canvas.width;
        const offset = (tunnelOffset % 100) / 100;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(canvas.width / 2 + (x - canvas.width / 2) * 0.5, canvas.height * (0.6 + offset * 0.4));
        ctx.stroke();
      }

      // Horizontal ice lines
      for (let i = 0; i < 10; i++) {
        const y = canvas.height * 0.6 + (i / 10) * canvas.height * 0.4 + (tunnelOffset % 40);
        const scale = 1 - ((y - canvas.height * 0.6) / (canvas.height * 0.4)) * 0.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + scale * 0.2})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - (canvas.width / 2) * scale, y);
        ctx.lineTo(canvas.width / 2 + (canvas.width / 2) * scale, y);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw player (snowboard)
    function drawPlayer() {
      ctx.save();

      // Light trail with intense bloom
      const trailGradient = ctx.createRadialGradient(playerX, playerY + 20, 0, playerX, playerY + 20, 100);
      trailGradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
      trailGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = trailGradient;
      ctx.fillRect(playerX - 100, playerY, 200, 120);

      // Snowboard glow (intense bloom)
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#00ffff';

      // Snowboard body
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.ellipse(playerX, playerY, playerSize * 0.8, playerSize * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snowboard detail
      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.ellipse(playerX, playerY, playerSize * 0.6, playerSize * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic light on ice floor (casting light effect with reflection)
      const floorLight = ctx.createRadialGradient(playerX, playerY + 50, 0, playerX, playerY + 50, 150);
      floorLight.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
      floorLight.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
      floorLight.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = floorLight;
      ctx.beginPath();
      ctx.arc(playerX, playerY + 80, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw 3D gift box
    function drawGiftBox(x: number, y: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Intense bloom
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#ffd700';

      // Box body with 3D gradient
      const boxGradient = ctx.createLinearGradient(-25, -25, 25, 25);
      boxGradient.addColorStop(0, '#ffd700');
      boxGradient.addColorStop(0.5, '#ffed4e');
      boxGradient.addColorStop(1, '#ffd700');
      ctx.fillStyle = boxGradient;
      ctx.fillRect(-25, -25, 50, 50);

      // Ribbon vertical
      ctx.fillStyle = '#ff0066';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff0066';
      ctx.fillRect(-5, -25, 10, 50);

      // Ribbon horizontal
      ctx.fillRect(-25, -5, 50, 10);

      // Bow on top
      ctx.fillStyle = '#ff0066';
      ctx.beginPath();
      ctx.arc(-10, -25, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(10, -25, 8, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle effect
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(-12, -12, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw 3D alert triangle
    function drawAlertTriangle(x: number, y: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Intense bloom
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#ff0066';

      // Triangle with 3D gradient
      const triangleGradient = ctx.createLinearGradient(0, -30, 0, 30);
      triangleGradient.addColorStop(0, '#ff0066');
      triangleGradient.addColorStop(0.5, '#ff3388');
      triangleGradient.addColorStop(1, '#cc0052');
      ctx.fillStyle = triangleGradient;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(26, 26);
      ctx.lineTo(-26, 26);
      ctx.closePath();
      ctx.fill();

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffffff';
      ctx.stroke();

      // Exclamation mark
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffff';
      ctx.fillRect(-3, -15, 6, 20);
      ctx.beginPath();
      ctx.arc(0, 15, 4, 0, Math.PI * 2);
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
          drawGiftBox(obs.x, obs.y, obs.rotation);

          // Floating text with bloom
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, obs.x, obs.y - 50);
        } else if (obs.type === 'bad') {
          drawAlertTriangle(obs.x, obs.y, obs.rotation);

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

      // Draw everything in order
      drawBackground();
      drawSnow();
      drawIceRoad();
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
            createParticles(obs.x, obs.y, '#ffd700', 30);
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
            <p className="text-2xl text-cyan-400 mb-8">Try to set your resolutions!</p>
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
            <p className="text-2xl text-cyan-400 mb-8">Congratulations, you are ready for 2026 resolutions!</p>
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

