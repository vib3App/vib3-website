'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { videoApi } from '@/services/api';
import type { Video } from '@/types';

interface VideoActionsProps {
  video: Video;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  orientation?: 'vertical' | 'horizontal';
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function VideoActions({
  video,
  onCommentClick,
  onShareClick,
  orientation = 'vertical',
}: VideoActionsProps) {
  const { isAuthenticated } = useAuthStore();
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // Optimistic update with animation
    setIsLikeAnimating(true);
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    setTimeout(() => setIsLikeAnimating(false), 300);

    try {
      await videoApi.toggleLike(video.id);
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setIsSaved(!isSaved);
    // TODO: Implement save API
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.caption || 'Check out this video on VIB3',
        url: `${window.location.origin}/video/${video.id}`,
      });
    } else {
      onShareClick?.();
    }
  };

  const isVertical = orientation === 'vertical';
  const containerClass = isVertical
    ? 'flex flex-col items-center gap-4'
    : 'flex items-center gap-6';
  const buttonClass = isVertical
    ? 'flex flex-col items-center gap-1'
    : 'flex items-center gap-2';

  return (
    <div className={containerClass}>
      {/* Profile */}
      <Link
        href={`/profile/${video.userId}`}
        className="relative"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-purple-400 transition-all">
          {video.userAvatar ? (
            <Image
              src={video.userAvatar}
              alt={video.username}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold">
              {video.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </Link>

      {/* Like */}
      <button onClick={handleLike} className={buttonClass}>
        <div className={`transition-transform ${isLikeAnimating ? 'scale-125' : ''}`}>
          {isLiked ? (
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </div>
        <span className="text-white text-xs font-medium">{formatCount(likesCount)}</span>
      </button>

      {/* Comments */}
      <button onClick={onCommentClick} className={buttonClass}>
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-white text-xs font-medium">{formatCount(video.commentsCount || 0)}</span>
      </button>

      {/* Save/Bookmark */}
      <button onClick={handleSave} className={buttonClass}>
        {isSaved ? (
          <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )}
        <span className="text-white text-xs font-medium">Save</span>
      </button>

      {/* Share */}
      <button onClick={handleShare} className={buttonClass}>
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="text-white text-xs font-medium">{formatCount(video.sharesCount || 0)}</span>
      </button>

      {/* More options */}
      <button className={buttonClass}>
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </div>
  );
}
