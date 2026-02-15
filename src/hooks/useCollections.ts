'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { collectionsApi } from '@/services/api';
import { useConfirmStore } from '@/stores/confirmStore';
import type { Collection } from '@/types';
import { logger } from '@/utils/logger';

export type CollectionTabType = 'playlists' | 'saved' | 'liked' | 'history';

export function useCollections() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const confirmDialog = useConfirmStore(s => s.show);
  const [activeTab, setActiveTab] = useState<CollectionTabType>('playlists');
  const [playlists, setPlaylists] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const collections = await collectionsApi.getCollections('playlist');
      setPlaylists(collections);
    } catch (error) {
      logger.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to be verified before checking isAuthenticated
    if (!isAuthVerified) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/login?redirect=/collections');
      return;
    }
    loadCollections();
  }, [isAuthenticated, isAuthVerified, router, loadCollections]);

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Playlist', message: 'Delete this playlist?', variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await collectionsApi.deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      logger.error('Failed to delete playlist:', error);
    }
  };

  const handleCreated = (collection: Collection) => {
    setPlaylists(prev => [collection, ...prev]);
  };

  return {
    isAuthenticated,
    isAuthVerified,
    activeTab,
    setActiveTab,
    playlists,
    isLoading: isLoading || !isAuthVerified, // Show loading while auth is being verified
    showCreateModal,
    setShowCreateModal,
    handleDelete,
    handleCreated,
  };
}
