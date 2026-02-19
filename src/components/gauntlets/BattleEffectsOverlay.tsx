'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export type BattleEffectType = 'fire' | 'ko' | 'confetti' | 'combo' | null;

interface BattleEffectsOverlayProps {
  effect: BattleEffectType;
  comboCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export function BattleEffectsOverlay({ effect, comboCount = 0 }: BattleEffectsOverlayProps) {
  const [active, setActive] = useState<BattleEffectType>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const nextIdRef = useRef(0);

  // Spawn particles based on effect type
  const spawnParticles = useCallback((type: BattleEffectType) => {
    if (!type) return;
    const newParticles: Particle[] = [];

    if (type === 'fire') {
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: nextIdRef.current++,
          x: Math.random() * 100,
          y: 100 + Math.random() * 10,
          vx: (Math.random() - 0.5) * 2,
          vy: -(2 + Math.random() * 3),
          size: 4 + Math.random() * 6,
          color: ['#EF4444', '#F97316', '#FBBF24', '#F59E0B'][Math.floor(Math.random() * 4)],
          life: 60 + Math.random() * 40,
          maxLife: 100,
        });
      }
    }

    if (type === 'confetti') {
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: nextIdRef.current++,
          x: Math.random() * 100,
          y: -5,
          vx: (Math.random() - 0.5) * 3,
          vy: 1 + Math.random() * 2,
          size: 3 + Math.random() * 5,
          color: ['#A855F7', '#14B8A6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'][Math.floor(Math.random() * 6)],
          life: 100 + Math.random() * 60,
          maxLife: 160,
        });
      }
    }

    if (type === 'combo') {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i;
        newParticles.push({
          id: nextIdRef.current++,
          x: 50,
          y: 50,
          vx: Math.cos(angle) * (2 + Math.random()),
          vy: Math.sin(angle) * (2 + Math.random()),
          size: 3 + Math.random() * 4,
          color: ['#FBBF24', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 3)],
          life: 40 + Math.random() * 30,
          maxLife: 70,
        });
      }
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx * 0.3,
          y: p.y + p.vy * 0.3,
          life: p.life - 1,
        }))
        .filter((p) => p.life > 0);

      particlesRef.current.forEach((p) => {
        const alpha = p.life / p.maxLife;
        const px = (p.x / 100) * canvas.width;
        const py = (p.y / 100) * canvas.height;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Trigger effects
  useEffect(() => {
    if (effect) {
      setActive(effect);
      spawnParticles(effect);
      const timer = setTimeout(() => setActive(null), effect === 'ko' ? 3000 : 2000);
      return () => clearTimeout(timer);
    }
  }, [effect, spawnParticles]);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
      {/* Canvas for particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* KO overlay */}
      {active === 'ko' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="animate-ko-effect">
            <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-red-600 to-red-900 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]">
              K.O.
            </span>
          </div>
        </div>
      )}

      {/* Fire overlay */}
      {active === 'fire' && (
        <div className="absolute inset-0 border-2 border-orange-500/50 rounded-lg animate-pulse" />
      )}

      {/* Confetti text */}
      {active === 'confetti' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-bounce text-center">
            <span className="text-4xl font-black text-yellow-400 drop-shadow-lg">VICTORY!</span>
          </div>
        </div>
      )}

      {/* Combo counter */}
      {active === 'combo' && comboCount > 1 && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-3xl font-black text-orange-400 drop-shadow-lg">
            {comboCount}x COMBO!
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes ko-effect {
          0% { transform: scale(5) rotate(-10deg); opacity: 0; }
          30% { transform: scale(1) rotate(0); opacity: 1; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ko-effect { animation: ko-effect 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
