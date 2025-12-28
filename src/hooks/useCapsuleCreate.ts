'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { capsuleApi } from '@/services/api/capsule';
import { TusUploadManager } from '@/services/api/upload';

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

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleCoverSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const clearVideo = useCallback(() => {
    setVideoFile(null);
    setVideoPreviewUrl(null);
  }, []);

  const clearCover = useCallback(() => {
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

      const coverImageUrl = coverPreviewUrl || undefined;

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
      console.error('Failed to create capsule:', err);
      setError('Failed to create capsule. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [title, unlockDate, unlockTime, videoFile, coverPreviewUrl, description, isPrivate, recipients, previewEnabled, previewSeconds, notifyOnUnlock, router]);

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
