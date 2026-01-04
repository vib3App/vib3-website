'use client';

import { useEffect } from 'react';

interface VideoShortcutHandlers {
  onPlayPause?: () => void;
  onSeekForward?: (seconds: number) => void;
  onSeekBackward?: (seconds: number) => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  onFullscreen?: () => void;
  onPiP?: () => void;
  onNextVideo?: () => void;
  onPrevVideo?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function useVideoShortcuts(handlers: VideoShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlers.onPlayPause?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlers.onSeekBackward?.(5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handlers.onSeekForward?.(5);
          break;
        case 'j':
          e.preventDefault();
          handlers.onSeekBackward?.(10);
          break;
        case 'l':
          if (!e.shiftKey) {
            e.preventDefault();
            handlers.onSeekForward?.(10);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (e.shiftKey) handlers.onVolumeUp?.();
          else handlers.onPrevVideo?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (e.shiftKey) handlers.onVolumeDown?.();
          else handlers.onNextVideo?.();
          break;
        case 'm':
          if (!e.altKey) { e.preventDefault(); handlers.onMute?.(); }
          break;
        case 'f':
          if (!e.altKey) { e.preventDefault(); handlers.onFullscreen?.(); }
          break;
        case 'p':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); handlers.onPiP?.(); }
          break;
        case 'L':
          if (e.shiftKey) { e.preventDefault(); handlers.onLike?.(); }
          break;
        case 'C':
          if (e.shiftKey) { e.preventDefault(); handlers.onComment?.(); }
          break;
        case 'S':
          if (e.shiftKey && !e.ctrlKey) { e.preventDefault(); handlers.onShare?.(); }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
