'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  LockClosedIcon,
  GlobeAltIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { playlistsApi } from '@/services/api/playlists';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import type { Playlist } from '@/types/playlist';
import type { Video } from '@/types';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function VideoRow({
  video,
  index,
  onRemove,
  onPlay,
}: {
  video: Video;
  index: number;
  onRemove: () => void;
  onPlay: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition group">
      <span className="text-white/40 text-sm w-6 text-center">{index + 1}</span>

      <button onClick={onPlay} className="relative flex-shrink-0">
        <div className="w-24 h-14 rounded-lg overflow-hidden bg-white/10">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.caption || ''}
              width={96}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-white/30" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
          <PlayIcon className="w-6 h-6 text-white" />
        </div>
        {video.duration && (
          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-white text-[10px]">
            {formatDuration(video.duration)}
          </span>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <Link href={`/video/${video.id}`} className="block">
          <h4 className="text-white font-medium truncate hover:underline">
            {video.caption || 'Untitled'}
          </h4>
        </Link>
        <Link
          href={`/profile/${video.userId}`}
          className="text-white/50 text-sm hover:underline"
        >
          @{video.username}
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-white/10 rounded-full transition opacity-0 group-hover:opacity-100"
        >
          <EllipsisVerticalIcon className="w-5 h-5 text-white/70" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-10 z-50 w-40 glass-heavy rounded-lg overflow-hidden shadow-xl">
              <Link
                href={`/video/${video.id}`}
                className="block px-4 py-2 text-white hover:bg-white/10 transition"
              >
                Watch video
              </Link>
              <Link
                href={`/profile/${video.userId}`}
                className="block px-4 py-2 text-white hover:bg-white/10 transition"
              >
                View creator
              </Link>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onRemove();
                }}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition"
              >
                Remove from playlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PlaylistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const playlistId = params.playlistId as string;
  const { isAuthenticated, isAuthVerified, user } = useAuthStore();

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
    if (!isAuthVerified) return;
    loadPlaylist();
  }, [isAuthVerified, loadPlaylist]);

  const handleRemoveVideo = async (videoId: string) => {
    const success = await playlistsApi.removeVideoFromPlaylist(playlistId, videoId);
    if (success) {
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (playlist) {
        setPlaylist({ ...playlist, videoCount: playlist.videoCount - 1 });
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    const success = await playlistsApi.deletePlaylist(playlistId);
    if (success) {
      router.push('/playlists');
    }
  };

  const handlePlayAll = () => {
    if (videos.length > 0) {
      router.push(`/video/${videos[0].id}?playlist=${playlistId}`);
    }
  };

  const handleShare = () => {
    if (navigator.share && playlist) {
      navigator.share({
        title: playlist.name,
        text: playlist.description || `Check out this playlist on VIB3`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const isOwner = playlist?.userId === user?.id;

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
          <div className="flex items-center gap-4 px-4 h-14">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">Playlist</h1>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4">
          {isLoading ? (
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
          ) : !playlist ? (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-white mb-2">
                Playlist not found
              </h2>
              <p className="text-white/50 mb-6">
                This playlist may have been deleted or made private
              </p>
              <Link
                href="/playlists"
                className="inline-block px-6 py-3 glass text-white rounded-full hover:bg-white/10 transition"
              >
                Back to Playlists
              </Link>
            </div>
          ) : (
            <>
              {/* Playlist Info */}
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-white/10 mx-auto sm:mx-0">
                  {playlist.thumbnailUrl || playlist.coverImageUrl ? (
                    <Image
                      src={playlist.thumbnailUrl || playlist.coverImageUrl || ''}
                      alt={playlist.name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayIcon className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    {playlist.isPrivate ? (
                      <LockClosedIcon className="w-4 h-4 text-white/50" />
                    ) : (
                      <GlobeAltIcon className="w-4 h-4 text-white/50" />
                    )}
                    <span className="text-white/50 text-sm">
                      {playlist.isPrivate ? 'Private' : 'Public'} Playlist
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-white mb-2">{playlist.name}</h1>

                  {playlist.description && (
                    <p className="text-white/70 mb-3">{playlist.description}</p>
                  )}

                  <p className="text-white/50 text-sm mb-4">
                    {playlist.videoCount} videos • {formatTotalDuration(playlist.totalDuration)}
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                      onClick={handlePlayAll}
                      disabled={videos.length === 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                      <PlayIcon className="w-5 h-5" />
                      Play All
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-2.5 glass rounded-full hover:bg-white/10 transition"
                    >
                      <ShareIcon className="w-5 h-5 text-white" />
                    </button>

                    {isOwner && (
                      <>
                        <Link
                          href={`/playlists/${playlistId}/edit`}
                          className="p-2.5 glass rounded-full hover:bg-white/10 transition"
                        >
                          <PencilIcon className="w-5 h-5 text-white" />
                        </Link>
                        <button
                          onClick={handleDeletePlaylist}
                          className="p-2.5 glass rounded-full hover:bg-white/10 transition"
                        >
                          <TrashIcon className="w-5 h-5 text-red-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Videos List */}
              {videos.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-xl">
                  <PlayIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    No videos yet
                  </h3>
                  <p className="text-white/50">
                    Add videos to this playlist while browsing
                  </p>
                </div>
              ) : (
                <div className="glass-card rounded-xl divide-y divide-white/5">
                  {videos.map((video, index) => (
                    <VideoRow
                      key={video.id}
                      video={video}
                      index={index}
                      onRemove={() => handleRemoveVideo(video.id)}
                      onPlay={() =>
                        router.push(`/video/${video.id}?playlist=${playlistId}`)
                      }
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
