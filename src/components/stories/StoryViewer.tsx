'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { StoryProgressBar } from './StoryProgressBar';
import { StoryReactionBar } from './StoryReactionBar';
import { useStoryViewer } from '@/hooks/useStoryViewer';
import type { StoryGroup } from '@/types/story';

interface StoryViewerProps {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  onMarkViewed: (storyId: string) => void;
  onReact: (storyId: string, emoji: string) => void;
  onReply?: (storyId: string, message: string) => void;
  onDMReply?: (userId: string, storyContext: string) => void;
  onClose: () => void;
}

export function StoryViewer({ storyGroups, initialGroupIndex, onMarkViewed, onReact, onReply, onDMReply, onClose }: StoryViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    activeGroupIndex,
    activeStoryIndex,
    activeGroup,
    activeStory,
    progress,
    goNext,
    goPrev,
    pause,
    resume,
    openGroup,
  } = useStoryViewer({ storyGroups, onMarkViewed, onClose });

  useEffect(() => {
    openGroup(initialGroupIndex);
  }, [initialGroupIndex, openGroup]);

  useEffect(() => {
    if (activeStory?.mediaType === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeStory?.id, activeStory?.mediaType]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  if (!activeGroup || !activeStory) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white/70 hover:text-white p-2">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Story content */}
      <div className="relative w-full max-w-[420px] h-full max-h-[90vh] rounded-2xl overflow-hidden bg-neutral-900">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-30">
          <StoryProgressBar
            count={activeGroup.stories.length}
            activeIndex={activeStoryIndex}
            progress={progress}
          />

          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {activeGroup.userAvatar ? (
                <Image src={activeGroup.userAvatar} alt={activeGroup.username} width={32} height={32} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  {activeGroup.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-white text-sm font-medium">{activeGroup.username}</span>
            <span className="text-white/40 text-xs">
              {new Date(activeStory.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Tap zones */}
        <div className="absolute inset-0 z-20 flex">
          <button className="w-1/3 h-full" onClick={goPrev} onPointerDown={pause} onPointerUp={resume} aria-label="Previous" />
          <button className="w-1/3 h-full" onPointerDown={pause} onPointerUp={resume} aria-label="Pause" />
          <button className="w-1/3 h-full" onClick={goNext} onPointerDown={pause} onPointerUp={resume} aria-label="Next" />
        </div>

        {/* Media */}
        <div className="absolute inset-0">
          {activeStory.mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={activeStory.mediaUrl}
              className="w-full h-full object-cover"
              playsInline
              muted={false}
            />
          ) : (
            <Image
              src={activeStory.mediaUrl}
              alt={activeStory.caption || 'Story'}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Caption */}
        {activeStory.caption && (
          <div className="absolute bottom-24 left-0 right-0 px-4 z-20">
            <p className="text-white text-sm drop-shadow-lg">{activeStory.caption}</p>
          </div>
        )}

        {/* Gradient overlay for bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

        {/* Reaction bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <StoryReactionBar
            onReact={(emoji) => onReact(activeStory.id, emoji)}
            onReply={(message) => onReply?.(activeStory.id, message)}
            onDMReply={onDMReply ? () => onDMReply(activeGroup.userId, `Re: ${activeGroup.username}'s story`) : undefined}
          />
        </div>
      </div>

      {/* Nav arrows for desktop */}
      {activeGroupIndex > 0 && (
        <button
          onClick={() => openGroup(activeGroupIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full items-center justify-center text-white/70 hover:text-white hidden md:flex"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {activeGroupIndex < storyGroups.length - 1 && (
        <button
          onClick={() => openGroup(activeGroupIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full items-center justify-center text-white/70 hover:text-white hidden md:flex"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
