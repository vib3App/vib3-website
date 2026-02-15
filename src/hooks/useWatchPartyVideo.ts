'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { videoApi } from '@/services/api';
import type { WatchParty } from '@/types/collaboration';
import { logger } from '@/utils/logger';

/**
 * Manages HLS video loading and playback synchronization for a watch party.
 */
export function useWatchPartyVideo(party: WatchParty | null) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const loadedVideoIdRef = useRef<string | null>(null);

  // Load video via HLS when current video changes
  useEffect(() => {
    if (!party) return;
    const currentVideo = party.playlist[party.currentVideoIndex];
    if (!currentVideo) return;

    if (loadedVideoIdRef.current === currentVideo.videoId) return;
    loadedVideoIdRef.current = currentVideo.videoId;

    const loadVideo = async () => {
      try {
        const video = await videoApi.getVideo(currentVideo.videoId);
        const videoUrl = video.videoUrl;
        if (!videoUrl || !videoRef.current) return;

        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        const isHls = videoUrl.includes('.m3u8');

        if (isHls && Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, startPosition: party.currentPosition || 0 });
          hls.loadSource(videoUrl);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (party.status === 'playing') {
              videoRef.current?.play().catch(() => {});
            }
          });
          hlsRef.current = hls;
        } else if (isHls && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = videoUrl;
          videoRef.current.currentTime = party.currentPosition || 0;
          if (party.status === 'playing') {
            videoRef.current.play().catch(() => {});
          }
        } else {
          videoRef.current.src = videoUrl;
          videoRef.current.currentTime = party.currentPosition || 0;
          if (party.status === 'playing') {
            videoRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        logger.error('Failed to load video URL:', err);
      }
    };

    loadVideo();
  }, [party]);

  // Sync playback state (play/pause/seek) from polling
  useEffect(() => {
    if (!party || !videoRef.current || !loadedVideoIdRef.current) return;

    if (party.status === 'playing') {
      videoRef.current.play().catch(() => {});
    } else if (party.status === 'paused') {
      videoRef.current.pause();
    }

    const currentTime = videoRef.current.currentTime;
    if (Math.abs(currentTime - party.currentPosition) > 2) {
      videoRef.current.currentTime = party.currentPosition;
    }
  }, [party]);

  // Cleanup HLS on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return { videoRef, loadedVideoIdRef };
}
