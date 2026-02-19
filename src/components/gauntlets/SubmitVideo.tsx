'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { gauntletsApi } from '@/services/api/gauntlets';
import { userApi } from '@/services/api/user';
import { useAuthStore } from '@/stores/authStore';
import { logger } from '@/utils/logger';
import type { Video } from '@/types';

interface SubmitVideoProps {
  gauntletId: string;
  roundNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function SubmitVideo({ gauntletId, roundNumber, isOpen, onClose, onSubmitted }: SubmitVideoProps) {
  const { user } = useAuthStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    setIsLoading(true);
    userApi.getUserVideos(user.id, 1, 50)
      .then(({ videos: data }) => setVideos(data))
      .catch((err) => logger.error('Failed to load videos:', err))
      .finally(() => setIsLoading(false));
  }, [isOpen, user?.id]);

  const handleSubmit = useCallback(async () => {
    if (!selectedVideo) return;
    setIsSubmitting(true);
    try {
      await gauntletsApi.submitRoundVideo(gauntletId, roundNumber, {
        videoId: selectedVideo.id,
        videoUrl: selectedVideo.videoUrl || '',
        thumbnailUrl: selectedVideo.thumbnailUrl,
      });
      setSubmitted(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      logger.error('Failed to submit video:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedVideo, gauntletId, roundNumber, onSubmitted, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Submit Video - Round {roundNumber}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">Video Submitted</p>
            {selectedVideo?.thumbnailUrl && (
              <div className="mt-3 w-20 h-28 mx-auto rounded-lg overflow-hidden">
                <Image src={selectedVideo.thumbnailUrl} alt="" width={80} height={112} className="object-cover" />
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40">No videos found. Upload a video first.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/50 text-sm">Select a video to submit:</p>
            <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`relative aspect-[9/16] rounded-lg overflow-hidden transition-all ${
                    selectedVideo?.id === video.id
                      ? 'ring-2 ring-purple-500 scale-[1.02]'
                      : 'hover:ring-1 hover:ring-white/20'
                  }`}
                >
                  {video.thumbnailUrl ? (
                    <Image src={video.thumbnailUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  )}
                  {selectedVideo?.id === video.id && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selectedVideo || isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Video'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
