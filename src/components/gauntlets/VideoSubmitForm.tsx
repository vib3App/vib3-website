'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { userApi } from '@/services/api/user';
import { useAuthStore } from '@/stores/authStore';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

interface VideoSubmitFormProps {
  onSubmit: (videoId: string) => void;
  isSubmitting: boolean;
}

export function VideoSubmitForm({ onSubmit, isSubmitting }: VideoSubmitFormProps) {
  const { user } = useAuthStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const { videos: data } = await userApi.getUserVideos(user.id, 1, 50);
        setVideos(data);
      } catch (err) {
        logger.error('Failed to load videos:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => <div key={i} className="aspect-[9/16] bg-white/5 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (videos.length === 0) {
    return <div className="text-center py-12"><p className="text-white/40">No videos to submit. Upload one first.</p></div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-white/60 text-sm">Select a video to submit:</p>
      <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
        {videos.map(video => (
          <button key={video.id} onClick={() => setSelectedId(video.id)}
            className={`relative aspect-[9/16] rounded-lg overflow-hidden transition-all ${
              selectedId === video.id ? 'ring-2 ring-purple-500 scale-[1.02]' : 'hover:ring-1 hover:ring-white/20'}`}>
            {video.thumbnailUrl ? (
              <Image src={video.thumbnailUrl} alt={video.caption || ''} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </div>
            )}
            {selectedId === video.id && (
              <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      <button onClick={() => selectedId && onSubmit(selectedId)} disabled={!selectedId || isSubmitting}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 transition">
        {isSubmitting ? 'Submitting...' : 'Submit Video'}
      </button>
    </div>
  );
}
