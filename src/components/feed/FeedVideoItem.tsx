'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { useSocialStore } from '@/stores/socialStore';
import type { Video } from '@/types';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

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
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!video.isLiked) {
        onLike();
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTapRef.current = now;
  };

  return (
    <div className="relative w-full h-full snap-start snap-always flex-shrink-0">
      {/* Video */}
      <div className="absolute inset-0" onClick={handleDoubleTap}>
        <VideoPlayer
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          autoPlay={isActive}
          muted={isMuted}
          loop
          isActive={isActive}
          showControls={false}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Double tap heart animation */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <svg className="w-32 h-32 text-red-500 animate-ping" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Mute button */}
      <MuteButton isMuted={isMuted} onToggle={onMuteToggle} />

      {/* Video Info - Bottom Left */}
      <VideoInfo video={video} />

      {/* Action Buttons - Right Side */}
      <ActionButtons
        video={video}
        userId={userId}
        onLike={onLike}
        onSave={onSave}
        onFollow={onFollow}
        onComment={onComment}
        onShare={onShare}
      />
    </div>
  );
}

function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="absolute top-20 md:top-14 right-4 z-50 p-2.5 bg-black/50 backdrop-blur-sm rounded-full"
    >
      {isMuted ? (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </button>
  );
}

function VideoInfo({ video }: { video: Video }) {
  return (
    <div className="absolute bottom-32 md:bottom-20 left-4 right-4 z-20">
      <p className="text-white/95 text-sm line-clamp-2 mb-2 drop-shadow-lg">{video.caption}</p>
      {Array.isArray(video.hashtags) && video.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {video.hashtags.slice(0, 4).map(tag => (
            <Link key={tag} href={`/hashtag/${tag}`} className="text-amber-300/90 text-sm hover:text-amber-200 font-medium">
              #{tag}
            </Link>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <span className="text-white/80 text-sm">{video.musicInfo?.title || 'Original Sound'}</span>
      </div>
    </div>
  );
}

function ActionButtons({
  video,
  userId,
  onLike,
  onSave,
  onFollow,
  onComment,
  onShare,
}: {
  video: Video;
  userId?: string;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  // Use social store to check real follow status
  const { isFollowing } = useSocialStore();
  const isFollowingCreator = isFollowing(video.userId);
  const isOwnVideo = video.userId === userId;

  return (
    <>
      {/* Creator info - Top left */}
      <div className="absolute top-16 md:top-4 left-4 z-20">
        <Link href={`/profile/${video.userId}`} className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-white/20">
              {video.userAvatar ? (
                <Image src={video.userAvatar} alt={video.username} width={44} height={44} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                  {(video.username || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            {!isOwnVideo && (
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onFollow(); }}
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center ${
                  isFollowingCreator ? 'bg-green-500' : 'bg-amber-500'
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
          <span className="text-white font-semibold text-sm drop-shadow-lg">@{video.username}</span>
        </Link>
      </div>

      {/* Action bar - Bottom horizontal */}
      <div className="absolute bottom-20 md:bottom-4 left-4 right-4 z-20">
        <div className="flex items-center justify-between bg-black/30 backdrop-blur-md rounded-2xl px-2 py-2">
          {/* Like */}
          <button onClick={(e) => { e.stopPropagation(); onLike(); }} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition">
            <div className={`transition-transform ${video.isLiked ? 'scale-110' : ''}`}>
              {video.isLiked ? (
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </div>
            <span className="text-white text-sm font-medium">{formatCount(video.likesCount)}</span>
          </button>

          {/* Comments */}
          <button onClick={(e) => { e.stopPropagation(); onComment(); }} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-white text-sm font-medium">{formatCount(video.commentsCount)}</span>
          </button>

          {/* Save */}
          <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition">
            {video.isFavorited ? (
              <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>

          {/* Share */}
          <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* Remix */}
          <Link href={`/remix/${video.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Link>

          {/* Sound disc */}
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/20 animate-spin flex-shrink-0" style={{ animationDuration: '3s' }}>
            {video.thumbnailUrl ? (
              <Image src={video.thumbnailUrl} alt="Sound" width={32} height={32} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
