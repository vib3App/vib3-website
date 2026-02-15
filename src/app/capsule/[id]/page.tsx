'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Hls from 'hls.js';
import { useRef } from 'react';
import { capsuleApi } from '@/services/api/capsule';
import { useAuthStore } from '@/stores/authStore';
import { useConfirmStore } from '@/stores/confirmStore';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import type { TimeCapsule } from '@/types/capsule';

function formatCountdown(unlockAt: string): string {
  const now = new Date().getTime();
  const unlock = new Date(unlockAt).getTime();
  const diff = unlock - now;
  if (diff <= 0) return 'Unlocking...';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function CapsuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const confirmDialog = useConfirmStore(s => s.show);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');

  const capsuleId = params.id as string;
  const isOwner = capsule?.creatorId === user?.id;

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const data = await capsuleApi.getCapsule(capsuleId);
        setCapsule(data);
      } catch (err) {
        console.error('Failed to fetch capsule:', err);
        setError('Capsule not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCapsule();
  }, [capsuleId]);

  // Countdown timer for sealed capsules
  useEffect(() => {
    if (!capsule || capsule.status !== 'sealed') return;
    setCountdown(formatCountdown(capsule.unlockAt));
    const interval = setInterval(() => {
      setCountdown(formatCountdown(capsule.unlockAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [capsule]);

  // Load video when unlocked
  useEffect(() => {
    if (!capsule?.videoUrl || !videoRef.current) return;
    const url = capsule.videoUrl;
    const isHlsUrl = url.includes('.m3u8');

    if (isHlsUrl && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;
    } else {
      videoRef.current.src = url;
    }

    return () => { hlsRef.current?.destroy(); };
  }, [capsule?.videoUrl]);

  const handleDelete = async () => {
    const ok = await confirmDialog({ title: 'Delete Capsule', message: 'Delete this capsule permanently?', variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await capsuleApi.deleteCapsule(capsuleId);
      router.push('/capsule');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="min-h-screen aurora-bg flex flex-col items-center justify-center gap-4">
        <p className="text-white/60">{error || 'Capsule not found'}</p>
        <button onClick={() => router.push('/capsule')} className="text-purple-400 hover:underline">
          Back to Capsules
        </button>
      </div>
    );
  }

  const isSealed = capsule.status === 'sealed';

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0a0a0a' }}>
      <AuroraBackground intensity={15} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-white truncate max-w-[200px]">{capsule.title}</h1>
        <div className="w-10" />
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        {/* Sealed State */}
        {isSealed && (
          <div className="flex flex-col items-center py-12">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Time Capsule Sealed</h2>
            <p className="text-white/50 mb-6">This capsule will unlock in</p>

            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
              {countdown}
            </div>

            <p className="text-white/40 text-sm">
              Unlocks on {new Date(capsule.unlockAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {/* Unlocked State - Video */}
        {!isSealed && capsule.videoUrl && (
          <div className="rounded-2xl overflow-hidden bg-black mb-6">
            <video
              ref={videoRef}
              controls
              playsInline
              className="w-full aspect-video"
              poster={capsule.thumbnailUrl || capsule.coverImageUrl}
            />
          </div>
        )}

        {/* Unlocked State - Cover image only */}
        {!isSealed && !capsule.videoUrl && capsule.coverImageUrl && (
          <div className="rounded-2xl overflow-hidden mb-6">
            <Image
              src={capsule.coverImageUrl}
              alt={capsule.title}
              width={800}
              height={450}
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-2">{capsule.title}</h2>
          {capsule.description && (
            <p className="text-white/70 mb-4">{capsule.description}</p>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden aurora-bg flex-shrink-0">
              {capsule.creatorAvatar ? (
                <Image src={capsule.creatorAvatar} alt="" width={32} height={32} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-bold">
                  {capsule.creatorUsername?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <span className="text-white/70 text-sm">@{capsule.creatorUsername}</span>
            <span className="text-white/30 text-sm">
              {new Date(capsule.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Stats for unlocked capsules */}
          {!isSealed && (
            <div className="flex items-center gap-6 text-white/50 text-sm">
              <span>{capsule.viewCount} views</span>
              <span>{capsule.likeCount} likes</span>
            </div>
          )}
        </div>

        {/* Owner Actions */}
        {isOwner && isSealed && (
          <button
            onClick={handleDelete}
            className="w-full py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition text-sm"
          >
            Delete Capsule
          </button>
        )}
      </div>
    </div>
  );
}
