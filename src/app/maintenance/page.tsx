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
        // Dark blue game background
        ctx.fillStyle = "#1e3a5f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(0, game.groundY + 35, canvas.width, 2);
        // Dino
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(game.dino.x, game.dino.y, game.dino.width, game.dino.height);
        ctx.fillStyle = "#1e3a5f";
        ctx.fillRect(game.dino.x + 24, game.dino.y + 6, 5, 5);
        // Text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        if (gameOver) {
          ctx.fillText("GAME OVER!", canvas.width / 2, 55);
          ctx.font = "13px Arial";
          ctx.fillText(`Score: ${score}`, canvas.width / 2, 75);
        }
        ctx.font = "13px Arial";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("Tekan SPACE atau TAP untuk main", canvas.width / 2, gameOver ? 95 : 75);
        game.animationId = requestAnimationFrame(gameLoop);
        return;
      }

      // Game running - dark blue bg
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Stars
      ctx.fillStyle = "#ffffff50";
      for (let i = 0; i < 15; i++) {
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

      // Ground
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(0, game.groundY + 35, canvas.width, 2);

      // Spawn obstacles
      if (game.frameCount % Math.max(50, 90 - Math.floor(score / 5)) === 0) {
        const height = 25 + Math.random() * 15;
        game.obstacles.push({ x: canvas.width, width: 18 + Math.random() * 10, height });
      }

      // Obstacles
      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.speed;
        ctx.fillStyle = "#ef4444";
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

      // Dino - yellow/gold color
      const legOffset = Math.floor(game.frameCount / 5) % 2 === 0 ? 0 : 3;
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(game.dino.x, game.dino.y, game.dino.width, game.dino.height - 6);
      ctx.fillRect(game.dino.x + 4, game.dino.y + 29 + legOffset, 7, 6 - legOffset);
      ctx.fillRect(game.dino.x + 24, game.dino.y + 29 - legOffset, 7, 6 + legOffset);
      // Eye
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(game.dino.x + 24, game.dino.y + 6, 5, 5);

      game.frameCount++;
      if (game.frameCount % 10 === 0) setScore((s) => s + 1);
      if (game.frameCount % 500 === 0) game.speed += 0.5;

      // Score
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`HI ${highScore.toString().padStart(4, "0")}`, canvas.width - 8, 20);
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(score.toString().padStart(4, "0"), canvas.width - 8, 38);

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
      className="rounded-xl border-2 border-blue-400 cursor-pointer w-full max-w-[360px] shadow-lg"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// Server Status
function ServerStatus() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Memulai...");

  useEffect(() => {
    const statuses = ["Memeriksa server...", "Update database...", "Optimasi...", "Membersihkan cache...", "Hampir selesai..."];
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
      <div className="flex justify-between text-sm">
        <span className="text-blue-800 font-semibold">{statusText}</span>
        <span className="text-blue-800 font-mono font-bold">{Math.floor(progress)}%</span>
      </div>
      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        <span>Maintenance sedang berlangsung</span>
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
    <div className="flex gap-3">
      {[
        { value: timeLeft.hours, label: "Jam" },
        { value: timeLeft.minutes, label: "Menit" },
        { value: timeLeft.seconds, label: "Detik" },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border-2 border-blue-300 shadow-md">
            <span className="text-xl font-bold text-blue-600 font-mono">{item.value.toString().padStart(2, "0")}</span>
          </div>
          <span className="text-xs text-blue-700 font-semibold mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function MaintenancePage() {
  const estimatedEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

  return (
    <div className="h-screen overflow-hidden relative flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300/30 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300/30 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300/30 rounded-full blur-2xl" />
      <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-yellow-300/30 rounded-full blur-2xl" />

      <div className="relative z-10 text-center space-y-4 max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
              <Server className="w-3 h-3 text-yellow-800" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800">
            Sedang Maintenance
          </h1>
          <p className="text-blue-700 text-base font-medium">
            Kami sedang upgrade server untuk pelayanan lebih baik!
          </p>
        </div>

        {/* Status */}
        <div className="flex justify-center">
          <ServerStatus />
        </div>

        {/* Countdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">Estimasi waktu selesai</span>
          </div>
          <div className="flex justify-center">
            <CountdownTimer targetTime={estimatedEndTime} />
          </div>
        </div>

        {/* Game */}
        <div className="pt-2">
          <p className="text-sm text-blue-700 font-semibold mb-2">🎮 Main game sambil menunggu:</p>
          <div className="flex justify-center">
            <DinoGame />
          </div>
        </div>

        {/* Contact */}
        <div className="text-sm text-blue-700 pt-1">
          <span>Butuh bantuan? </span>
          <a href="https://wa.me/6281234567890" className="text-pink-600 hover:text-pink-700 font-bold underline">
            Hubungi WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
