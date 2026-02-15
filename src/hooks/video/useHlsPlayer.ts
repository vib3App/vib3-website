'use client';

import { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import type { QualityLevel } from '@/components/video/player/types';

interface UseHlsPlayerOptions {
  src: string;
  onError?: (error: Error) => void;
}

interface HlsPlayerState {
  qualityLevels: QualityLevel[];
  currentQuality: number;
  hasError: boolean;
  errorMessage: string | null;
}

export function useHlsPlayer({ src, onError }: UseHlsPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [state, setState] = useState<HlsPlayerState>({
    qualityLevels: [],
    currentQuality: -1,
    hasError: false,
    errorMessage: null,
  });

  // Initialize HLS or native video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset error state on new source
    setState(prev => ({ ...prev, hasError: false, errorMessage: null }));

    const isHls = src.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        // Optimized for fast startup - NOT low latency live streaming
        lowLatencyMode: false,
        // Start at lowest quality for fast initial load, then adapt up
        startLevel: 0,
        // Faster ABR adaptation
        abrEwmaDefaultEstimate: 500000, // 500kbps initial estimate
        abrEwmaFastLive: 3,
        abrEwmaSlowLive: 9,
        abrEwmaFastVoD: 3,
        abrEwmaSlowVoD: 9,
        // Buffer settings for quick playback start
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000, // 60MB
        maxBufferHole: 0.5,
        // Start loading next segment before current finishes
        startFragPrefetch: true,
        // Keep less back buffer to save memory
        backBufferLength: 30,
        // Match quality to player size
        capLevelToPlayerSize: true,
        // Faster fragment loading
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 3,
        fragLoadingRetryDelay: 1000,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels: QualityLevel[] = data.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          label: level.height ? `${level.height}p` : `Level ${index}`,
        }));
        setState(prev => ({ ...prev, qualityLevels: levels }));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setState(prev => ({ ...prev, currentQuality: data.level }));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          const is404 = data.details === 'manifestLoadError' ||
                        data.details === 'manifestParsingError' ||
                        data.response?.code === 404;

          const errorMsg = is404
            ? 'Video not available'
            : `Playback error: ${data.details}`;

          setState(prev => ({
            ...prev,
            hasError: true,
            errorMessage: errorMsg,
          }));

          onError?.(new Error(errorMsg));
        }
      });
    } else {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, onError]);

  const changeQuality = (level: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = level;
    setState(prev => ({ ...prev, currentQuality: level }));
  };

  return {
    videoRef,
    hlsRef,
    ...state,
    changeQuality,
  };
}
