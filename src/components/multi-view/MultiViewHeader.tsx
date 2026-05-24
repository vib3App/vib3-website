'use client';

import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import type { VideoSlot, ViewMode } from '@/hooks/useMultiView';

interface MultiViewHeaderProps {
  slots: VideoSlot[];
  layoutMode: 'grid' | 'focus' | 'pip';
  masterMuted: boolean;
  viewMode: ViewMode;
  onLayoutChange: (mode: 'grid' | 'focus' | 'pip') => void;
  onViewModeChange: (mode: ViewMode) => void;
  onMasterMuteToggle: () => void;
  onPlayAll: () => void;
  onPauseAll: () => void;
}

export function MultiViewHeader({
  slots,
  layoutMode,
  masterMuted,
  viewMode,
  onLayoutChange,
  onViewModeChange,
  onMasterMuteToggle,
  onPlayAll,
  onPauseAll,
}: MultiViewHeaderProps) {
  const anyPlaying = slots.some(s => s.isPlaying && s.video);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-full px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Multi-View</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/10 rounded-full p-1 text-xs">
            <button
              onClick={() => onViewModeChange('videos')}
              className={`px-3 py-1 rounded-full transition ${viewMode === 'videos' ? 'bg-white text-black' : 'text-white/80'}`}
              title="Pick individual videos"
            >
              Videos
            </button>
            <button
              onClick={() => onViewModeChange('feeds')}
              className={`px-3 py-1 rounded-full transition ${viewMode === 'feeds' ? 'bg-white text-black' : 'text-white/80'}`}
              title="Scrollable feed per slot"
            >
              Feeds
            </button>
          </div>

          {viewMode === 'videos' && (
            <div className="flex items-center bg-white/10 rounded-full p-1">
              <button
                onClick={() => onLayoutChange('grid')}
                className={`p-2 rounded-full transition ${layoutMode === 'grid' ? 'bg-white text-black' : ''}`}
                title="Grid view"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onLayoutChange('focus')}
                className={`p-2 rounded-full transition ${layoutMode === 'focus' ? 'bg-white text-black' : ''}`}
                title="Focus view"
              >
                <ArrowsPointingOutIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <button onClick={onMasterMuteToggle} className="p-2 hover:bg-white/10 rounded-full transition" aria-label={masterMuted ? "Unmute all" : "Mute all"}>
            {masterMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
          </button>

          <button
            onClick={anyPlaying ? onPauseAll : onPlayAll}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label={anyPlaying ? "Pause all" : "Play all"}
          >
            {anyPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
