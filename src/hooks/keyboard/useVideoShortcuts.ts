'use client';

import { useEffect, useRef } from 'react';

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
  onSave?: () => void;
}

export function useVideoShortcuts(handlers: VideoShortcutHandlers) {
  // Store handlers in a ref so the effect doesn't need to re-register
  // the event listener when handler functions change
  const handlersRef = useRef(handlers);
  useEffect(() => { handlersRef.current = handlers; }, [handlers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const h = handlersRef.current;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          h.onPlayPause?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          h.onSeekBackward?.(5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          h.onSeekForward?.(5);
          break;
        case 'j':
          e.preventDefault();
          h.onSeekBackward?.(10);
          break;
        case 'l':
          if (!e.shiftKey) {
            e.preventDefault();
            h.onSeekForward?.(10);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (e.shiftKey) h.onVolumeUp?.();
          else h.onPrevVideo?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (e.shiftKey) h.onVolumeDown?.();
          else h.onNextVideo?.();
          break;
        case 'm':
          if (!e.altKey) { e.preventDefault(); h.onMute?.(); }
          break;
        case 'f':
          if (!e.altKey) { e.preventDefault(); h.onFullscreen?.(); }
          break;
        case 'p':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); h.onPiP?.(); }
          break;
        case 'L':
          if (e.shiftKey) { e.preventDefault(); h.onLike?.(); }
          break;
        case 'C':
          if (e.shiftKey) { e.preventDefault(); h.onComment?.(); }
          break;
        case 'S':
          if (e.shiftKey && !e.ctrlKey) { e.preventDefault(); h.onShare?.(); }
          break;
        case 'B':
          if (e.shiftKey) { e.preventDefault(); h.onSave?.(); }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty deps - registers once, reads current handlers via ref
}
