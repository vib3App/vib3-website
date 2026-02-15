'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  SignalSlashIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { useConfirmStore } from '@/stores/confirmStore';
import { offlineVideoService } from '@/services/offlineVideo';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { DownloadedVideoCard, type OfflineVideo } from '@/components/downloads';

export default function DownloadsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const confirmDialog = useConfirmStore(s => s.show);
  const [downloads, setDownloads] = useState<OfflineVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageUsage, setStorageUsage] = useState({ used: '0 MB', max: '500 MB', percent: 0 });
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/downloads');
      return;
    }

    let cancelled = false;
    const loadDownloads = async () => {
      setIsLoading(true);
      const supported = 'indexedDB' in window;
      if (!cancelled) setIsSupported(supported);
      if (!supported) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const videos = await offlineVideoService.getOfflineVideos();
        if (!cancelled) setDownloads(videos);
        const usage = await offlineVideoService.getStorageUsage();
        if (!cancelled) setStorageUsage(usage);
      } catch (error) {
        console.error('Failed to load downloads:', error);
      }
      if (!cancelled) setIsLoading(false);
    };
    loadDownloads();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, isAuthVerified, router]);

  const handleDelete = async (videoId: string) => {
    await offlineVideoService.deleteOfflineVideo(videoId);
    setDownloads((prev) => prev.filter((d) => d.videoId !== videoId));
    const usage = await offlineVideoService.getStorageUsage();
    setStorageUsage(usage);
  };

  const handleClearAll = async () => {
    const ok = await confirmDialog({ title: 'Clear Downloads', message: 'Remove all downloaded videos? This cannot be undone.', variant: 'danger', confirmText: 'Clear All' });
    if (!ok) return;
    await offlineVideoService.clearAllDownloads();
    setDownloads([]);
    setStorageUsage({ used: '0 Bytes', max: '500 MB', percent: 0 });
  };

  const handlePlayOffline = async (offlineVideo: OfflineVideo) => {
    const blobUrl = await offlineVideoService.getOfflineVideo(offlineVideo.videoId);
    if (blobUrl) router.push(`/video/${offlineVideo.videoId}`);
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
        <DownloadsHeader
          count={downloads.length}
          storageUsed={storageUsage.used}
          isOnline={isOnline}
          onBack={() => router.back()}
        />

        <div className="max-w-3xl mx-auto px-4">
          {!isSupported ? (
            <NotSupportedMessage />
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : downloads.length === 0 ? (
            <EmptyState />
          ) : (
            <DownloadsList
              downloads={downloads}
              storageUsage={storageUsage}
              isOnline={isOnline}
              onDelete={handleDelete}
              onClearAll={handleClearAll}
              onPlay={handlePlayOffline}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function DownloadsHeader({ count, storageUsed, isOnline, onBack }: {
  count: number; storageUsed: string; isOnline: boolean; onBack: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeftIcon className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">Downloads</h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/50">{count} videos</span>
              <span className="text-white/30">•</span>
              <span className="text-white/50">{storageUsed}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1 text-green-400 text-xs">
              <SignalIcon className="w-4 h-4" />Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-400 text-xs">
              <SignalSlashIcon className="w-4 h-4" />Offline
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function NotSupportedMessage() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <ExclamationTriangleIcon className="w-10 h-10 text-orange-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Not Supported</h2>
      <p className="text-white/50 max-w-sm mx-auto">
        Your browser doesn&apos;t support offline video storage. Try using a modern browser.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
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
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <ArrowDownTrayIcon className="w-10 h-10 text-white/30" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No Downloads Yet</h2>
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
  );
}

function DownloadsList({ downloads, storageUsage, isOnline, onDelete, onClearAll, onPlay }: {
  downloads: OfflineVideo[];
  storageUsage: { used: string; max: string; percent: number };
  isOnline: boolean;
  onDelete: (videoId: string) => void;
  onClearAll: () => void;
  onPlay: (video: OfflineVideo) => void;
}) {
  return (
    <>
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CloudIcon className="w-5 h-5 text-white/50" />
            <span className="text-white/70 text-sm">Storage Used</span>
          </div>
          <span className="text-white text-sm">{storageUsage.used} / {storageUsage.max}</span>
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

      <div className="flex justify-end mb-4">
        <button onClick={onClearAll} className="text-red-400 text-sm hover:text-red-300 transition">
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {downloads.map((download) => (
          <DownloadedVideoCard
            key={download.videoId}
            offlineVideo={download}
            onDelete={() => onDelete(download.videoId)}
            onPlay={() => onPlay(download)}
          />
        ))}
      </div>

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
  );
}
