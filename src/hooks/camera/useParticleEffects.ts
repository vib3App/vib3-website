'use client';

import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  emoji?: string;
  color?: string;
}

type EffectType = 'none' | 'sparkle' | 'hearts' | 'confetti' | 'snow' | 'fire';
const EFFECT_NAMES: EffectType[] = ['none', 'sparkle', 'hearts', 'confetti', 'snow', 'fire'];

const SPAWN_RATES: Record<EffectType, number> = {
  none: 0, sparkle: 3, hearts: 2, confetti: 5, snow: 3, fire: 4,
};

function createParticle(effect: EffectType, w: number, h: number): Particle {
  const base = {
    opacity: 1,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 4,
    life: 0,
    maxLife: 60 + Math.random() * 120,
  };

  switch (effect) {
    case 'sparkle':
      return { ...base, x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, size: 10 + Math.random() * 18, emoji: '⭐', maxLife: 30 + Math.random() * 60 };
    case 'hearts':
      return { ...base, x: Math.random() * w, y: h + 20, vx: (Math.random() - 0.5) * 2, vy: -(1 + Math.random() * 2), size: 18 + Math.random() * 14, emoji: ['❤️', '💕', '💖', '💗'][Math.floor(Math.random() * 4)] };
    case 'confetti':
      return { ...base, x: Math.random() * w, y: -20, vx: (Math.random() - 0.5) * 3, vy: 1 + Math.random() * 3, size: 6 + Math.random() * 8, rotationSpeed: (Math.random() - 0.5) * 10, color: ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f', '#ff8800'][Math.floor(Math.random() * 7)] };
    case 'snow':
      return { ...base, x: Math.random() * w, y: -20, vx: (Math.random() - 0.5) * 1, vy: 0.5 + Math.random() * 1.5, size: 8 + Math.random() * 12, maxLife: 200 + Math.random() * 200, emoji: '❄️' };
    case 'fire':
      return { ...base, x: w * 0.2 + Math.random() * w * 0.6, y: h, vx: (Math.random() - 0.5) * 2, vy: -(2 + Math.random() * 3), size: 14 + Math.random() * 12, maxLife: 40 + Math.random() * 40, emoji: '🔥' };
    default:
      return { ...base, x: 0, y: 0, vx: 0, vy: 0, size: 0 };
  }
}

function updateAndDrawParticles(particles: Particle[], ctx: CanvasRenderingContext2D, w: number, h: number, effect: EffectType): Particle[] {
  return particles.filter(p => {
    p.life++;
    if (p.life > p.maxLife) return false;

    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.opacity = 1 - (p.life / p.maxLife);

    if (effect === 'snow') {
      p.vx += (Math.random() - 0.5) * 0.1;
      p.vx = Math.max(-1, Math.min(1, p.vx));
    }

    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);

    if (p.emoji) {
      ctx.font = `${p.size}px 'Apple Color Emoji', 'Segoe UI Emoji', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
    } else if (p.color) {
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }

    ctx.restore();
    return true;
  });
}

export function useParticleEffects(selectedEffect: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const effectType = EFFECT_NAMES[selectedEffect] || 'none';

  // Clear particles when effect changes
  useEffect(() => {
    particlesRef.current = [];
  }, [effectType]);

  // Animation loop for the visible overlay canvas
  useEffect(() => {
    if (effectType === 'none') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      const ctx = canvasRef.current?.getContext('2d');
      if (canvasRef.current && ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      return;
    }

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) { animFrameRef.current = requestAnimationFrame(loop); return; }

      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) { animFrameRef.current = requestAnimationFrame(loop); return; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn
      const rate = SPAWN_RATES[effectType];
      for (let i = 0; i < rate; i++) {
        if (Math.random() < 0.5) particlesRef.current.push(createParticle(effectType, canvas.width, canvas.height));
      }

      // Cap at 200
      if (particlesRef.current.length > 200) particlesRef.current = particlesRef.current.slice(-200);

      // Update & draw
      particlesRef.current = updateAndDrawParticles(particlesRef.current, ctx, canvas.width, canvas.height, effectType);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [effectType]);

  return { effectsCanvasRef: canvasRef };
}
