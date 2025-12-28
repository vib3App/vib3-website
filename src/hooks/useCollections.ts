'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { collectionsApi } from '@/services/api';
import type { Collection } from '@/types';

export type CollectionTabType = 'playlists' | 'saved' | 'liked' | 'history';

export function useCollections() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
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
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/collections');
      return;
    }
    loadCollections();
  }, [isAuthenticated, router, loadCollections]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await collectionsApi.deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const handleCreated = (collection: Collection) => {
    setPlaylists(prev => [collection, ...prev]);
  };

  return {
    isAuthenticated,
    activeTab,
    setActiveTab,
    playlists,
    isLoading,
    showCreateModal,
    setShowCreateModal,
    handleDelete,
    handleCreated,
  };
}
