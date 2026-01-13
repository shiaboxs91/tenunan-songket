"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Wrench, Server, Clock, RefreshCw } from "lucide-react";

// Dino Game Component
function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gameRef = useRef({
    dino: { x: 50, y: 150, width: 40, height: 40, velocityY: 0, jumping: false },
    obstacles: [] as { x: number; width: number; height: number }[],
    groundY: 150,
    gravity: 0.8,
    jumpForce: -14,
    speed: 6,
    frameCount: 0,
    animationId: 0,
  });

  const jump = useCallback(() => {
    const game = gameRef.current;
    if (!game.dino.jumping && gameStarted && !gameOver) {
      game.dino.velocityY = game.jumpForce;
      game.dino.jumping = true;
    }
    if (!gameStarted || gameOver) {
      // Reset game
      game.dino = { x: 50, y: 150, width: 40, height: 40, velocityY: 0, jumping: false };
      game.obstacles = [];
      game.speed = 6;
      game.frameCount = 0;
      setScore(0);
      setGameOver(false);
      setGameStarted(true);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = gameRef.current;

    const gameLoop = () => {
      if (!gameStarted || gameOver) {
        // Draw start/game over screen
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw ground
        ctx.fillStyle = "#4a4a6a";
        ctx.fillRect(0, game.groundY + 40, canvas.width, 2);

        // Draw dino
        ctx.fillStyle = "#00d4ff";
        ctx.fillRect(game.dino.x, game.dino.y, game.dino.width, game.dino.height);
        
        // Draw eye
        ctx.fillStyle = "#fff";
        ctx.fillRect(game.dino.x + 28, game.dino.y + 8, 6, 6);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        
        if (gameOver) {
          ctx.fillText("GAME OVER!", canvas.width / 2, 80);
          ctx.font = "12px monospace";
          ctx.fillText(`Score: ${score}`, canvas.width / 2, 105);
        }
        ctx.font = "12px monospace";
        ctx.fillText("Press SPACE or TAP to play", canvas.width / 2, gameOver ? 130 : 100);
        
        game.animationId = requestAnimationFrame(gameLoop);
        return;
      }

      // Clear canvas
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      ctx.fillStyle = "#ffffff30";
      for (let i = 0; i < 30; i++) {
        const x = (i * 37 + game.frameCount * 0.5) % canvas.width;
        const y = (i * 23) % 120;
        ctx.fillRect(x, y, 2, 2);
      }

      // Update dino
      game.dino.velocityY += game.gravity;
      game.dino.y += game.dino.velocityY;

      if (game.dino.y >= game.groundY) {
        game.dino.y = game.groundY;
        game.dino.velocityY = 0;
        game.dino.jumping = false;
      }

      // Draw ground
      ctx.fillStyle = "#4a4a6a";
      ctx.fillRect(0, game.groundY + 40, canvas.width, 2);
      
      // Ground pattern
      for (let i = 0; i < canvas.width; i += 20) {
        const x = (i - game.frameCount * 2) % canvas.width;
        ctx.fillRect(x < 0 ? x + canvas.width : x, game.groundY + 45, 10, 1);
      }

      // Spawn obstacles
      if (game.frameCount % Math.max(60, 100 - Math.floor(score / 5)) === 0) {
        const height = 30 + Math.random() * 20;
        game.obstacles.push({
          x: canvas.width,
          width: 20 + Math.random() * 15,
          height,
        });
      }

      // Update and draw obstacles
      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.speed;
        
        // Draw cactus-like obstacle
        ctx.fillStyle = "#ff6b6b";
        ctx.fillRect(obs.x, game.groundY + 40 - obs.height, obs.width, obs.height);
        ctx.fillStyle = "#ff8585";
        ctx.fillRect(obs.x + 2, game.groundY + 40 - obs.height + 2, obs.width - 4, 4);

        // Collision detection
        if (
          game.dino.x < obs.x + obs.width &&
          game.dino.x + game.dino.width > obs.x &&
          game.dino.y + game.dino.height > game.groundY + 40 - obs.height
        ) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
        }

        return obs.x > -obs.width;
      });

      // Draw dino
      const legOffset = Math.floor(game.frameCount / 5) % 2 === 0 ? 0 : 4;
      ctx.fillStyle = "#00d4ff";
      ctx.fillRect(game.dino.x, game.dino.y, game.dino.width, game.dino.height - 8);
      // Legs
      ctx.fillRect(game.dino.x + 5, game.dino.y + 32 + legOffset, 8, 8 - legOffset);
      ctx.fillRect(game.dino.x + 27, game.dino.y + 32 - legOffset, 8, 8 + legOffset);
      // Eye
      ctx.fillStyle = "#fff";
      ctx.fillRect(game.dino.x + 28, game.dino.y + 8, 6, 6);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(game.dino.x + 30, game.dino.y + 10, 3, 3);

      // Update score
      game.frameCount++;
      if (game.frameCount % 10 === 0) {
        setScore((s) => s + 1);
      }

      // Increase speed
      if (game.frameCount % 500 === 0) {
        game.speed += 0.5;
      }

      // Draw score
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`HI ${highScore.toString().padStart(5, "0")}`, canvas.width - 10, 25);
      ctx.fillText(score.toString().padStart(5, "0"), canvas.width - 10, 45);

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(game.animationId);
  }, [gameStarted, gameOver, score, highScore]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        onClick={jump}
        className="rounded-xl border-2 border-cyan-500/30 cursor-pointer bg-[#1a1a2e] w-full max-w-[400px]"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-cyan-400/60">
        Press SPACE or tap to jump
      </div>
    </div>
  );
}


