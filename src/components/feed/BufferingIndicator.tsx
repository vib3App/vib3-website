'use client';

import { useState, useEffect, useRef } from 'react';

interface BufferingIndicatorProps {
  /** Ref to the video element to monitor */
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * BufferingIndicator - Shows a centered spinner overlay when the video
 * is buffering. Listens to the video element's `waiting` and `playing`
 * events to toggle visibility.
 */
export function BufferingIndicator({ videoRef }: BufferingIndicatorProps) {
  const [isBuffering, setIsBuffering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => {
      // Small delay to avoid flickering for very short buffers
      timeoutRef.current = setTimeout(() => {
        setIsBuffering(true);
      }, 200);
    };

    const handlePlaying = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsBuffering(false);
    };

    const handleCanPlay = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsBuffering(false);
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [videoRef]);

  if (!isBuffering) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}
