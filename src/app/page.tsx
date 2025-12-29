/**
 * Landing page with splash screen
 * Shows animated logo on first visit, then landing or redirects to feed
 */
'use client';

import { useState, useEffect } from 'react';
import { Header, Hero, Features, Creators, Footer } from '@/components/landing';
import { SplashScreen } from '@/components/ui/SplashScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  useEffect(() => {
    // Check if user has already seen splash this session
    const seen = sessionStorage.getItem('vib3_splash_seen');
    if (seen) {
      setShowSplash(false);
      setHasSeenSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('vib3_splash_seen', 'true');
    setShowSplash(false);
    setHasSeenSplash(true);
  };

  // Show splash on first visit
  if (showSplash && !hasSeenSplash) {
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
