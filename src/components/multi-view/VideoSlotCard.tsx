'use client';

import { RefObject } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import type { VideoSlot } from '@/hooks/useMultiView';

interface VideoSlotCardProps {
  slot: VideoSlot;
  index: number;
  layoutMode: 'grid' | 'focus' | 'pip';
  focusedSlot: number;
  videoRef: (el: HTMLVideoElement | null) => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onRemove: () => void;
  onFocus: () => void;
  onAddClick: () => void;
}

export function VideoSlotCard({
  slot,
  index,
  layoutMode,
  focusedSlot,
  videoRef,
  onTogglePlay,
  onToggleMute,
  onRemove,
  onFocus,
  onAddClick,
}: VideoSlotCardProps) {
  if (layoutMode === 'focus' && index !== focusedSlot) {
    return null;
  }

  if (!slot.video) {
    return (
      <button
        onClick={onAddClick}
        className="w-full h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/20 hover:border-pink-500 hover:bg-pink-500/5 transition"
      >
        <PlusIcon className="w-12 h-12 text-gray-600" />
        <span className="text-gray-400">Add Video</span>
      </button>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900">
      <video
        ref={videoRef}
        loop
        muted={slot.isMuted}
        playsInline
        className="w-full h-full object-contain"
        onClick={onTogglePlay}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
        <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
              {slot.video.userAvatar ? (
                <img src={slot.video.userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                  {(slot.video.username || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium">@{slot.video.username || 'user'}</span>
          </div>
          <button onClick={onRemove} className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={onTogglePlay} className="p-4 bg-black/50 hover:bg-black/70 rounded-full transition">
            {slot.isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
          <div className="text-sm truncate max-w-[70%]">{slot.video.title || slot.video.caption}</div>
          <button onClick={onToggleMute} className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition">
            {slot.isMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {layoutMode === 'grid' && (
        <button
          onClick={onFocus}
          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition"
          title="Focus on this video"
        >
          <ArrowsPointingOutIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
