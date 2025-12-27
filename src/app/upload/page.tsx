'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';

type UploadStep = 'select' | 'edit' | 'details' | 'uploading' | 'complete';

const vibes = [
  { name: 'Energetic', emoji: '⚡' },
  { name: 'Chill', emoji: '😌' },
  { name: 'Creative', emoji: '🎨' },
  { name: 'Social', emoji: '🎉' },
  { name: 'Romantic', emoji: '💕' },
  { name: 'Funny', emoji: '😂' },
  { name: 'Inspirational', emoji: '✨' },
];

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState<UploadStep>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/upload');
    }
  }, [isAuthenticated, router]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      alert('File size must be less than 500MB');
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
    setStep('edit');

    // Generate thumbnail
    const video = document.createElement('video');
    video.src = url;
    video.currentTime = 1;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      setThumbnail(canvas.toDataURL('image/jpeg'));
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleHashtagAdd = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    setStep('uploading');

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('complete');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // TODO: Implement actual upload
    // const formData = new FormData();
    // formData.append('video', videoFile);
    // formData.append('caption', caption);
    // formData.append('hashtags', JSON.stringify(hashtags));
    // formData.append('vibe', selectedVibe || '');
    // formData.append('visibility', visibility);
    // await videoApi.upload(formData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Create</h1>
            {step !== 'select' && step !== 'complete' && (
              <button
                onClick={() => {
                  if (step === 'edit') setStep('select');
                  else if (step === 'details') setStep('edit');
                }}
                className="text-white/50 hover:text-white"
              >
                Back
              </button>
            )}
          </div>

          {/* Step: Select Video */}
          {step === 'select' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragging
                  ? 'border-[#6366F1] bg-[#6366F1]/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Drag and drop video files to upload
              </h2>
              <p className="text-white/50 mb-6">
                Or click to browse from your device
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Select Video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <p className="text-white/30 text-sm mt-6">
                MP4, MOV, or WebM • Max 500MB • Up to 10 minutes
              </p>
            </div>
          )}

          {/* Step: Edit Video */}
          {step === 'edit' && videoPreviewUrl && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Video Preview */}
                <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative">
                  <video
                    ref={videoRef}
                    src={videoPreviewUrl}
                    className="w-full h-full object-contain"
                    controls
                  />
                </div>

                {/* Basic Options */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-3">Cover Image</h3>
                    <div className="flex gap-3">
                      {thumbnail && (
                        <div className="w-24 h-36 rounded-lg overflow-hidden ring-2 ring-[#6366F1]">
                          <Image
                            src={thumbnail}
                            alt="Thumbnail"
                            width={96}
                            height={144}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <button className="w-24 h-36 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-white/50 hover:border-white/40">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs">Upload</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3">Quick Edits</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="p-4 bg-[#1A1F2E] rounded-xl text-center hover:bg-[#252A3E] transition-colors">
                        <svg className="w-6 h-6 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                        </svg>
                        <span className="text-white/70 text-sm">Trim</span>
                      </button>
                      <button className="p-4 bg-[#1A1F2E] rounded-xl text-center hover:bg-[#252A3E] transition-colors">
                        <svg className="w-6 h-6 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <span className="text-white/70 text-sm">Sound</span>
                      </button>
                      <button className="p-4 bg-[#1A1F2E] rounded-xl text-center hover:bg-[#252A3E] transition-colors">
                        <svg className="w-6 h-6 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span className="text-white/70 text-sm">Filters</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('details')}
                className="w-full py-4 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Next: Add Details
              </button>
            </div>
          )}

          {/* Step: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              {/* Caption */}
              <div>
                <label className="block text-white font-medium mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  maxLength={2200}
                  rows={4}
                  className="w-full bg-[#1A1F2E] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 resize-none focus:ring-2 focus:ring-[#6366F1]"
                />
                <div className="text-right text-white/30 text-sm mt-1">
                  {caption.length}/2200
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-white font-medium mb-2">Hashtags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#6366F1]/20 text-[#6366F1] rounded-full text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => setHashtags(hashtags.filter(t => t !== tag))}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleHashtagAdd())}
                    placeholder="Add hashtag..."
                    className="flex-1 bg-[#1A1F2E] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1]"
                  />
                  <button
                    onClick={handleHashtagAdd}
                    className="px-4 py-3 bg-[#1A1F2E] text-white rounded-xl hover:bg-[#252A3E]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Vibe */}
              <div>
                <label className="block text-white font-medium mb-2">Vibe</label>
                <div className="flex flex-wrap gap-2">
                  {vibes.map((vibe) => (
                    <button
                      key={vibe.name}
                      onClick={() => setSelectedVibe(selectedVibe === vibe.name ? null : vibe.name)}
                      className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 transition-colors ${
                        selectedVibe === vibe.name
                          ? 'bg-[#6366F1] text-white'
                          : 'bg-[#1A1F2E] text-white/70 hover:bg-[#252A3E]'
                      }`}
                    >
                      <span>{vibe.emoji}</span>
                      <span>{vibe.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-white font-medium mb-2">Who can watch</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'public', label: 'Everyone', icon: '🌍' },
                    { value: 'followers', label: 'Followers', icon: '👥' },
                    { value: 'private', label: 'Only Me', icon: '🔒' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setVisibility(option.value as typeof visibility)}
                      className={`p-4 rounded-xl text-center transition-colors ${
                        visibility === option.value
                          ? 'bg-[#6366F1] text-white'
                          : 'bg-[#1A1F2E] text-white/70 hover:bg-[#252A3E]'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1A1F2E] rounded-xl">
                  <span className="text-white">Allow comments</span>
                  <button
                    onClick={() => setAllowComments(!allowComments)}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      allowComments ? 'bg-[#6366F1]' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      allowComments ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1A1F2E] rounded-xl">
                  <span className="text-white">Allow Duet & Echo</span>
                  <button
                    onClick={() => setAllowDuet(!allowDuet)}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      allowDuet ? 'bg-[#6366F1]' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      allowDuet ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpload}
                className="w-full py-4 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Post
              </button>
            </div>
          )}

          {/* Step: Uploading */}
          {step === 'uploading' && (
            <div className="text-center py-12">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#1A1F2E"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * Math.min(uploadProgress, 100)) / 100}
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#14B8A6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{Math.round(uploadProgress)}%</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Uploading your video...</h2>
              <p className="text-white/50">This may take a moment</p>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Video Posted!</h2>
              <p className="text-white/50 mb-8">Your video is now live</p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/feed"
                  className="px-8 py-3 bg-[#1A1F2E] text-white font-semibold rounded-full hover:bg-[#252A3E]"
                >
                  View Feed
                </Link>
                <button
                  onClick={() => {
                    setStep('select');
                    setVideoFile(null);
                    setVideoPreviewUrl(null);
                    setCaption('');
                    setHashtags([]);
                    setSelectedVibe(null);
                    setUploadProgress(0);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full"
                >
                  Upload Another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
