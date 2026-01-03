'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { BottomNav } from '@/components/ui/BottomNav';
import { soundsApi } from '@/services/api/sounds';
import type { MusicTrack } from '@/types/sound';
import type { Video } from '@/types';

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

export default function SoundDetailPage({ params }: { params: Promise<{ soundId: string }> }) {
  const { soundId } = use(params);
  const router = useRouter();
  const [track, setTrack] = useState<MusicTrack | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => typeof Audio !== 'undefined' ? new Audio() : null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [trackData, videosData] = await Promise.all([
          soundsApi.getTrack(soundId),
          soundsApi.getVideosBySound(soundId),
        ]);
        setTrack(trackData);
        setIsSaved(trackData?.isSaved || false);
        setVideos(videosData.data);
      } catch (error) {
        console.error('Failed to load sound:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      audio?.pause();
    };
  }, [soundId, audio]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPreview = () => {
    if (!audio || !track) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = track.previewUrl || track.audioUrl;
      audio.play().catch(console.error);
      setIsPlaying(true);

      audio.onended = () => setIsPlaying(false);
    }
  };

  const handleSave = async () => {
    if (!track) return;
    const success = await soundsApi.saveTrack(track.id);
    if (success) {
      setIsSaved(!isSaved);
    }
  };

  const handleUseSound = () => {
    router.push(`/camera?sound=${soundId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen aurora-bg pb-20">
        <TopNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen aurora-bg pb-20">
        <TopNav />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <MusicIcon className="w-16 h-16 text-white/20 mb-4" />
          <p className="text-white/50 text-center">Sound not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-white/10 text-white rounded-full"
          >
            Go Back
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-4">
        {/* Sound Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
            {track.coverUrl ? (
              <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MusicIcon className="w-10 h-10 text-white" />
              </div>
            )}
            <button
              onClick={handlePlayPreview}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              {isPlaying ? (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{track.title}</h1>
            <p className="text-white/60">{track.artist}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-white/40">
              <span>{formatDuration(track.duration)}</span>
              {track.plays > 0 && <span>{track.plays.toLocaleString()} plays</span>}
            </div>
            {track.isOriginalSound && track.originalUsername && (
              <Link
                href={`/@${track.originalUsername}`}
                className="inline-flex items-center gap-1 mt-2 text-sm text-purple-400"
              >
                <span>Original by @{track.originalUsername}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleUseSound}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl"
          >
            Use this sound
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-3 rounded-xl transition-colors ${
              isSaved ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button className="px-4 py-3 bg-white/10 text-white rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>

        {/* Videos using this sound */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Videos using this sound
            {videos.length > 0 && (
              <span className="text-white/40 font-normal ml-2">{videos.length}</span>
            )}
          </h2>

          {videos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/video/${video.id}`}
                  className="aspect-[9/16] bg-white/5 rounded-lg overflow-hidden relative group"
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>{(video.viewsCount || 0).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40">No videos using this sound yet</p>
              <button
                onClick={handleUseSound}
                className="mt-3 text-purple-400 text-sm"
              >
                Be the first to use it!
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
