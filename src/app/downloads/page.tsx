'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlayIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  SignalSlashIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { offlineVideoService } from '@/services/offlineVideo';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import type { Video } from '@/types';

interface OfflineVideo {
  videoId: string;
  video: Video;
  quality: string;
  fileSize: number;
  downloadedAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function DownloadedVideoCard({
  offlineVideo,
  onDelete,
  onPlay,
}: {
  offlineVideo: OfflineVideo;
  onDelete: () => void;
  onPlay: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Remove this video from downloads?')) return;
    setIsDeleting(true);
    await onDelete();
  };

  const { video } = offlineVideo;

  return (
    <div className="flex gap-4 p-3 glass-card rounded-xl group">
      {/* Thumbnail */}
      <button onClick={onPlay} className="relative flex-shrink-0">
        <div className="w-32 h-20 rounded-lg overflow-hidden bg-white/10">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.caption || ''}
              width={128}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-white/30" />
            </div>
          )}
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <PlayIcon className="w-5 h-5 text-black ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-[10px]">
            {formatDuration(video.duration)}
          </span>
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate mb-1">
          {video.caption || 'Untitled'}
        </h3>
        <Link
          href={`/profile/${video.userId}`}
          className="text-white/50 text-sm hover:underline"
        >
          @{video.username}
        </Link>
        <div className="flex items-center gap-3 mt-2 text-white/40 text-xs">
          <span>{offlineVideo.quality}</span>
          <span>{formatBytes(offlineVideo.fileSize)}</span>
          <span>{formatDate(offlineVideo.downloadedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 hover:bg-red-500/20 rounded-full transition disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <TrashIcon className="w-5 h-5 text-red-400" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function DownloadsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [downloads, setDownloads] = useState<OfflineVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageUsage, setStorageUsage] = useState({ used: '0 MB', max: '500 MB', percent: 0 });
  const [isOnline, setIsOnline] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  const loadDownloads = useCallback(async () => {
    setIsLoading(true);

    const supported = 'indexedDB' in window;
    setIsSupported(supported);

    if (!supported) {
      setIsLoading(false);
      return;
    }

    try {
      const videos = await offlineVideoService.getOfflineVideos();
      setDownloads(videos);

      const usage = await offlineVideoService.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to load downloads:', error);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/downloads');
      return;
    }

    loadDownloads();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, isAuthVerified, router, loadDownloads]);

  const handleDelete = async (videoId: string) => {
    await offlineVideoService.deleteOfflineVideo(videoId);
    setDownloads((prev) => prev.filter((d) => d.videoId !== videoId));
    const usage = await offlineVideoService.getStorageUsage();
    setStorageUsage(usage);
  };

  const handleClearAll = async () => {
    if (!confirm('Remove all downloaded videos? This cannot be undone.')) return;
    await offlineVideoService.clearAllDownloads();
    setDownloads([]);
    setStorageUsage({ used: '0 Bytes', max: '500 MB', percent: 0 });
  };

  const handlePlayOffline = async (offlineVideo: OfflineVideo) => {
    const blobUrl = await offlineVideoService.getOfflineVideo(offlineVideo.videoId);
    if (blobUrl) {
      // For now, navigate to video page - in production could play blob directly
      router.push(`/video/${offlineVideo.videoId}`);
    }
  };

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white">Downloads</h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50">{downloads.length} videos</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50">{storageUsage.used}</span>
                </div>
              </div>
            </div>

            {/* Online status indicator */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <span className="flex items-center gap-1 text-green-400 text-xs">
                  <SignalIcon className="w-4 h-4" />
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-400 text-xs">
                  <SignalSlashIcon className="w-4 h-4" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4">
          {!isSupported ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Not Supported
              </h2>
              <p className="text-white/50 max-w-sm mx-auto">
                Your browser doesn&apos;t support offline video storage. Try using a modern browser like Chrome, Firefox, or Safari.
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-3 glass-card rounded-xl animate-pulse">
                  <div className="w-32 h-20 rounded-lg bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-1/3 mb-3" />
                    <div className="h-2 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <ArrowDownTrayIcon className="w-10 h-10 text-white/30" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No Downloads Yet
              </h2>
              <p className="text-white/50 mb-6 max-w-sm mx-auto">
                Download videos to watch them offline without an internet connection
              </p>
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition"
              >
                Browse Videos
              </Link>
            </div>
          ) : (
            <>
              {/* Storage Usage */}
              <div className="glass-card rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CloudIcon className="w-5 h-5 text-white/50" />
                    <span className="text-white/70 text-sm">Storage Used</span>
                  </div>
                  <span className="text-white text-sm">
                    {storageUsage.used} / {storageUsage.max}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all"
                    style={{ width: `${storageUsage.percent}%` }}
                  />
                </div>
                {storageUsage.percent > 80 && (
                  <p className="text-orange-400 text-xs mt-2">
                    Storage almost full. Older videos will be removed automatically.
                  </p>
                )}
              </div>

              {/* Clear All Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleClearAll}
                  className="text-red-400 text-sm hover:text-red-300 transition"
                >
                  Clear All
                </button>
              </div>

              {/* Downloads List */}
              <div className="space-y-3">
                {downloads.map((download) => (
                  <DownloadedVideoCard
                    key={download.videoId}
                    offlineVideo={download}
                    onDelete={() => handleDelete(download.videoId)}
                    onPlay={() => handlePlayOffline(download)}
                  />
                ))}
              </div>

              {/* Offline Mode Info */}
              {!isOnline && (
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <SignalSlashIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-white font-medium mb-1">You&apos;re Offline</h3>
                      <p className="text-white/70 text-sm">
                        You can still watch your downloaded videos. New content will load when you&apos;re back online.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
