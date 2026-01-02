'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { uploadApi, TusUploadManager } from '@/services/api';
import type { VideoDraft } from '@/types';

export type UploadStep = 'select' | 'edit' | 'details' | 'uploading' | 'processing' | 'complete';

export interface UploadState {
  step: UploadStep;
  videoFile: File | null;
  videoPreviewUrl: string | null;
  uploadId: string | null;
  thumbnailOptions: string[];
  selectedThumbnail: string | null;
  caption: string;
  hashtags: string[];
  selectedVibe: string | null;
  visibility: 'public' | 'followers' | 'private';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  uploadProgress: number;
  isDragging: boolean;
  showSchedule: boolean;
  scheduleDate: string;
  scheduleTime: string;
  drafts: VideoDraft[];
  showDrafts: boolean;
  isSavingDraft: boolean;
  error: string | null;
}

export function useUpload(isAuthenticated: boolean, isAuthVerified: boolean) {
  const [step, setStep] = useState<UploadStep>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [thumbnailOptions, setThumbnailOptions] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [drafts, setDrafts] = useState<VideoDraft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tusManagerRef = useRef<TusUploadManager | null>(null);

  // Load drafts on mount - wait for auth to be verified first
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      loadDrafts();
    }
  }, [isAuthenticated, isAuthVerified]);

  const loadDrafts = async () => {
    try {
      const data = await uploadApi.getDrafts();
      setDrafts(data);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB');
      return;
    }

    setError(null);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
    setStep('edit');

    // Generate local thumbnail
    const video = document.createElement('video');
    video.src = url;
    video.currentTime = 1;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg');
      setSelectedThumbnail(thumbnail);
      setThumbnailOptions([thumbnail]);
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCustomThumbnail = async (file: File) => {
    if (!uploadId) return;

    try {
      const { thumbnailUrl } = await uploadApi.uploadThumbnail(uploadId, file);
      setThumbnailOptions(prev => [thumbnailUrl, ...prev]);
      setSelectedThumbnail(thumbnailUrl);
    } catch (err) {
      console.error('Failed to upload thumbnail:', err);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    setStep('uploading');
    setError(null);

    try {
      const tusManager = new TusUploadManager();
      tusManagerRef.current = tusManager;

      tusManager.onProgress = (progress) => {
        setUploadProgress(progress);
      };

      tusManager.onComplete = async (id) => {
        setUploadId(id);
        setStep('processing');

        try {
          const { thumbnails } = await uploadApi.generateThumbnails(id);
          setThumbnailOptions(prev => [...thumbnails, ...prev]);
        } catch {
          // Keep local thumbnail if server fails
        }

        try {
          const scheduledFor = showSchedule && scheduleDate && scheduleTime
            ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
            : undefined;

          await uploadApi.publishVideo({
            uploadId: id,
            caption,
            hashtags,
            thumbnailUrl: selectedThumbnail || undefined,
            isPublic: visibility === 'public',
            allowComments,
            allowDuet,
            allowStitch,
            scheduledFor,
          });

          setStep('complete');
        } catch {
          setError('Failed to publish video. Please try again.');
          setStep('details');
        }
      };

      tusManager.onError = (err) => {
        setError(err.message);
        setStep('edit');
      };

      await tusManager.start(videoFile);
    } catch {
      setError('Upload failed. Please try again.');
      setStep('edit');
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await uploadApi.createDraft({
        uploadId: uploadId || undefined,
        videoUrl: videoPreviewUrl || undefined,
        thumbnailUrl: selectedThumbnail || undefined,
        caption,
        hashtags,
        mentions: [],
        isPublic: visibility === 'public',
        allowComments,
        allowDuet,
        allowStitch,
        scheduledFor: showSchedule && scheduleDate && scheduleTime
          ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
          : undefined,
      });
      await loadDrafts();
      resetForm();
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleLoadDraft = async (draft: VideoDraft) => {
    setCaption(draft.caption);
    setHashtags(draft.hashtags);
    setVisibility(draft.isPublic ? 'public' : 'private');
    setAllowComments(draft.allowComments);
    setAllowDuet(draft.allowDuet);
    setAllowStitch(draft.allowStitch);
    if (draft.thumbnailUrl) setSelectedThumbnail(draft.thumbnailUrl);
    if (draft.videoUrl) setVideoPreviewUrl(draft.videoUrl);
    if (draft.scheduledFor) {
      setShowSchedule(true);
      const date = new Date(draft.scheduledFor);
      setScheduleDate(date.toISOString().split('T')[0]);
      setScheduleTime(date.toTimeString().slice(0, 5));
    }
    setShowDrafts(false);
    setStep(draft.videoUrl ? 'details' : 'select');
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await uploadApi.deleteDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (err) {
      console.error('Failed to delete draft:', err);
    }
  };

  const handleCancelUpload = () => {
    if (tusManagerRef.current) {
      tusManagerRef.current.abort();
    }
    setStep('edit');
    setUploadProgress(0);
  };

  const resetForm = () => {
    setStep('select');
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setUploadId(null);
    setThumbnailOptions([]);
    setSelectedThumbnail(null);
    setCaption('');
    setHashtags([]);
    setSelectedVibe(null);
    setUploadProgress(0);
    setShowSchedule(false);
    setScheduleDate('');
    setScheduleTime('');
    setError(null);
  };

  const goBack = () => {
    if (step === 'edit') setStep('select');
    else if (step === 'details') setStep('edit');
  };

  return {
    // State
    step,
    setStep,
    videoFile,
    videoPreviewUrl,
    thumbnailOptions,
    selectedThumbnail,
    setSelectedThumbnail,
    caption,
    setCaption,
    hashtags,
    setHashtags,
    selectedVibe,
    setSelectedVibe,
    visibility,
    setVisibility,
    allowComments,
    setAllowComments,
    allowDuet,
    setAllowDuet,
    allowStitch,
    setAllowStitch,
    uploadProgress,
    isDragging,
    showSchedule,
    setShowSchedule,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    drafts,
    showDrafts,
    setShowDrafts,
    isSavingDraft,
    error,

    // Actions
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleCustomThumbnail,
    handleUpload,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    handleCancelUpload,
    resetForm,
    goBack,
  };
}
