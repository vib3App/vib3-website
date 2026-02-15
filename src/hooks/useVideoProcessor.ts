'use client';

import { useState, useCallback } from 'react';
import { videoProcessor, type ProcessingProgress, type VideoEdits } from '@/services/videoProcessor';

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
    generateThumbnail,
    reset,
  };
}
