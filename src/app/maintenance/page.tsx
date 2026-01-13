"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Wrench, Server, Clock } from "lucide-react";

// Dino Game Component
function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gameRef = useRef({
    dino: { x: 50, y: 130, width: 35, height: 35, velocityY: 0, jumping: false },
    obstacles: [] as { x: number; width: number; height: number }[],
    groundY: 130,
    gravity: 0.8,
    jumpForce: -13,
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
      game.dino = { x: 50, y: 130, width: 35, height: 35, velocityY: 0, jumping: false };
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
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#334155";
        ctx.fillRect(0, game.groundY + 35, canvas.width, 2);
        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(game.dino.x, game.dino.y, game.dino.width, game.dino.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(game.dino.x + 24, game.dino.y + 6, 5, 5);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        if (gameOver) {
          ctx.fillText("GAME OVER!", canvas.width / 2, 60);
          ctx.font = "11px monospace";
          ctx.fillText(`Score: ${score}`, canvas.width / 2, 80);
        }
        ctx.font = "11px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("SPACE / TAP to play", canvas.width / 2, gameOver ? 100 : 80);
        game.animationId = requestAnimationFrame(gameLoop);
        return;
      }

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff15";
      for (let i = 0; i < 20; i++) {
        const x = (i * 37 + game.frameCount * 0.5) % canvas.width;
        const y = (i * 23) % 100;
        ctx.fillRect(x, y, 2, 2);
      }

      game.dino.velocityY += game.gravity;
      game.dino.y += game.dino.velocityY;
      if (game.dino.y >= game.groundY) {
        game.dino.y = game.groundY;
        game.dino.velocityY = 0;
        game.dino.jumping = false;
      }

      ctx.fillStyle = "#334155";
      ctx.fillRect(0, game.groundY + 35, canvas.width, 2);

      if (game.frameCount % Math.max(50, 90 - Math.floor(score / 5)) === 0) {
        const height = 25 + Math.random() * 15;
        game.obstacles.push({ x: canvas.width, width: 18 + Math.random() * 10, height });
      }

      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.speed;
        ctx.fillStyle = "#f87171";
        ctx.fillRect(obs.x, game.groundY + 35 - obs.height, obs.width, obs.height);
        if (
          game.dino.x < obs.x + obs.width &&
          game.dino.x + game.dino.width > obs.x &&
          game.dino.y + game.dino.height > game.groundY + 35 - obs.height
        ) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
        }
        return obs.x > -obs.width;
      });

      const legOffset = Math.floor(game.frameCount / 5) % 2 === 0 ? 0 : 3;
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(game.dino.x, game.dino.y, game.dino.width, game.dino.height - 6);
      ctx.fillRect(game.dino.x + 4, game.dino.y + 29 + legOffset, 7, 6 - legOffset);
      ctx.fillRect(game.dino.x + 24, game.dino.y + 29 - legOffset, 7, 6 + legOffset);
      ctx.fillStyle = "#fff";
      ctx.fillRect(game.dino.x + 24, game.dino.y + 6, 5, 5);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(game.dino.x + 26, game.dino.y + 8, 2, 2);

      game.frameCount++;
      if (game.frameCount % 10 === 0) setScore((s) => s + 1);
      if (game.frameCount % 500 === 0) game.speed += 0.5;

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`HI ${highScore.toString().padStart(4, "0")}`, canvas.width - 8, 20);
      ctx.fillText(score.toString().padStart(4, "0"), canvas.width - 8, 36);

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(game.animationId);
  }, [gameStarted, gameOver, score, highScore]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={170}
      onClick={jump}
      className="rounded-lg border border-cyan-500/40 cursor-pointer w-full max-w-[360px]"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// Server Status
function ServerStatus() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  useEffect(() => {
    const statuses = ["Checking server...", "Updating database...", "Optimizing...", "Clearing cache...", "Almost there..."];
    const interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = p + Math.random() * 3;
        if (newProgress >= 100) { clearInterval(interval); return 100; }
        setStatusText(statuses[Math.floor((newProgress / 100) * statuses.length)]);
        return newProgress;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-cyan-300 font-medium">{statusText}</span>
        <span className="text-cyan-300 font-mono font-bold">{Math.floor(progress)}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-300">
        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
        <span>Maintenance in progress</span>
      </div>
    </div>
  );
}

// Countdown
function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = targetTime.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div className="flex gap-2">
      {[
        { value: timeLeft.hours, label: "Jam" },
        { value: timeLeft.minutes, label: "Menit" },
        { value: timeLeft.seconds, label: "Detik" },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="w-12 h-12 bg-slate-800/90 backdrop-blur rounded-lg flex items-center justify-center border border-slate-700">
            <span className="text-lg font-bold text-cyan-300 font-mono">{item.value.toString().padStart(2, "0")}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function MaintenancePage() {
  const estimatedEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

  return (
    <div className="h-screen overflow-hidden relative flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center space-y-4 max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <Server className="w-2.5 h-2.5 text-yellow-900" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Under Maintenance
          </h1>
          <p className="text-slate-300 text-sm">Sedang upgrade server. Mohon tunggu sebentar!</p>
        </div>

        {/* Status */}
        <div className="flex justify-center">
          <ServerStatus />
        </div>

        {/* Countdown */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <Clock className="w-3 h-3" />
            <span className="text-xs">Estimasi waktu</span>
          </div>
          <div className="flex justify-center">
            <CountdownTimer targetTime={estimatedEndTime} />
          </div>
        </div>

        {/* Game - Always visible */}
        <div className="pt-2">
          <p className="text-xs text-slate-400 mb-2">🎮 Main game sambil menunggu:</p>
          <div className="flex justify-center">
            <DinoGame />
          </div>
        </div>

        {/* Contact */}
        <div className="text-xs text-slate-500 pt-2">
          <span>Butuh bantuan? </span>
          <a href="https://wa.me/6281234567890" className="text-cyan-400 hover:text-cyan-300">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
