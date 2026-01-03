'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  LockClosedIcon,
  GlobeAltIcon,
  PlayIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { playlistsApi } from '@/services/api/playlists';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import type { Playlist } from '@/types/playlist';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function PlaylistCard({ playlist, onDelete }: { playlist: Playlist; onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden group">
      <Link href={`/playlists/${playlist.id}`}>
        <div className="relative aspect-video bg-white/5">
          {playlist.thumbnailUrl || playlist.coverImageUrl ? (
            <Image
              src={playlist.thumbnailUrl || playlist.coverImageUrl || ''}
              alt={playlist.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-12 h-12 text-white/20" />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-black ml-1" />
            </div>
          </div>

          {/* Video count badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs font-medium">
            {playlist.videoCount} videos
          </div>

          {/* Privacy indicator */}
          <div className="absolute top-2 left-2">
            {playlist.isPrivate ? (
              <LockClosedIcon className="w-4 h-4 text-white drop-shadow" />
            ) : (
              <GlobeAltIcon className="w-4 h-4 text-white drop-shadow" />
            )}
          </div>
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/playlists/${playlist.id}`}>
              <h3 className="font-medium text-white truncate hover:underline">
                {playlist.name}
              </h3>
            </Link>
            {playlist.description && (
              <p className="text-white/50 text-sm truncate mt-0.5">
                {playlist.description}
              </p>
            )}
            <p className="text-white/40 text-xs mt-1">
              {formatDuration(playlist.totalDuration)}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-white/10 rounded-full transition"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-white/70" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-40 glass-heavy rounded-lg overflow-hidden shadow-xl">
                  <Link
                    href={`/playlists/${playlist.id}`}
                    className="block px-4 py-2 text-white hover:bg-white/10 transition"
                  >
                    View playlist
                  </Link>
                  <Link
                    href={`/playlists/${playlist.id}/edit`}
                    className="block px-4 py-2 text-white hover:bg-white/10 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, isPrivate: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    await onCreate(name.trim(), description.trim(), isPrivate);
    setIsCreating(false);
    setName('');
    setDescription('');
    setIsPrivate(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative glass-heavy rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-6">Create Playlist</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Playlist"
              className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this playlist about?"
              className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white font-medium">Private playlist</p>
              <p className="text-white/50 text-xs">Only you can see this playlist</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                isPrivate ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  isPrivate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 glass text-white rounded-xl font-medium hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PlaylistsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadPlaylists = useCallback(async () => {
    try {
      const data = await playlistsApi.getUserPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/playlists');
      return;
    }

    loadPlaylists();
  }, [isAuthenticated, isAuthVerified, router, loadPlaylists]);

  const handleCreatePlaylist = async (
    name: string,
    description: string,
    isPrivate: boolean
  ) => {
    const playlist = await playlistsApi.createPlaylist({
      name,
      description,
      isPrivate,
    });

    if (playlist) {
      setPlaylists((prev) => [playlist, ...prev]);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    const success = await playlistsApi.deletePlaylist(playlistId);
    if (success) {
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    }
  };

  if (!isAuthVerified || !isAuthenticated) {
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
                <h1 className="text-lg font-semibold text-white">Playlists</h1>
                <p className="text-white/50 text-xs">{playlists.length} playlists</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              <PlusIcon className="w-4 h-4" />
              New
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-white/10" />
                  <div className="p-3">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <PlayIcon className="w-10 h-10 text-white/30" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No playlists yet</h2>
              <p className="text-white/50 mb-6">
                Create a playlist to organize your favorite videos
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition"
              >
                <PlusIcon className="w-5 h-5" />
                Create Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onDelete={() => handleDeletePlaylist(playlist.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePlaylist}
      />
    </div>
  );
}
