'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PlusIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { useConfirmStore } from '@/stores/confirmStore';
import { playlistsApi } from '@/services/api/playlists';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { PlaylistCard, CreatePlaylistModal } from '@/components/playlists';
import type { Playlist } from '@/types/playlist';
import { logger } from '@/utils/logger';

export default function PlaylistsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const confirmDialog = useConfirmStore(s => s.show);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadPlaylists = useCallback(async () => {
    try {
      const data = await playlistsApi.getUserPlaylists();
      setPlaylists(data);
    } catch (error) {
      logger.error('Failed to load playlists:', error);
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

  const handleCreatePlaylist = async (name: string, description: string, isPrivate: boolean) => {
    const playlist = await playlistsApi.createPlaylist({ name, description, isPrivate });
    if (playlist) setPlaylists((prev) => [playlist, ...prev]);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    const ok = await confirmDialog({ title: 'Delete Playlist', message: 'Are you sure you want to delete this playlist?', variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    const success = await playlistsApi.deletePlaylist(playlistId);
    if (success) setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
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
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white">Playlists</h1>
                <p className="text-white/50 text-xs">{playlists.length} playlists</p>
              </div>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-sm font-medium hover:opacity-90 transition">
              <PlusIcon className="w-4 h-4" />New
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : playlists.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} onDelete={() => handleDeletePlaylist(playlist.id)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreatePlaylistModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreatePlaylist} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
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
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <PlayIcon className="w-10 h-10 text-white/30" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No playlists yet</h2>
      <p className="text-white/50 mb-6">Create a playlist to organize your favorite videos</p>
      <button onClick={onCreateClick} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition">
        <PlusIcon className="w-5 h-5" />Create Playlist
      </button>
    </div>
  );
}
