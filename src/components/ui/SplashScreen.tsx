'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
      {/* Logo spinning */}
      <div
        className={`relative w-64 h-64 md:w-80 md:h-80 ${
          phase === 'spin' ? 'animate-logo-spin' : phase === 'pulse' ? 'animate-logo-pulse' : ''
        }`}
      >
        <Image
          src="/vib3-logo.png"
          alt="VIB3"
          fill
          priority
          className="object-contain"
        />
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
