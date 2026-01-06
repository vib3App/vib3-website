'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
  loop?: boolean;
  autoPlay?: boolean;
}

/**
 * Animated logo component that plays the VIB3 cyclone logo video
 * Falls back to static image if video fails to load (e.g., .mov on Chrome)
 */
export function AnimatedLogo({
  size = 100,
  className = '',
  loop = true,
  autoPlay = true,
}: AnimatedLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => setIsLoaded(true);
    const handleError = () => setUseFallback(true);

    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('error', handleError);

    // Timeout fallback - if video doesn't load in 2s, show static image
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        setUseFallback(true);
      }
    }, 2000);

    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [isLoaded]);

  // Show static logo if video can't load
  if (useFallback) {
    return (
      <div
        className={`relative ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src="/vib3-logo.png"
          alt="VIB3"
          width={size}
          height={size}
          className="object-contain animate-pulse"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Fallback while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 animate-pulse" />
        </div>
      )}

      <video
        ref={videoRef}
        src="/videos/logo_animation.mov"
        width={size}
        height={size}
        autoPlay={autoPlay}
        loop={loop}
        muted
        playsInline
        className={`object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export default AnimatedLogo;
