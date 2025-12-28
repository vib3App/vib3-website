'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { videoApi } from '@/services/api';

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSheetProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}

function CommentItem({ comment }: { comment: Comment }) {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div className="flex gap-3 py-3">
      <Link href={`/profile/${comment.userId}`}>
        <div className="w-10 h-10 rounded-full overflow-hidden glass flex-shrink-0">
          {comment.userAvatar ? (
            <Image
              src={comment.userAvatar}
              alt={comment.username}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 font-medium">
              {comment.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${comment.userId}`} className="text-white/70 text-sm font-medium hover:underline">
            {comment.username}
          </Link>
          <span className="text-white/30 text-xs">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-white text-sm mt-1">{comment.text}</p>
        <div className="flex items-center gap-4 mt-2">
          <button className="text-white/50 text-xs hover:text-white">Reply</button>
        </div>
      </div>
      <button onClick={handleLike} className="flex flex-col items-center gap-1 self-center">
        {isLiked ? (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
        <span className="text-white/30 text-xs">{likesCount}</span>
      </button>
    </div>
  );
}

export function CommentSheet({ videoId, isOpen, onClose }: CommentSheetProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && videoId) {
      loadComments();
    }
  }, [isOpen, videoId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await videoApi.getComments(videoId);
      // Map API response to our Comment interface
      setComments(data.items.map(item => ({
        id: item.id,
        userId: item.userId,
        username: item.username,
        userAvatar: item.userAvatar,
        text: item.content,
        likesCount: item.likesCount,
        createdAt: item.createdAt,
      })));
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !isAuthenticated || isPosting) return;

    setIsPosting(true);
    try {
      const result = await videoApi.addComment(videoId, newComment);
      setComments(prev => [{
        id: result.id || Date.now().toString(),
        userId: user!.id,
        username: user!.username,
        userAvatar: user!.profilePicture,
        text: result.content || newComment,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 aurora-bg rounded-t-3xl max-h-[70vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-white/5">
          <h2 className="text-white font-semibold">{comments.length} comments</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-white/50">No comments yet</p>
              <p className="text-white/30 text-sm">Be the first to comment!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-white/5 aurora-bg">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden glass flex-shrink-0">
                {user?.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 font-medium">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                placeholder="Add a comment..."
                className="flex-1 glass-card text-white px-4 py-3 rounded-full outline-none placeholder:text-white/30"
              />
              <button
                onClick={handlePostComment}
                disabled={!newComment.trim() || isPosting}
                className="text-purple-400 font-semibold disabled:opacity-50"
              >
                {isPosting ? '...' : 'Post'}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="block text-center py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-full"
            >
              Log in to comment
            </Link>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
