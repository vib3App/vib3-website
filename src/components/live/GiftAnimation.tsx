'use client';

import { useEffect, useState, useMemo } from 'react';

interface GiftAnimationProps {
  giftName: string;
  giftIcon: string;
  senderName: string;
  value: number;
  onComplete: () => void;
}

// Generate random particles for the gift burst effect
function useParticles(count: number) {
  return useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: Math.random() * -150 - 20,
    delay: Math.random() * 0.3,
    scale: 0.5 + Math.random() * 0.8,
    rotation: Math.random() * 360,
    emoji: ['✨', '⭐', '💫', '🌟', '💖'][Math.floor(Math.random() * 5)],
  })), [count]);
}

export function GiftAnimation({ giftName, giftIcon, senderName, value, onComplete }: GiftAnimationProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'burst' | 'exit'>('enter');
  const isHighValue = value >= 100;
  const particleCount = isHighValue ? 20 : 8;
  const particles = useParticles(particleCount);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 300);
    const t2 = setTimeout(() => setPhase('burst'), 600);
    const t3 = setTimeout(() => setPhase('exit'), isHighValue ? 3500 : 2500);
    const t4 = setTimeout(onComplete, isHighValue ? 4000 : 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete, isHighValue]);

  return (
    <div className="relative">
      {/* Particle burst */}
      {(phase === 'burst' || phase === 'show') && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {particles.map(p => (
            <span
              key={p.id}
              className="absolute left-1/2 top-1/2 transition-all"
              style={{
                transform: phase === 'burst'
                  ? `translate(${p.x}px, ${p.y}px) scale(${p.scale}) rotate(${p.rotation}deg)`
                  : 'translate(-50%, -50%) scale(0)',
                opacity: phase === 'burst' ? 0 : 1,
                transitionDuration: '1.5s',
                transitionDelay: `${p.delay}s`,
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fontSize: isHighValue ? '20px' : '14px',
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>
      )}

      {/* Gift card */}
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
        isHighValue
          ? 'bg-gradient-to-r from-yellow-500/30 to-purple-500/30 border border-yellow-500/40 backdrop-blur-lg'
          : 'glass'
      } ${
        phase === 'enter' ? 'opacity-0 translate-x-[-100%] scale-75' :
        phase === 'exit' ? 'opacity-0 translate-x-[100%] scale-75' :
        'opacity-100 translate-x-0 scale-100'
      }`}>
        {/* Animated icon */}
        <span className={`text-3xl transition-transform duration-500 ${
          phase === 'burst' ? 'scale-150' : 'scale-100'
        }`}>
          {giftIcon}
        </span>
        <div>
          <p className="text-white text-sm font-medium">
            <span className="text-purple-300">@{senderName}</span> sent
          </p>
          <p className={`text-xs ${isHighValue ? 'text-yellow-300 font-bold' : 'text-white/70'}`}>
            {giftName} ({value} coins)
          </p>
        </div>
        {/* Combo indicator for high-value gifts */}
        {isHighValue && phase !== 'exit' && (
          <div className="ml-2 px-2 py-0.5 bg-yellow-500/30 rounded-full text-yellow-300 text-xs font-bold animate-bounce">
            WOW!
          </div>
        )}
      </div>

      {/* Screen-wide glow for high-value gifts */}
      {isHighValue && phase === 'burst' && (
        <div className="fixed inset-0 pointer-events-none z-[-1] animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent" />
        </div>
      )}
    </div>
  );
}
