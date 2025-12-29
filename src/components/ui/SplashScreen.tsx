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
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Phase 1: Spin for 1.5s
    const spinTimer = setTimeout(() => {
      setPhase('pulse');
      setShowText(true);
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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a1b26] transition-opacity duration-500 ${
        phase === 'fadeOut' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)' }}
        />
      </div>

      {/* Logo container */}
      <div
        className={`relative w-48 h-48 md:w-64 md:h-64 ${
          phase === 'spin' ? 'animate-logo-spin' : phase === 'pulse' ? 'animate-logo-pulse' : ''
        }`}
      >
        <Image
          src="/vib3-logo.png"
          alt="VIB3"
          fill
          priority
          className="object-contain drop-shadow-2xl"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.4)) drop-shadow(0 0 80px rgba(34, 211, 238, 0.2))'
          }}
        />
      </div>

      {/* Loading text */}
      <div
        className={`mt-8 transition-all duration-700 ${
          showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-white/60 text-sm tracking-widest uppercase">
          Welcome to the Vibe
        </p>
      </div>

      {/* Loading dots */}
      <div className={`flex gap-2 mt-6 transition-opacity duration-500 ${showText ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
