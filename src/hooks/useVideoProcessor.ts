'use client';

import { useState, useCallback } from 'react';
import {
  videoProcessor,
  type ProcessingProgress,
  type VideoEdits,
  type FreezeFrame,
  type ClipEdit,
} from '@/services/videoProcessor';

export function useVideoProcessor() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProcessor = useCallback(async () => {
    if (videoProcessor.loaded) return true;

    setIsLoading(true);
    setError(null);

    try {
      const success = await videoProcessor.load(setProgress);
      return success;
    } catch (_err) {
      setError('Failed to load video processor');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processVideo = useCallback(
    async (
      input: File | Blob | string,
      edits: VideoEdits
    ): Promise<Blob | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        const result = await videoProcessor.processVideo(input, edits, setProgress);
        return result;
      } catch (_err) {
        setError('Video processing failed');
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const trimVideo = useCallback(
    async (
      input: File | Blob | string,
      startTime: number,
      endTime: number
    ): Promise<Blob | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        const result = await videoProcessor.trimVideo(
          input,
          startTime,
          endTime,
          setProgress
        );
        return result;
      } catch (_err) {
        setError('Trimming failed');
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  /** Gap 28: Split video at a time point */
  const splitVideo = useCallback(
    async (
      input: File | Blob | string,
      splitTime: number,
    ): Promise<[Blob, Blob] | null> => {
      setIsProcessing(true);
      setError(null);
      try {
        return await videoProcessor.splitVideo(input, splitTime, setProgress);
      } catch (_err) {
        setError('Split failed');
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  /** Gap 31: Apply transition between two clips */
  const applyTransition = useCallback(
    async (
      clipA: Blob,
      clipB: Blob,
      transitionType: string,
      transitionDuration: number,
      clip1Duration: number,
    ): Promise<Blob | null> => {
      setIsProcessing(true);
      setError(null);
      try {
        return await videoProcessor.applyTransition(
          clipA, clipB, transitionType, transitionDuration, clip1Duration, setProgress,
        );
      } catch (_err) {
        setError('Transition failed');
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  /** Gap 34: Insert freeze frames */
  const insertFreezeFrames = useCallback(
    async (
      input: File | Blob | string,
      freezeFrames: FreezeFrame[],
    ): Promise<Blob | null> => {
      setIsProcessing(true);
      setError(null);
      try {
        return await videoProcessor.insertFreezeFrames(input, freezeFrames, setProgress);
      } catch (_err) {
        setError('Freeze frame failed');
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  /** Gap 35: Apply per-clip speed changes */
  const processClipSpeeds = useCallback(
    async (
      input: File | Blob | string,
      clipEdits: ClipEdit[],
    ): Promise<Blob | null> => {
      setIsProcessing(true);
      setError(null);
      try {
        return await videoProcessor.processClipSpeeds(input, clipEdits, setProgress);
      } catch (_err) {
        setError('Speed processing failed');
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const generateThumbnail = useCallback(
    async (input: File | Blob | string, time?: number): Promise<string | null> => {
      try {
        return await videoProcessor.generateThumbnail(input, time);
      } catch {
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setProgress(null);
    setError(null);
  }, []);

  return {
    isLoading,
    isProcessing,
    progress,
    error,
    isLoaded: videoProcessor.loaded,
    loadProcessor,
    processVideo,
    trimVideo,
    splitVideo,
    applyTransition,
    insertFreezeFrames,
    processClipSpeeds,
    generateThumbnail,
    reset,
  };
}
