'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { videoApi } from '@/services/api';
import type { Comment } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { CommentItem } from './CommentItem';
import { VoiceRecorder } from './VoiceRecorder';

interface CommentsDrawerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  commentsCount?: number;
  onCommentAdded?: () => void;
}

export function CommentsDrawer({
  videoId,
  isOpen,
  onClose,
  commentsCount,
  onCommentAdded,
}: CommentsDrawerProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadComments = useCallback(async (pageNum: number, append = false) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await videoApi.getComments(videoId, pageNum, 20);
      if (append) {
        setComments(prev => [...prev, ...response.items]);
      } else {
        setComments(response.items);
      }
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [videoId, isLoading]);

  useEffect(() => {
    if (isOpen && comments.length === 0) {
      loadComments(1);
    }
  }, [isOpen, loadComments, comments.length]);

  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadComments(page + 1, true);
    }
  }, [isLoading, hasMore, page, loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      let comment: Comment;
      if (replyingTo) {
        comment = await videoApi.replyToComment(videoId, replyingTo.id, newComment.trim());
        // Add reply to parent comment
        setComments(prev => prev.map(c => {
          if (c.id === replyingTo.id) {
            return {
              ...c,
              replyCount: c.replyCount + 1,
              replies: [...(c.replies || []), comment],
            };
          }
          return c;
        }));
      } else {
        comment = await videoApi.addComment(videoId, newComment.trim());
        setComments(prev => [comment, ...prev]);
      }
      setNewComment('');
      setReplyingTo(null);
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceComment = async (audioBlob: Blob) => {
    if (!isAuthenticated) return;

    try {
      const comment = await videoApi.addVoiceComment(videoId, audioBlob);
      setComments(prev => [comment, ...prev]);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Failed to post voice comment:', error);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const handleLike = async (commentId: string) => {
    try {
      const result = await videoApi.toggleCommentLike(videoId, commentId);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, isLiked: result.liked, likesCount: result.likesCount };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r =>
              r.id === commentId
                ? { ...r, isLiked: result.liked, likesCount: result.likesCount }
                : r
            ),
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await videoApi.deleteComment(videoId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Drawer */}
      <div className="relative glass-card w-full max-w-lg md:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-white font-semibold">
            {(commentsCount ?? comments.length).toLocaleString()} comments
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onReply={handleReply}
              onLike={handleLike}
              onDelete={handleDelete}
              onLoadReplies={async (commentId) => {
                const response = await videoApi.getCommentReplies(videoId, commentId);
                setComments(prev => prev.map(c =>
                  c.id === commentId ? { ...c, replies: response.items } : c
                ));
              }}
            />
          ))}

          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && comments.length === 0 && (
            <div className="text-center text-white/50 py-8">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>

        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <VoiceRecorder
            onComplete={handleVoiceComment}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        )}

        {/* Input Area */}
        <div className="border-t border-white/10 p-4">
          {replyingTo && (
            <div className="flex items-center gap-2 mb-2 text-sm">
              <span className="text-white/50">Replying to</span>
              <span className="text-purple-400">@{replyingTo.username}</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-auto text-white/50 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden aurora-bg flex-shrink-0">
                {user?.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.username || ''}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center aurora-bg rounded-full px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                />

                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(true)}
                  className="text-white/50 hover:text-white p-1 mr-2"
                  title="Voice comment"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>

              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="text-purple-400 font-semibold disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'Post'}
              </button>
            </form>
          ) : (
            <div className="text-center text-white/50 text-sm">
              <a href="/login" className="text-purple-400 hover:underline">Log in</a> to comment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
