'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { collectionsApi } from '@/services/api';
import type { Collection, CollectionVideo } from '@/types';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  onUpdated: (collection: Collection) => void;
}

function EditPlaylistModal({ isOpen, onClose, collection, onUpdated }: EditPlaylistModalProps) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || '');
  const [isPrivate, setIsPrivate] = useState(collection.isPrivate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(collection.name);
    setDescription(collection.description || '');
    setIsPrivate(collection.isPrivate);
  }, [collection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updated = await collectionsApi.updatePlaylist(collection.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        isPrivate,
      });
      onUpdated(updated);
      onClose();
    } catch (error) {
      console.error('Failed to update playlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Edit Playlist</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/50 text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist name"
              className="w-full bg-[#0A0E1A] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white/50 text-sm mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full bg-[#0A0E1A] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1] resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                isPrivate ? 'bg-[#6366F1]' : 'bg-[#0A0E1A] border border-white/20'
              }`}
              onClick={() => setIsPrivate(!isPrivate)}
            >
              {isPrivate && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-white">Private playlist</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 py-3 rounded-xl bg-[#6366F1] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CollectionPage() {
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

  const handleRemoveVideo = async (videoId: string) => {
    try {
      await collectionsApi.removeFromCollection(collectionId, videoId);
      setVideos(prev => prev.filter(v => v.videoId !== videoId));
      if (collection) {
        setCollection({ ...collection, videoCount: collection.videoCount - 1 });
      }
    } catch (error) {
      console.error('Failed to remove video:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this playlist? This cannot be undone.')) return;
    try {
      await collectionsApi.deletePlaylist(collectionId);
      router.push('/collections');
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const isOwner = collection && user && collection.userId === user.id;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-4 px-4 h-14">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-white/50 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white flex-1 truncate">
              {collection?.name || 'Loading...'}
            </h1>
            {isOwner && collection?.type === 'playlist' && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-white/50 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-[#1A1F2E] rounded-lg shadow-xl overflow-hidden z-10 min-w-[150px]">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-white hover:bg-white/5 text-left text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-red-500 hover:bg-white/5 text-left text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Collection Info */}
        {collection && (
          <div className="p-4 border-b border-white/5">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#1A1F2E] flex-shrink-0">
                {collection.coverUrl || collection.previewVideos?.[0]?.thumbnailUrl ? (
                  <Image
                    src={collection.coverUrl || collection.previewVideos![0].thumbnailUrl!}
                    alt={collection.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-lg truncate">{collection.name}</h2>
                  {collection.isPrivate && (
                    <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  )}
                </div>
                {collection.description && (
                  <p className="text-white/50 text-sm mt-1 line-clamp-2">{collection.description}</p>
                )}
                <p className="text-white/30 text-sm mt-2">
                  {formatCount(collection.videoCount)} videos
                </p>
              </div>
            </div>

            {videos.length > 0 && (
              <Link
                href={`/feed?playlist=${collection.id}`}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#6366F1] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play all
              </Link>
            )}
          </div>
        )}

        {/* Videos List */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
              </svg>
              <p className="text-white/50">No videos in this playlist</p>
              <Link
                href="/feed"
                className="inline-block mt-4 px-6 py-2 bg-[#6366F1] text-white rounded-full hover:opacity-90 transition-opacity"
              >
                Browse videos
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((item, index) => (
                <div key={item.videoId} className="flex gap-3 group">
                  <span className="text-white/30 text-sm w-6 text-center pt-2">{index + 1}</span>
                  <Link
                    href={`/feed?video=${item.videoId}`}
                    className="flex-1 flex gap-3 p-2 -m-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-[#1A1F2E] flex-shrink-0">
                      {item.video.thumbnailUrl ? (
                        <Image
                          src={item.video.thumbnailUrl}
                          alt={item.video.caption || 'Video'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {formatDuration(item.video.duration)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm line-clamp-2">{item.video.caption || 'Untitled'}</p>
                      <p className="text-white/50 text-xs mt-1">@{item.video.username}</p>
                      <p className="text-white/30 text-xs">{formatCount(item.video.viewsCount || 0)} views</p>
                    </div>
                  </Link>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveVideo(item.videoId)}
                      className="p-2 text-white/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {hasMore && (
                <button
                  onClick={() => loadVideos(page + 1, true)}
                  className="w-full py-3 text-[#6366F1] hover:text-[#5558E3] text-sm font-medium"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {collection && (
        <EditPlaylistModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          collection={collection}
          onUpdated={setCollection}
        />
      )}
    </div>
  );
}
