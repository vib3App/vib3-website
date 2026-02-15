'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Video } from '@/types';
import { useVideoActionState, formatCount } from './useVideoActionState';

interface VideoActionsProps {
  video: Video;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  onCommentAdded?: () => void;
  orientation?: 'vertical' | 'horizontal';
}

export function VideoActions({
  video,
  onCommentClick,
  onShareClick,
  onCommentAdded,
  orientation = 'vertical',
}: VideoActionsProps) {
  const state = useVideoActionState(video, onCommentClick, onShareClick, onCommentAdded);

  const isVertical = orientation === 'vertical';
  const containerClass = isVertical ? 'flex flex-col items-center gap-4' : 'flex items-center gap-6';
  const buttonClass = isVertical ? 'flex flex-col items-center gap-1' : 'flex items-center gap-2';

  return (
    <div className={containerClass}>
      {/* Profile */}
      <Link href={`/profile/${video.userId}`} className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-purple-400 transition-all">
          {video.userAvatar ? (
            <Image src={video.userAvatar} alt={video.username} width={48} height={48} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold">
              {(video.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white" aria-label="Follow">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </Link>

      {/* Like */}
      <button onClick={state.handleLike} className={buttonClass} aria-label={state.isLiked ? "Unlike" : "Like"}>
        <div className={`transition-transform ${state.isLikeAnimating ? 'scale-125' : ''}`}>
          {state.isLiked ? (
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          )}
        </div>
        <span className="text-white text-xs font-medium">{formatCount(state.likesCount)}</span>
      </button>

      {/* Comments */}
      <button onClick={state.handleCommentClick} className={buttonClass} aria-label="Comments">
        <div className={`transition-transform ${state.isCommentAnimating ? 'scale-125' : ''}`}>
          {state.hasCommented ? (
            <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          )}
        </div>
        <span className="text-white text-xs font-medium">{formatCount(state.commentsCount)}</span>
      </button>

      {/* Save/Bookmark */}
      <button onClick={state.handleSave} className={buttonClass} aria-label={state.isSaved ? "Unsave" : "Save"}>
        <div className={`transition-transform ${state.isSaveAnimating ? 'scale-125' : ''}`}>
          {state.isSaved ? (
            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          )}
        </div>
        <span className="text-white text-xs font-medium">{formatCount(state.savesCount)}</span>
      </button>

      {/* Share */}
      <button onClick={state.handleShare} className={buttonClass} aria-label="Share">
        <div className={`transition-transform ${state.isShareAnimating ? 'scale-125' : ''}`}>
          {state.hasShared ? (
            <svg className="w-8 h-8 text-teal-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" /></svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          )}
        </div>
        <span className="text-white text-xs font-medium">{formatCount(state.sharesCount)}</span>
      </button>

      {/* Download */}
      <button onClick={state.handleDownload} disabled={state.isDownloading} className={buttonClass} aria-label="Download">
        <div className="relative">
          {state.isDownloading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </div>
        <span className="text-white text-xs font-medium">
          {state.isDownloading ? `${state.downloadProgress}%` : 'Download'}
        </span>
      </button>

    </div>
  );
}

export type { VideoActionsProps };
