'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { videoApi } from '@/services/api/video';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

const STORAGE_KEY = 'echoOriginalVideoId';

export interface EchoMode {
  isActive: boolean;
  originalVideoId: string | null;
  originalVideo: Video | null;
  /** Clear the persisted target so the next camera session isn't still in echo mode. */
  exit: () => void;
}

/**
 * Camera companion for echo (side-by-side response) recordings.
 *
 * Triggered by `/camera?mode=echo` paired with an `echoOriginalVideoId`
 * in sessionStorage (set by /echo/[videoId]'s "Create Echo Response"
 * button). Loads the original video metadata so the camera page can
 * surface "Echo with @username" while recording.
 */
function readStoredVideoId(): string | null {
  if (typeof window === 'undefined') return null;
  try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function useEchoMode(): EchoMode {
  const searchParams = useSearchParams();
  const isActive = searchParams.get('mode') === 'echo';
  const [originalVideoId, setOriginalVideoId] = useState<string | null>(
    () => (isActive ? readStoredVideoId() : null),
  );
  const [originalVideo, setOriginalVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!isActive || !originalVideoId) return;
    let cancelled = false;
    (async () => {
      try {
        const video = await videoApi.getVideo(originalVideoId);
        if (!cancelled) setOriginalVideo(video);
      } catch (err) {
        logger.error('Failed to load echo original video:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [isActive, originalVideoId]);

  const exit = () => {
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
    setOriginalVideoId(null);
    setOriginalVideo(null);
  };

  return { isActive, originalVideoId, originalVideo, exit };
}
