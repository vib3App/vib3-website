'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { collectionsApi } from '@/services/api';
import type { Collection, CollectionVideo } from '@/types';

export function useCollectionDetail() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [videos, setVideos] = useState<CollectionVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = collection && user && collection.userId === user.id;

  const loadCollection = useCallback(async () => {
    try {
      const data = await collectionsApi.getCollection(collectionId);
      setCollection(data);
    } catch (error) {
      console.error('Failed to load collection:', error);
    }
  }, [collectionId]);

  const loadVideos = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await collectionsApi.getCollectionVideos(collectionId, pageNum);
      if (append) {
        setVideos(prev => [...prev, ...response.items]);
      } else {
        setVideos(response.items);
      }
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/collections');
      return;
    }
    loadCollection();
    loadVideos(1);
  }, [isAuthenticated, router, loadCollection, loadVideos]);

  const handleRemoveVideo = useCallback(async (videoId: string) => {
    try {
      await collectionsApi.removeFromCollection(collectionId, videoId);
      setVideos(prev => prev.filter(v => v.videoId !== videoId));
      if (collection) {
        setCollection({ ...collection, videoCount: collection.videoCount - 1 });
      }
    } catch (error) {
      console.error('Failed to remove video:', error);
    }
  }, [collectionId, collection]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this playlist? This cannot be undone.')) return;
    try {
      await collectionsApi.deletePlaylist(collectionId);
      router.push('/collections');
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  }, [collectionId, router]);

  const loadMoreVideos = useCallback(() => {
    loadVideos(page + 1, true);
  }, [page, loadVideos]);

  return {
    collection,
    setCollection,
    videos,
    isLoading,
    hasMore,
    showEditModal,
    setShowEditModal,
    showMenu,
    setShowMenu,
    isOwner,
    isAuthenticated,
    handleRemoveVideo,
    handleDelete,
    loadMoreVideos,
    goBack: () => router.back(),
  };
}