// Animated Background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
      
      {/* Animated grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          animation: "gridMove 20s linear infinite",
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyan-500/20"
          style={{
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

      {/* Server rack illustration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
      
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

// Server Status Component
function ServerStatus() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  useEffect(() => {
    const statuses = [
      "Checking server health...",
      "Updating database schemas...",
      "Optimizing performance...",
      "Clearing cache...",
      "Restarting services...",
      "Almost there...",
    ];

    const interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = p + Math.random() * 3;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        setStatusText(statuses[Math.floor((newProgress / 100) * statuses.length)]);
        return newProgress;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-cyan-400">{statusText}</span>
        <span className="text-cyan-400 font-mono">{Math.floor(progress)}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span>Maintenance in progress</span>
      </div>
    </div>
  );
}

// Countdown Timer
function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetTime.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div className="flex gap-4">
      {[
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Minutes" },
        { value: timeLeft.seconds, label: "Seconds" },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800/80 backdrop-blur rounded-xl flex items-center justify-center border border-cyan-500/20">
            <span className="text-2xl md:text-3xl font-bold text-cyan-400 font-mono">
              {item.value.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Main Maintenance Page
export default function MaintenancePage() {
  const [showGame, setShowGame] = useState(false);
  const estimatedEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/20">
              <Wrench className="w-12 h-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Server className="w-3 h-3 text-yellow-900" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Under Maintenance
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            We&apos;re upgrading our servers to serve you better. 
            Please check back soon!
          </p>
        </div>

        {/* Server Status */}
        <div className="flex justify-center">
          <ServerStatus />
        </div>

        {/* Countdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Estimated time remaining</span>
          </div>
          <div className="flex justify-center">
            <CountdownTimer targetTime={estimatedEndTime} />
          </div>
        </div>

        {/* Game Section */}
        <div className="pt-8 space-y-4">
          <button
            onClick={() => setShowGame(!showGame)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-500/30 rounded-xl text-cyan-400 transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${showGame ? "animate-spin" : ""}`} />
            {showGame ? "Hide Game" : "Play while you wait!"}
          </button>

          {showGame && (
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DinoGame />
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="pt-8 text-sm text-slate-500">
          <p>Need urgent assistance?</p>
          <a 
            href="https://wa.me/6281234567890" 
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Contact us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
