'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (comment: Comment) => void;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onLoadReplies: (commentId: string) => Promise<void>;
  isReply?: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onLike,
  onDelete,
  onLoadReplies,
  isReply = false,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isOwner = currentUserId === comment.userId;
  const timeAgo = formatTimeAgo(comment.createdAt);

  const handleToggleReplies = async () => {
    if (!showReplies && comment.replyCount > 0 && !comment.replies?.length) {
      setLoadingReplies(true);
      await onLoadReplies(comment.id);
      setLoadingReplies(false);
    }
    setShowReplies(!showReplies);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = () => setIsPlaying(false);
    }
  }, []);

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10' : ''}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden aurora-bg flex-shrink-0">
        {comment.userAvatar ? (
          <Image
            src={comment.userAvatar}
            alt={comment.username}
            width={32}
            height={32}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-bold">
            {(comment.username || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">{comment.username}</span>
          <span className="text-white/30 text-xs">{timeAgo}</span>
        </div>

        {/* Voice Comment */}
        {comment.voiceUrl ? (
          <div className="mt-2 flex items-center gap-2 aurora-bg rounded-full px-3 py-2 w-fit">
            <button
              onClick={toggleAudio}
              className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="flex gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-purple-500 rounded-full"
                  style={{ height: `${Math.random() * 16 + 8}px` }}
                />
              ))}
            </div>
            <span className="text-white/50 text-xs">
              {comment.voiceDuration ? `${Math.round(comment.voiceDuration)}s` : ''}
            </span>
            <audio ref={audioRef} src={comment.voiceUrl} className="hidden" />
          </div>
        ) : (
          <p className="text-white/80 text-sm mt-1 break-words">{comment.content}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center gap-1 text-xs ${
              comment.isLiked ? 'text-red-500' : 'text-white/50 hover:text-white'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={comment.isLiked ? 'currentColor' : 'none'}
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
            {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
          </button>

          {!isReply && (
            <button
              onClick={() => onReply(comment)}
              className="text-white/50 hover:text-white text-xs"
            >
              Reply
            </button>
          )}

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-white/50 hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                  <circle cx="5" cy="12" r="2" />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-6 aurora-bg rounded-lg shadow-xl z-20 py-1 min-w-[100px]">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(comment.id);
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Replies */}
        {!isReply && comment.replyCount > 0 && (
          <button
            onClick={handleToggleReplies}
            className="text-purple-400 text-xs mt-2 flex items-center gap-1"
          >
            {loadingReplies ? (
              <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg
                  className={`w-3 h-3 transition-transform ${showReplies ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showReplies ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </>
            )}
          </button>
        )}

        {showReplies && comment.replies && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                onLoadReplies={onLoadReplies}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
