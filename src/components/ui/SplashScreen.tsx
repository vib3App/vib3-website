'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [phase, setPhase] = useState<'spin' | 'pulse' | 'fadeOut'>('spin');

  useEffect(() => {
    // Phase 1: Spin for 1.5s
    const spinTimer = setTimeout(() => {
      setPhase('pulse');
    }, 1500);

    // Phase 2: Pulse for 2s (about 3 pulses)
    const pulseTimer = setTimeout(() => {
      setPhase('fadeOut');
    }, 3500);

    // Phase 3: Fade out and redirect
    const completeTimer = setTimeout(() => {
      // Check auth after animation completes and loading is done
      if (!isLoading) {
        if (isAuthenticated) {
          router.push('/feed');
        } else {
          onComplete();
        }
      }
    }, 4000);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(pulseTimer);
      clearTimeout(completeTimer);
    };
  }, [isAuthenticated, isLoading, router, onComplete]);

  // If auth is still loading after animation, wait for it
  useEffect(() => {
    if (phase === 'fadeOut' && !isLoading) {
      if (isAuthenticated) {
        router.push('/feed');
      } else {
        onComplete();
      }
    }
  }, [phase, isLoading, isAuthenticated, router, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        phase === 'fadeOut' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Logo + Text spinning together */}
      <div
        className={`flex flex-col items-center ${
          phase === 'spin' ? 'animate-logo-spin' : phase === 'pulse' ? 'animate-logo-pulse' : ''
        }`}
      >
        {/* V3 Icon - CSS gradient recreation */}
        <div className="relative">
          {/* Glow effect behind */}
          <div
            className="absolute inset-0 blur-2xl opacity-60"
            style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #f97316 100%)',
              transform: 'scale(1.5)',
            }}
          />

          {/* The V3 symbol */}
          <svg
            viewBox="0 0 120 100"
            className="relative w-32 h-28 md:w-48 md:h-40"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5)) drop-shadow(0 0 40px rgba(34, 211, 238, 0.3))'
            }}
          >
            <defs>
              <linearGradient id="v3Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="35%" stopColor="#a855f7" />
                <stop offset="65%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            {/* V shape */}
            <path
              d="M10 10 L35 80 L60 10"
              fill="none"
              stroke="url(#v3Gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 3 shape */}
            <path
              d="M70 15 Q110 15 95 40 Q80 50 95 60 Q110 85 70 85"
              fill="none"
              stroke="url(#v3Gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Vib3 Text */}
        <div
          className="mt-4 text-4xl md:text-5xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))'
          }}
        >
          Vib3
        </div>
      </div>

      {/* Loading dots - appear after spin */}
      <div className={`flex gap-2 mt-12 transition-opacity duration-500 ${phase !== 'spin' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#22d3ee', animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#a855f7', animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#f97316', animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
