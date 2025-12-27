/**
 * HLS.js integration hook
 * Handles HLS initialization and cleanup
 */
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Hls from 'hls.js';
import type { VideoQuality } from '@/types';

interface UseHLSOptions {
  src?: string;
  autoPlay?: boolean;
}

interface UseHLSReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
  error: string | null;
  qualities: VideoQuality[];
  currentQuality: VideoQuality;
  setQuality: (quality: VideoQuality) => void;
  retry: () => void;
}

export function useHLS({ src, autoPlay = false }: UseHLSOptions): UseHLSReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualities, setQualities] = useState<VideoQuality[]>(['auto']);
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>('auto');

  const destroyHLS = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const initHLS = useCallback(() => {
    if (!src || !videoRef.current) return;

    destroyHLS();
    setIsLoading(true);
    setError(null);

    const video = videoRef.current;

    // Check if HLS.js is needed (for .m3u8 streams)
    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setIsLoading(false);
          // Extract available qualities
          const availableQualities: VideoQuality[] = ['auto'];
          data.levels.forEach((level) => {
            if (level.height >= 1080) availableQualities.push('1080p');
            else if (level.height >= 720) availableQualities.push('720p');
            else if (level.height >= 480) availableQualities.push('480p');
            else if (level.height >= 360) availableQualities.push('360p');
          });
          setQualities([...new Set(availableQualities)]);

          if (autoPlay) {
            video.play().catch(() => {
              // Autoplay blocked, user needs to interact
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError(data.type === Hls.ErrorTypes.NETWORK_ERROR
              ? 'Network error loading video'
              : 'Error playing video');
            setIsLoading(false);
          }
        });

        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => {});
        });
      } else {
        setError('HLS not supported in this browser');
        setIsLoading(false);
      }
    } else {
      // Regular video file
      video.src = src;
      video.addEventListener('loadedmetadata', () => setIsLoading(false));
      if (autoPlay) video.play().catch(() => {});
    }
  }, [src, autoPlay, destroyHLS]);

  const setQuality = useCallback((quality: VideoQuality) => {
    if (!hlsRef.current) return;

    if (quality === 'auto') {
      hlsRef.current.currentLevel = -1;
    } else {
      const targetHeight = parseInt(quality.replace('p', ''));
      const levelIndex = hlsRef.current.levels.findIndex(
        (level) => level.height === targetHeight
      );
      if (levelIndex >= 0) {
        hlsRef.current.currentLevel = levelIndex;
      }
    }
    setCurrentQuality(quality);
  }, []);

  const retry = useCallback(() => {
    initHLS();
  }, [initHLS]);

  useEffect(() => {
    initHLS();
    return destroyHLS;
  }, [initHLS, destroyHLS]);

  return {
    videoRef,
    isLoading,
    error,
    qualities,
    currentQuality,
    setQuality,
    retry,
  };
}
