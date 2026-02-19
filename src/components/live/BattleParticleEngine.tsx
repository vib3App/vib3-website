'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

export type ParticleEffect = 'sparks' | 'confetti' | 'fire' | 'ice_shatter' | null;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'rect' | 'triangle';
}

interface BattleParticleEngineProps {
  effect: ParticleEffect;
  /** Origin point as percentage of canvas (0-1) */
  originX?: number;
  originY?: number;
  className?: string;
}

const EFFECT_CONFIGS = {
  sparks: {
    count: 30,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#FFFF00'],
    speed: 6,
    life: 40,
    size: 3,
    gravity: 0.15,
    shapes: ['circle'] as Particle['shape'][],
  },
  confetti: {
    count: 60,
    colors: ['#A855F7', '#14B8A6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#10B981'],
    speed: 4,
    life: 80,
    size: 6,
    gravity: 0.05,
    shapes: ['rect', 'circle'] as Particle['shape'][],
  },
  fire: {
    count: 40,
    colors: ['#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FF0000'],
    speed: 3,
    life: 50,
    size: 5,
    gravity: -0.08,
    shapes: ['circle'] as Particle['shape'][],
  },
  ice_shatter: {
    count: 35,
    colors: ['#87CEEB', '#ADD8E6', '#B0E0E6', '#FFFFFF', '#E0FFFF'],
    speed: 8,
    life: 35,
    size: 4,
    gravity: 0.1,
    shapes: ['triangle', 'rect'] as Particle['shape'][],
  },
};

export function BattleParticleEngine({
  effect,
  originX = 0.5,
  originY = 0.5,
  className = '',
}: BattleParticleEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current?.parentElement) {
        const parent = canvasRef.current.parentElement;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        setDimensions({ w, h });
        canvasRef.current.width = w;
        canvasRef.current.height = h;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const spawnParticles = useCallback((effectType: NonNullable<ParticleEffect>) => {
    const config = EFFECT_CONFIGS[effectType];
    const cx = dimensions.w * originX;
    const cy = dimensions.h * originY;
    const newParticles: Particle[] = [];

    for (let i = 0; i < config.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = config.speed * (0.5 + Math.random());
      newParticles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: config.life * (0.6 + Math.random() * 0.4),
        maxLife: config.life,
        size: config.size * (0.5 + Math.random()),
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, [dimensions, originX, originY]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const effectType = effect;
    const config = effectType ? EFFECT_CONFIGS[effectType] : null;
    const gravity = config?.gravity || 0;

    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.life -= 1;
      p.rotation += p.rotationSpeed;

      if (p.life <= 0) return false;

      const alpha = Math.min(1, p.life / (p.maxLife * 0.3));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(-p.size, p.size);
        ctx.lineTo(p.size, p.size);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      return true;
    });

    animFrameRef.current = requestAnimationFrame(animate);
  }, [effect]);

  // Spawn on effect change
  useEffect(() => {
    if (effect) {
      spawnParticles(effect);
    }
  }, [effect, spawnParticles]);

  // Start/stop animation
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-30 ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
