'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { AnimatedLogo } from './AnimatedLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<'spin' | 'pulse' | 'fadeOut'>('spin');
  const hasCompletedRef = useRef(false);

  // Animation timers - run only once on mount
  useEffect(() => {
    // Phase 1: Spin for 1.5s
    const spinTimer = setTimeout(() => {
      setPhase('pulse');
    }, 1500);

    // Phase 2: Pulse for 2s (about 3 pulses)
    const pulseTimer = setTimeout(() => {
      setPhase('fadeOut');
    }, 3500);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(pulseTimer);
    };
  }, []); // Empty deps - run only once

  // Handle completion after fadeOut phase
  useEffect(() => {
    if (phase !== 'fadeOut' || hasCompletedRef.current) return;

    // Small delay for fade animation
    const timer = setTimeout(() => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;

      // Check auth state at completion time
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        router.push('/feed');
      } else {
        onComplete();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [phase, router, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        phase === 'fadeOut' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Logo */}
      <div
        className={`relative ${
          phase === 'pulse' ? 'animate-logo-pulse' : ''
        }`}
      >
        <AnimatedLogo size={320} />
      </div>

      {/* Loading dots - appear after spin */}
      <div className={`flex gap-2 mt-8 transition-opacity duration-500 ${phase !== 'spin' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#22d3ee', animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#a855f7', animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#f97316', animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
