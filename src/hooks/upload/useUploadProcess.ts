'use client';

import { useCallback, useRef } from 'react';
import { uploadApi, TusUploadManager } from '@/services/api';
import type { UploadStep } from './types';
import { logger } from '@/utils/logger';

interface UploadProcessState {
  videoFile: File | null;
  caption: string;
  hashtags: string[];
  selectedThumbnail: string | null;
  visibility: 'public' | 'followers' | 'private';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  showSchedule: boolean;
  scheduleDate: string;
  scheduleTime: string;
}

interface UploadProcessHandlers {
  setStep: (step: UploadStep) => void;
  setUploadId: (id: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setThumbnailOptions: React.Dispatch<React.SetStateAction<string[]>>;
  setError: (error: string | null) => void;
}

export function useUploadProcess(
  state: UploadProcessState,
  handlers: UploadProcessHandlers
) {
  const tusManagerRef = useRef<TusUploadManager | null>(null);

  const handleUpload = useCallback(async () => {
    if (!state.videoFile) return;

    handlers.setStep('uploading');
    handlers.setError(null);

    try {
      const tusManager = new TusUploadManager();
      tusManagerRef.current = tusManager;

      tusManager.onProgress = (progress) => {
        handlers.setUploadProgress(progress);
      };

      tusManager.onComplete = async (id) => {
        handlers.setUploadId(id);
        handlers.setStep('processing');

        try {
          const { thumbnails } = await uploadApi.generateThumbnails(id);
          handlers.setThumbnailOptions(prev => [...thumbnails, ...prev]);
        } catch {
          // Keep local thumbnail if server fails
        }

        try {
          const scheduledFor = state.showSchedule && state.scheduleDate && state.scheduleTime
            ? new Date(`${state.scheduleDate}T${state.scheduleTime}`).toISOString()
            : undefined;

          await uploadApi.publishVideo({
            uploadId: id,
            caption: state.caption,
            hashtags: state.hashtags,
            thumbnailUrl: state.selectedThumbnail || undefined,
            isPublic: state.visibility === 'public',
            allowComments: state.allowComments,
            allowDuet: state.allowDuet,
            allowStitch: state.allowStitch,
            scheduledFor,
          });

          handlers.setStep('complete');
        } catch {
          handlers.setError('Failed to publish video. Please try again.');
          handlers.setStep('details');
        }
      };

      tusManager.onError = (err) => {
        handlers.setError(err.message);
        handlers.setStep('edit');
      };

      await tusManager.start(state.videoFile);
    } catch {
      handlers.setError('Upload failed. Please try again.');
      handlers.setStep('edit');
    }
  }, [state, handlers]);

  const handleCancelUpload = useCallback(() => {
    if (tusManagerRef.current) {
      tusManagerRef.current.abort();
    }
    handlers.setStep('edit');
    handlers.setUploadProgress(0);
  }, [handlers]);

  const handleCustomThumbnail = useCallback(async (file: File, uploadId: string | null) => {
    if (!uploadId) return;

    try {
      const { thumbnailUrl } = await uploadApi.uploadThumbnail(uploadId, file);
      handlers.setThumbnailOptions(prev => [thumbnailUrl, ...prev]);
      return thumbnailUrl;
    } catch (err) {
      logger.error('Failed to upload thumbnail:', err);
      return null;
    }
  }, [handlers]);

  return {
    handleUpload,
    handleCancelUpload,
    handleCustomThumbnail,
  };
}
