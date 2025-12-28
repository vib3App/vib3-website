'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collectionsApi } from '@/services/api';
import type { Collection } from '@/types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function AddToPlaylistModal({ isOpen, onClose, videoId }: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Collection[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
  const [initialPlaylists, setInitialPlaylists] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [allPlaylists, videoPlaylists] = await Promise.all([
          collectionsApi.getCollections('playlist'),
          collectionsApi.getVideoPlaylists(videoId),
        ]);
        setPlaylists(allPlaylists);
        const inPlaylists = new Set(videoPlaylists.map(p => p.id));
        setSelectedPlaylists(inPlaylists);
        setInitialPlaylists(inPlaylists);
      } catch (error) {
        console.error('Failed to load playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isOpen, videoId]);

  const togglePlaylist = (playlistId: string) => {
    setSelectedPlaylists(prev => {
      const next = new Set(prev);
      if (next.has(playlistId)) {
        next.delete(playlistId);
      } else {
        next.add(playlistId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Determine what changed
      const toAdd = [...selectedPlaylists].filter(id => !initialPlaylists.has(id));
      const toRemove = [...initialPlaylists].filter(id => !selectedPlaylists.has(id));

      // Add to new playlists
      await Promise.all(toAdd.map(id => collectionsApi.addToCollection(id, videoId)));

      // Remove from unselected playlists
      await Promise.all(toRemove.map(id => collectionsApi.removeFromCollection(id, videoId)));

      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const playlist = await collectionsApi.createPlaylist({
        name: newPlaylistName.trim(),
        videoIds: [videoId],
      });
      setPlaylists(prev => [playlist, ...prev]);
      setSelectedPlaylists(prev => new Set([...prev, playlist.id]));
      setInitialPlaylists(prev => new Set([...prev, playlist.id]));
      setNewPlaylistName('');
      setShowCreate(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="glass-card w-full sm:w-auto sm:min-w-[400px] sm:max-w-md sm:mx-4 sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Save to playlist</h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Create new */}
              {showCreate ? (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                    className="flex-1 aurora-bg text-white px-4 py-2.5 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-purple-500/50"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  />
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim() || isCreating}
                    className="px-4 py-2.5 bg-purple-500 text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {isCreating ? '...' : 'Add'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreate(false);
                      setNewPlaylistName('');
                    }}
                    className="p-2.5 text-white/50 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left mb-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Create new playlist</span>
                </button>
              )}

              {/* Playlist list */}
              {playlists.length === 0 ? (
                <p className="text-white/50 text-center py-4">No playlists yet</p>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => togglePlaylist(playlist.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden aurora-bg flex-shrink-0">
                      {playlist.coverUrl || playlist.previewVideos?.[0]?.thumbnailUrl ? (
                        <Image
                          src={playlist.coverUrl || playlist.previewVideos![0].thumbnailUrl!}
                          alt={playlist.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{playlist.name}</span>
                        {playlist.isPrivate && (
                          <svg className="w-3 h-3 text-white/50 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-white/50 text-sm">{playlist.videoCount} videos</span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        selectedPlaylists.has(playlist.id)
                          ? 'bg-purple-500'
                          : 'border border-white/20'
                      }`}
                    >
                      {selectedPlaylists.has(playlist.id) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-purple-500 text-white font-medium rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {isSaving ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
