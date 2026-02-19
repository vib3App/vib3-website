'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { useSocialStore } from '@/stores/socialStore';
import { ActionButtons } from '@/components/feed/ActionButtons';
import { DoubleTapLike } from './DoubleTapLike';
import { SpeedControl } from './SpeedControl';
import type { Video } from '@/types';

interface FeedVideoItemProps {
  video: Video;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onComment: () => void;
  onShare: () => void;
  userId?: string;
}

export function FeedVideoItem({
  video,
  isActive,
  isMuted,
  onMuteToggle,
  onLike,
  onSave,
  onFollow,
  onComment,
  onShare,
  userId,
}: FeedVideoItemProps) {
  const videoRef = useRef<React.RefObject<HTMLVideoElement | null> | null>(null);

  const handleDoubleTap = useCallback(() => {
    if (!video.isLiked) {
      onLike();
    }
  }, [video.isLiked, onLike]);

  const handleVideoRef = useCallback(
    (ref: React.RefObject<HTMLVideoElement | null>) => {
      videoRef.current = ref;
    },
    []
  );

  return (
    <div className="relative w-full h-full snap-start snap-always flex-shrink-0">
      {/* Video with double-tap detection */}
      <DoubleTapLike onDoubleTap={handleDoubleTap}>
        <div className="absolute inset-0">
          <VideoPlayer
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            autoPlay={isActive}
            muted={isMuted}
            loop
            isActive={isActive}
            showControls={false}
            className="w-full h-full object-cover"
            videoId={video.id}
            onVideoRef={handleVideoRef}
          />
        </div>
      </DoubleTapLike>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Mute button */}
      <MuteButton isMuted={isMuted} onToggle={onMuteToggle} />

      {/* Feed controls (speed) - top area */}
      <FeedPlayerControls videoRef={videoRef} />

      {/* Creator info - Top left */}
      <CreatorInfo video={video} userId={userId} onFollow={onFollow} />

      {/* Video Info - Bottom Left */}
      <VideoInfo video={video} />

      {/* Customizable Action Buttons */}
      <ActionButtons
        video={{
          id: video.id,
          isLiked: video.isLiked,
          isFavorited: video.isFavorited,
          hasCommented: video.hasCommented,
          hasShared: video.hasShared,
          likesCount: video.likesCount,
          commentsCount: video.commentsCount,
          sharesCount: video.sharesCount,
          savesCount: video.savesCount,
          thumbnailUrl: video.thumbnailUrl,
        }}
        onLike={onLike}
        onComment={() => onComment()}
        onSave={onSave}
        onShare={() => onShare()}
      />
    </div>
  );
}

/** Compact speed control overlay for feed videos */
function FeedPlayerControls({
  videoRef,
}: {
  videoRef: React.RefObject<React.RefObject<HTMLVideoElement | null> | null>;
}) {
  // Create a stable ref that points to the actual video element
  const actualVideoRef = useRef<HTMLVideoElement | null>(null);

  // Update the actual ref when the nested ref changes
  if (videoRef.current?.current && videoRef.current.current !== actualVideoRef.current) {
    actualVideoRef.current = videoRef.current.current;
  }

  return (
    <div className="absolute top-20 md:top-14 right-16 z-40 flex items-center gap-2">
      <SpeedControl videoRef={actualVideoRef as React.RefObject<HTMLVideoElement | null>} />
    </div>
  );
}

function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="absolute top-20 md:top-14 right-4 z-50 p-3 glass rounded-xl group transition-all hover:bg-white/10"
    >
      {isMuted ? (
        <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </button>
  );
}

function CreatorInfo({
  video,
  userId,
  onFollow,
}: {
  video: Video;
  userId?: string;
  onFollow: () => void;
}) {
  const { isFollowing } = useSocialStore();
  const isFollowingCreator = isFollowing(video.userId);
  const isOwnVideo = video.userId === userId;

  return (
    <div className="absolute top-16 md:top-4 left-4 z-20">
      <Link href={`/profile/${video.userId}`} className="group flex items-center gap-3 glass px-3 py-2 rounded-2xl transition-all hover:bg-white/10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl blur-sm opacity-50" />
          <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/20">
            {video.userAvatar ? (
              <Image src={video.userAvatar} alt={video.username} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                {(video.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          {!isOwnVideo && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onFollow(); }}
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                isFollowingCreator
                  ? 'bg-gradient-to-r from-green-400 to-teal-400'
                  : 'bg-gradient-to-r from-purple-500 to-teal-500 hover:scale-110'
              }`}
            >
              {isFollowingCreator ? (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          )}
        </div>
        <span className="text-white font-semibold text-sm group-hover:text-white/90 transition-colors">@{video.username}</span>
      </Link>
    </div>
  );
}

function VideoInfo({ video }: { video: Video }) {
  return (
    <div className="absolute bottom-32 md:bottom-20 left-4 right-20 z-10 space-y-2">
      <p className="text-white text-sm line-clamp-2 drop-shadow-lg">{video.caption}</p>

      {Array.isArray(video.hashtags) && video.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {video.hashtags.slice(0, 4).map(tag => (
            <Link
              key={tag}
              href={`/hashtag/${tag}`}
              className="px-2 py-0.5 text-xs font-medium text-white/80 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 hover:text-white transition-all"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full">
        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <span className="text-white/80 text-sm truncate max-w-[200px]">{video.musicInfo?.title || 'Original Sound'}</span>
      </div>
    </div>
  );
}
