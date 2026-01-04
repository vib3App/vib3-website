'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { playlistsApi } from '@/services/api/playlists';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { VideoRow, PlaylistHeader } from '@/components/playlists';
import type { Playlist } from '@/types/playlist';
import type { Video } from '@/types';

export default function PlaylistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const playlistId = params.playlistId as string;
  const { isAuthVerified, user } = useAuthStore();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlaylist = useCallback(async () => {
    try {
      const [playlistData, videosData] = await Promise.all([
        playlistsApi.getPlaylist(playlistId),
        playlistsApi.getPlaylistVideos(playlistId),
      ]);
      setPlaylist(playlistData);
      setVideos(videosData);
    } catch (error) {
      console.error('Failed to load playlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (isAuthVerified) loadPlaylist();
  }, [isAuthVerified, loadPlaylist]);

  const handleRemoveVideo = async (videoId: string) => {
    const success = await playlistsApi.removeVideoFromPlaylist(playlistId, videoId);
    if (success) {
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (playlist) setPlaylist({ ...playlist, videoCount: playlist.videoCount - 1 });
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    const success = await playlistsApi.deletePlaylist(playlistId);
    if (success) router.push('/playlists');
  };

  const handlePlayAll = () => {
    if (videos.length > 0) router.push(`/video/${videos[0].id}?playlist=${playlistId}`);
  };

  const handleShare = () => {
    if (navigator.share && playlist) {
      navigator.share({
        title: playlist.name,
        text: playlist.description || 'Check out this playlist on VIB3',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const isOwner = playlist?.userId === user?.id;

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center gap-4 px-4 h-14">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">Playlist</h1>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : !playlist ? (
            <NotFoundState />
          ) : (
            <>
              <PlaylistHeader
                playlist={playlist}
                isOwner={isOwner}
                hasVideos={videos.length > 0}
                onPlayAll={handlePlayAll}
                onShare={handleShare}
                onDelete={handleDeletePlaylist}
              />

              {videos.length === 0 ? (
                <EmptyVideoState />
              ) : (
                <div className="glass-card rounded-xl divide-y divide-white/5">
                  {videos.map((video, index) => (
                    <VideoRow
                      key={video.id}
                      video={video}
                      index={index}
                      onRemove={() => handleRemoveVideo(video.id)}
                      onPlay={() => router.push(`/video/${video.id}?playlist=${playlistId}`)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-6 mb-8">
        <div className="w-40 h-40 rounded-xl bg-white/10" />
        <div className="flex-1">
          <div className="h-6 bg-white/10 rounded w-1/2 mb-3" />
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="w-6 h-4 bg-white/10 rounded" />
          <div className="w-24 h-14 bg-white/10 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
            <div className="h-3 bg-white/10 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="text-center py-20">
      <h2 className="text-xl font-semibold text-white mb-2">Playlist not found</h2>
      <p className="text-white/50 mb-6">This playlist may have been deleted or made private</p>
      <Link href="/playlists" className="inline-block px-6 py-3 glass text-white rounded-full hover:bg-white/10 transition">
        Back to Playlists
      </Link>
    </div>
  );
}

function EmptyVideoState() {
  return (
    <div className="text-center py-12 glass-card rounded-xl">
      <PlayIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">No videos yet</h3>
      <p className="text-white/50">Add videos to this playlist while browsing</p>
    </div>
  );
}
