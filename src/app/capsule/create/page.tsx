'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ClockIcon,
  PhotoIcon,
  VideoCameraIcon,
  UserPlusIcon,
  EyeIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { capsuleApi } from '@/services/api/capsule';
import { uploadApi, TusUploadManager } from '@/services/api/upload';

export default function CreateCapsulePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form state
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

  // File state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addRecipient = () => {
    if (recipientInput.trim() && !recipients.includes(recipientInput.trim())) {
      setRecipients([...recipients, recipientInput.trim()]);
      setRecipientInput('');
    }
  };

  const removeRecipient = (username: string) => {
    setRecipients(recipients.filter(r => r !== username));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Upload video if selected
      let videoUrl: string | undefined;
      if (videoFile) {
        // Use TUS upload manager for resumable uploads
        const uploadManager = new TusUploadManager();

        await new Promise<void>((resolve, reject) => {
          uploadManager.onProgress = (progress) => {
            setUploadProgress(Math.round(progress));
          };
          uploadManager.onComplete = (uploadId) => {
            videoUrl = uploadId; // Use uploadId as reference
            resolve();
          };
          uploadManager.onError = (error) => {
            reject(error);
          };
          uploadManager.start(videoFile);
        });
      }

      // Upload cover if selected
      let coverImageUrl: string | undefined;
      if (coverFile) {
        // In production, upload cover image
        coverImageUrl = coverPreviewUrl || undefined;
      }

      // Create capsule
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
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/capsule" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Create Time Capsule</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Video Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Video</label>
            {videoPreviewUrl ? (
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black rounded-full transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition flex flex-col items-center justify-center gap-3"
              >
                <VideoCameraIcon className="w-12 h-12 text-gray-600" />
                <span className="text-gray-400">Click to upload video</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Cover Image (shown before unlock)</label>
            {coverPreviewUrl ? (
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <img
                  src={coverPreviewUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black rounded-full transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-32 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition flex items-center justify-center gap-3"
              >
                <PhotoIcon className="w-8 h-8 text-gray-600" />
                <span className="text-gray-400">Add cover image</span>
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your capsule a name..."
              maxLength={100}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's in this time capsule?"
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Unlock Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Unlock Date *</label>
              <input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                min={minDate}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Unlock Time</label>
              <input
                type="time"
                value={unlockTime}
                onChange={(e) => setUnlockTime(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white/5 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPrivate ? (
                  <LockClosedIcon className="w-5 h-5 text-purple-400" />
                ) : (
                  <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <div className="font-medium">Private Capsule</div>
                  <div className="text-sm text-gray-400">
                    {isPrivate ? 'Only specific people can view' : 'Anyone can view when unlocked'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-12 h-6 rounded-full transition ${
                  isPrivate ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    isPrivate ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Recipients (for private capsules) */}
            {isPrivate && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Recipients</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                    placeholder="Enter username..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition"
                  >
                    <UserPlusIcon className="w-5 h-5" />
                  </button>
                </div>
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipients.map(username => (
                      <span
                        key={username}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-full text-sm"
                      >
                        @{username}
                        <button
                          type="button"
                          onClick={() => removeRecipient(username)}
                          className="hover:text-red-400"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="bg-white/5 rounded-xl p-4 space-y-4">
            <h3 className="font-medium">Advanced Options</h3>

            {/* Preview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <EyeIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">Enable Preview</div>
                  <div className="text-sm text-gray-400">Show first few seconds before unlock</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEnabled(!previewEnabled)}
                className={`w-12 h-6 rounded-full transition ${
                  previewEnabled ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    previewEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {previewEnabled && (
              <div className="ml-8">
                <label className="block text-sm text-gray-400 mb-2">Preview length (seconds)</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={previewSeconds}
                  onChange={(e) => setPreviewSeconds(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="text-center text-sm text-gray-400">{previewSeconds} seconds</div>
              </div>
            )}

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">Notify on Unlock</div>
                  <div className="text-sm text-gray-400">Send notification when capsule unlocks</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyOnUnlock(!notifyOnUnlock)}
                className={`w-12 h-6 rounded-full transition ${
                  notifyOnUnlock ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    notifyOnUnlock ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || !title.trim() || !unlockDate}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <ClockIcon className="w-5 h-5 animate-spin" />
                Sealing Capsule... {uploadProgress}%
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LockClosedIcon className="w-5 h-5" />
                Seal Time Capsule
              </span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
