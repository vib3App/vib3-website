'use client';

import { useState, useCallback } from 'react';
import { CAMERA_SPEEDS } from './types';
import { mergeVideoClips, applyVideoSpeed } from '@/utils/videoMerge';
import { logger } from '@/utils/logger';
import type { RecordedClip } from './useCameraRecording';

/**
 * Manages recorded clips: add, remove, discard, combine, and preview.
 */
export function useClipManagement(selectedSpeed: number) {
  const [recordedClips, setRecordedClips] = useState<RecordedClip[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCombining, setIsCombining] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);

  const totalClipsDuration = recordedClips.reduce((acc, clip) => acc + clip.duration, 0);

  const addClip = useCallback((clip: RecordedClip) => {
    setRecordedClips(prev => [...prev, clip]);
  }, []);

  const removeLastClip = useCallback(() => {
    setRecordedClips(prev => {
      if (prev.length === 0) return prev;
      const lastClip = prev[prev.length - 1];
      URL.revokeObjectURL(lastClip.url);
      return prev.slice(0, -1);
    });
  }, []);

  const discardAllClips = useCallback(() => {
    recordedClips.forEach(clip => URL.revokeObjectURL(clip.url));
    setRecordedClips([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [recordedClips, previewUrl]);

  const combineClips = useCallback(async (): Promise<Blob | null> => {
    if (recordedClips.length === 0) return null;

    setIsCombining(true);
    setMergeProgress(0);

    try {
      let resultBlob: Blob;

      if (recordedClips.length === 1) {
        resultBlob = recordedClips[0].blob;
      } else {
        const allBlobs = recordedClips.map(clip => clip.blob);
        resultBlob = await mergeVideoClips(allBlobs, (progress) => {
          setMergeProgress(progress.percent * 0.6);
        });
      }

      const speed = CAMERA_SPEEDS[selectedSpeed]?.value || 1;
      if (speed !== 1) {
        resultBlob = await applyVideoSpeed(resultBlob, speed, (progress) => {
          setMergeProgress(60 + progress.percent * 0.4);
        });
      }

      const url = URL.createObjectURL(resultBlob);
      setPreviewUrl(url);
      return resultBlob;
    } catch (error) {
      logger.error('Failed to process clips:', error);
      const url = URL.createObjectURL(recordedClips[0].blob);
      setPreviewUrl(url);
      return recordedClips[0].blob;
    } finally {
      setIsCombining(false);
      setMergeProgress(0);
    }
  }, [recordedClips, selectedSpeed]);

  const discardPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  const getRecordedBlob = useCallback((): Blob | null => {
    if (recordedClips.length === 0) return null;
    if (recordedClips.length === 1) return recordedClips[0].blob;
    const allBlobs = recordedClips.map(clip => clip.blob);
    return new Blob(allBlobs, { type: 'video/webm' });
  }, [recordedClips]);

  return {
    recordedClips,
    totalClipsDuration,
    previewUrl,
    isCombining,
    mergeProgress,
    addClip,
    removeLastClip,
    discardAllClips,
    combineClips,
    discardPreview,
    getRecordedBlob,
  };
}
