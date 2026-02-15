/**
 * HLS.js integration hook
 * Handles HLS initialization and cleanup
 */
'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
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

interface HLSState {
  isLoading: boolean;
  error: string | null;
  qualities: VideoQuality[];
  currentQuality: VideoQuality;
  /** Bumped to trigger re-init */
  version: number;
}

export function useHLS({ src, autoPlay = false }: UseHLSOptions): UseHLSReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [state, setState] = useState<HLSState>({
    isLoading: true,
    error: null,
    qualities: ['auto'],
    currentQuality: 'auto',
    version: 0,
  });

  // Derive a stable "init key" so the effect re-runs when src or version changes
  const initKey = useMemo(() => `${src ?? ''}::${state.version}`, [src, state.version]);

  useEffect(() => {
    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!src || !videoRef.current) return;

    const video = videoRef.current;

    // Use a cancelled flag to avoid setting state after cleanup
    let cancelled = false;

    const safeSetState = (updater: (prev: HLSState) => HLSState) => {
      if (!cancelled) setState(updater);
    };

    // Reset state for new initialization via rAF to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      safeSetState(prev => ({ ...prev, isLoading: true, error: null }));
    });

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
          const availableQualities: VideoQuality[] = ['auto'];
          data.levels.forEach((level) => {
            if (level.height >= 1080) availableQualities.push('1080p');
            else if (level.height >= 720) availableQualities.push('720p');
            else if (level.height >= 480) availableQualities.push('480p');
            else if (level.height >= 360) availableQualities.push('360p');
          });
          safeSetState(prev => ({
            ...prev,
            isLoading: false,
            qualities: [...new Set(availableQualities)],
          }));

          if (autoPlay) {
            video.play().catch(() => {
              // Autoplay blocked, user needs to interact
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            safeSetState(prev => ({
              ...prev,
              error: data.type === Hls.ErrorTypes.NETWORK_ERROR
                ? 'Network error loading video'
                : 'Error playing video',
              isLoading: false,
            }));
          }
        });

        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          safeSetState(prev => ({ ...prev, isLoading: false }));
          if (autoPlay) video.play().catch(() => {});
        });
      } else {
        safeSetState(prev => ({
          ...prev,
          error: 'HLS not supported in this browser',
          isLoading: false,
        }));
      }
    } else {
      // Regular video file
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        safeSetState(prev => ({ ...prev, isLoading: false }));
      });
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initKey captures src and version
  }, [initKey, autoPlay]);

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
    setState(prev => ({ ...prev, currentQuality: quality }));
  }, []);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, version: prev.version + 1 }));
  }, []);

  return {
    videoRef,
    isLoading: state.isLoading,
    error: state.error,
    qualities: state.qualities,
    currentQuality: state.currentQuality,
    setQuality,
    retry,
  };
}
