'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { capsuleApi } from '@/services/api/capsule';
import { apiClient } from '@/services/api/client';
import { TusUploadManager } from '@/services/api/upload';
import { logger } from '@/utils/logger';

export function useCapsuleCreate() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [unlockTime, setUnlockTime] = useState('12:00');
  const [isPrivate, setIsPrivate] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewSeconds, setPreviewSeconds] = useState(3);
  const [notifyOnUnlock, setNotifyOnUnlock] = useState(true);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Track object URLs in refs so we can revoke them to prevent memory leaks
  const videoObjectUrlRef = useRef<string | null>(null);
  const coverObjectUrlRef = useRef<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous object URL before creating a new one
      if (videoObjectUrlRef.current) {
        URL.revokeObjectURL(videoObjectUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      videoObjectUrlRef.current = url;
      setVideoFile(file);
      setVideoPreviewUrl(url);
    }
  }, []);

  const handleCoverSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous object URL before creating a new one
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      coverObjectUrlRef.current = url;
      setCoverFile(file);
      setCoverPreviewUrl(url);
    }
  }, []);

  const clearVideo = useCallback(() => {
    if (videoObjectUrlRef.current) {
      URL.revokeObjectURL(videoObjectUrlRef.current);
      videoObjectUrlRef.current = null;
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
  }, []);

  const clearCover = useCallback(() => {
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
      coverObjectUrlRef.current = null;
    }
    setCoverFile(null);
    setCoverPreviewUrl(null);
  }, []);

  const addRecipient = useCallback(() => {
    if (recipientInput.trim() && !recipients.includes(recipientInput.trim())) {
      setRecipients([...recipients, recipientInput.trim()]);
      setRecipientInput('');
    }
  }, [recipientInput, recipients]);

  const removeRecipient = useCallback((username: string) => {
    setRecipients(recipients.filter(r => r !== username));
  }, [recipients]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!unlockDate) {
      setError('Please select an unlock date');
      return;
    }

    const unlockAt = new Date(`${unlockDate}T${unlockTime}`);
    if (unlockAt <= new Date()) {
      setError('Unlock date must be in the future');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      let videoUrl: string | undefined;
      if (videoFile) {
        const uploadManager = new TusUploadManager();
        await new Promise<void>((resolve, reject) => {
          uploadManager.onProgress = (progress) => setUploadProgress(Math.round(progress));
          uploadManager.onComplete = (uploadId) => { videoUrl = uploadId; resolve(); };
          uploadManager.onError = (error) => reject(error);
          uploadManager.start(videoFile);
        });
      }

      let coverImageUrl: string | undefined;
      if (coverFile) {
        const formData = new FormData();
        formData.append('image', coverFile);
        const { data: uploadData } = await apiClient.post<{ url: string }>('/uploads/image', formData);
        coverImageUrl = uploadData.url;
      }

      await capsuleApi.createCapsule({
        title: title.trim(),
        description: description.trim() || undefined,
        videoUrl,
        coverImageUrl,
        unlockAt: unlockAt.toISOString(),
        isPrivate,
        recipientIds: isPrivate ? recipients : undefined,
        previewEnabled,
        previewSeconds: previewEnabled ? previewSeconds : undefined,
        notifyOnUnlock,
      });

      router.push('/capsule');
    } catch (err) {
      logger.error('Failed to create capsule:', err);
      setError('Failed to create capsule. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [title, unlockDate, unlockTime, videoFile, coverFile, description, isPrivate, recipients, previewEnabled, previewSeconds, notifyOnUnlock, router]);

  // Revoke any remaining object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (videoObjectUrlRef.current) {
        URL.revokeObjectURL(videoObjectUrlRef.current);
        videoObjectUrlRef.current = null;
      }
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
        coverObjectUrlRef.current = null;
      }
    };
  }, []);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return {
    title, setTitle,
    description, setDescription,
    unlockDate, setUnlockDate,
    unlockTime, setUnlockTime,
    isPrivate, setIsPrivate,
    recipients,
    recipientInput, setRecipientInput,
    previewEnabled, setPreviewEnabled,
    previewSeconds, setPreviewSeconds,
    notifyOnUnlock, setNotifyOnUnlock,
    videoFile,
    videoPreviewUrl,
    coverFile,
    coverPreviewUrl,
    uploading,
    uploadProgress,
    error,
    minDate,
    fileInputRef,
    coverInputRef,
    handleVideoSelect,
    handleCoverSelect,
    clearVideo,
    clearCover,
    addRecipient,
    removeRecipient,
    handleSubmit,
  };
}
