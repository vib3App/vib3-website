/**
 * Landing page with splash screen
 * Shows animated logo on first visit, then landing or redirects to feed
 */
'use client';

import { useState, useEffect } from 'react';
import { Header, Hero, Features, Creators, Footer } from '@/components/landing';
import { SplashScreen } from '@/components/ui/SplashScreen';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!cancelled) {
        setMounted(true);
      }
      // Check if user has already seen splash this session
      const seen = sessionStorage.getItem('vib3_splash_seen');
      if (seen && !cancelled) {
        setShowSplash(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('vib3_splash_seen', 'true');
    setShowSplash(false);
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1a1b26]" />
    );
  }

  // Show splash on first visit
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Creators />
      </main>
      <Footer />
    </div>
  );
}
