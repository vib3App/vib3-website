'use client';

import { useCallback } from 'react';
import { uploadApi } from '@/services/api';
import type { VideoDraft } from '@/types';
import type { UploadStep } from './types';
import { logger } from '@/utils/logger';

interface DraftHandlers {
  setCaption: (caption: string) => void;
  setHashtags: (hashtags: string[]) => void;
  setVisibility: (visibility: 'public' | 'followers' | 'private') => void;
  setAllowComments: (allow: boolean) => void;
  setAllowDuet: (allow: boolean) => void;
  setAllowStitch: (allow: boolean) => void;
  setSelectedThumbnail: (thumbnail: string | null) => void;
  setVideoPreviewUrl: (url: string | null) => void;
  setShowSchedule: (show: boolean) => void;
  setScheduleDate: (date: string) => void;
  setScheduleTime: (time: string) => void;
  setShowDrafts: (show: boolean) => void;
  setStep: (step: UploadStep) => void;
}

interface DraftState {
  uploadId: string | null;
  videoPreviewUrl: string | null;
  selectedThumbnail: string | null;
  caption: string;
  hashtags: string[];
  visibility: 'public' | 'followers' | 'private';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  showSchedule: boolean;
  scheduleDate: string;
  scheduleTime: string;
}

export function useUploadDrafts(
  state: DraftState,
  handlers: DraftHandlers,
  setDrafts: React.Dispatch<React.SetStateAction<VideoDraft[]>>,
  setIsSavingDraft: React.Dispatch<React.SetStateAction<boolean>>,
  resetForm: () => void
) {
  const loadDrafts = useCallback(async () => {
    try {
      const data = await uploadApi.getDrafts();
      setDrafts(data);
    } catch (err) {
      logger.error('Failed to load drafts:', err);
    }
  }, [setDrafts]);

  const handleSaveDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      await uploadApi.createDraft({
        uploadId: state.uploadId || undefined,
        videoUrl: state.videoPreviewUrl || undefined,
        thumbnailUrl: state.selectedThumbnail || undefined,
        caption: state.caption,
        hashtags: state.hashtags,
        mentions: [],
        isPublic: state.visibility === 'public',
        allowComments: state.allowComments,
        allowDuet: state.allowDuet,
        allowStitch: state.allowStitch,
        scheduledFor: state.showSchedule && state.scheduleDate && state.scheduleTime
          ? new Date(`${state.scheduleDate}T${state.scheduleTime}`).toISOString()
          : undefined,
      });
      await loadDrafts();
      resetForm();
    } catch (err) {
      logger.error('Failed to save draft:', err);
    } finally {
      setIsSavingDraft(false);
    }
  }, [state, loadDrafts, resetForm, setIsSavingDraft]);

  const handleLoadDraft = useCallback((draft: VideoDraft) => {
    handlers.setCaption(draft.caption);
    handlers.setHashtags(draft.hashtags);
    handlers.setVisibility(draft.isPublic ? 'public' : 'private');
    handlers.setAllowComments(draft.allowComments);
    handlers.setAllowDuet(draft.allowDuet);
    handlers.setAllowStitch(draft.allowStitch);
    if (draft.thumbnailUrl) handlers.setSelectedThumbnail(draft.thumbnailUrl);
    if (draft.videoUrl) handlers.setVideoPreviewUrl(draft.videoUrl);
    if (draft.scheduledFor) {
      handlers.setShowSchedule(true);
      const date = new Date(draft.scheduledFor);
      handlers.setScheduleDate(date.toISOString().split('T')[0]);
      handlers.setScheduleTime(date.toTimeString().slice(0, 5));
    }
    handlers.setShowDrafts(false);
    handlers.setStep(draft.videoUrl ? 'details' : 'select');
  }, [handlers]);

  const handleDeleteDraft = useCallback(async (draftId: string) => {
    try {
      await uploadApi.deleteDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (err) {
      logger.error('Failed to delete draft:', err);
    }
  }, [setDrafts]);

  return {
    loadDrafts,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
  };
}
