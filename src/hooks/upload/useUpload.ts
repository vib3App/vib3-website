'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { VideoDraft } from '@/types';
import type { UploadStep } from './types';
import { useUploadDrafts } from './useUploadDrafts';
import { useUploadProcess } from './useUploadProcess';
import { logger } from '@/utils/logger';

export function useUpload(isAuthenticated: boolean, isAuthVerified: boolean) {
  const searchParams = useSearchParams();
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

  // Gap #32: Location tagging
  const [location, setLocation] = useState<string | null>(null);
  // Gap #33: @Mentions
  const [mentions, setMentions] = useState<string[]>([]);
  // Gap #34: Upload quality
  const [uploadQuality, setUploadQuality] = useState('auto');
  // Gap #37: Watermark
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);

  const resetForm = useCallback(() => {
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
    setLocation(null);
    setMentions([]);
    setUploadQuality('auto');
    setWatermarkEnabled(false);
    setWatermarkPosition('bottom-right');
    setWatermarkText('');
    setWatermarkOpacity(0.5);
  }, []);

  // Draft handlers
  const draftState = {
    uploadId, videoPreviewUrl, selectedThumbnail, caption, hashtags,
    visibility, allowComments, allowDuet, allowStitch, showSchedule, scheduleDate, scheduleTime,
  };
  const draftHandlers = {
    setCaption, setHashtags, setVisibility, setAllowComments, setAllowDuet, setAllowStitch,
    setSelectedThumbnail, setVideoPreviewUrl, setShowSchedule, setScheduleDate, setScheduleTime,
    setShowDrafts, setStep,
  };
  const { loadDrafts, handleSaveDraft, handleLoadDraft, handleDeleteDraft } = useUploadDrafts(
    draftState, draftHandlers, setDrafts, setIsSavingDraft, resetForm
  );

  // Upload process handlers
  const processState = {
    videoFile, caption, hashtags, selectedThumbnail, visibility,
    allowComments, allowDuet, allowStitch, showSchedule, scheduleDate, scheduleTime,
    location, mentions,
  };
  const processHandlers = { setStep, setUploadId, setUploadProgress, setThumbnailOptions, setError };
  const { handleUpload, handleCancelUpload, handleCustomThumbnail: uploadThumbnail } = useUploadProcess(
    processState, processHandlers
  );

  // Load drafts on mount
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      loadDrafts();
    }
  }, [isAuthenticated, isAuthVerified, loadDrafts]);

  // Handle video from camera recording
  useEffect(() => {
    if (!isAuthVerified || !isAuthenticated) return;
    if (searchParams.get('from') !== 'camera') return;

    const recordedVideoUrl = sessionStorage.getItem('recordedVideoUrl');
    if (!recordedVideoUrl) return;

    // Fetch the blob from the URL and create a File
    const loadRecordedVideo = async () => {
      try {
        const response = await fetch(recordedVideoUrl);
        const blob = await response.blob();
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });

        // Clean up sessionStorage
        sessionStorage.removeItem('recordedVideoUrl');
        sessionStorage.removeItem('recordingSpeed');

        // Set the video file and preview
        setVideoFile(file);
        setVideoPreviewUrl(recordedVideoUrl);
        setStep('edit');

        // Generate thumbnail
        const video = document.createElement('video');
        video.src = recordedVideoUrl;
        video.currentTime = 1;
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d')?.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg');
          setSelectedThumbnail(thumbnail);
          setThumbnailOptions([thumbnail]);
        };
      } catch (err) {
        logger.error('Failed to load recorded video:', err);
        setError('Failed to load recorded video');
      }
    };

    loadRecordedVideo();
  }, [isAuthVerified, isAuthenticated, searchParams]);

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

    const video = document.createElement('video');
    video.src = url;
    video.currentTime = 1;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
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

  const handleCustomThumbnail = useCallback(async (file: File) => {
    const url = await uploadThumbnail(file, uploadId);
    if (url) setSelectedThumbnail(url);
  }, [uploadThumbnail, uploadId]);

  const goBack = useCallback(() => {
    if (step === 'edit') setStep('select');
    else if (step === 'details') setStep('edit');
  }, [step]);

  return {
    step, setStep, videoFile, videoPreviewUrl, thumbnailOptions,
    selectedThumbnail, setSelectedThumbnail, caption, setCaption,
    hashtags, setHashtags, selectedVibe, setSelectedVibe, visibility, setVisibility,
    allowComments, setAllowComments, allowDuet, setAllowDuet, allowStitch, setAllowStitch,
    uploadProgress, isDragging, showSchedule, setShowSchedule,
    scheduleDate, setScheduleDate, scheduleTime, setScheduleTime,
    drafts, showDrafts, setShowDrafts, isSavingDraft, error,
    handleFileSelect, handleDrop,
    handleDragOver: useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []),
    handleDragLeave: useCallback(() => setIsDragging(false), []),
    handleCustomThumbnail, handleUpload, handleSaveDraft,
    handleLoadDraft, handleDeleteDraft, handleCancelUpload, resetForm, goBack,
    // Gap #32-37: Upload form features
    location, setLocation, mentions, setMentions,
    uploadQuality, setUploadQuality,
    watermarkEnabled, setWatermarkEnabled,
    watermarkPosition, setWatermarkPosition,
    watermarkText, setWatermarkText,
    watermarkOpacity, setWatermarkOpacity,
  };
}
