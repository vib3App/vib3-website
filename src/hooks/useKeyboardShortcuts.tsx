/**
 * Keyboard shortcuts hook
 * Global keyboard shortcuts for the app
 */
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
  category: string;
}

const SHORTCUTS: ShortcutHandler[] = [
  // Navigation
  { key: 'h', alt: true, handler: () => {}, description: 'Go Home', category: 'Navigation' },
  { key: 'f', alt: true, handler: () => {}, description: 'Go to Feed', category: 'Navigation' },
  { key: 's', alt: true, handler: () => {}, description: 'Go to Search', category: 'Navigation' },
  { key: 'p', alt: true, handler: () => {}, description: 'Go to Profile', category: 'Navigation' },
  { key: 'm', alt: true, handler: () => {}, description: 'Go to Messages', category: 'Navigation' },
  { key: 'n', alt: true, handler: () => {}, description: 'Go to Notifications', category: 'Navigation' },
  { key: 'u', alt: true, handler: () => {}, description: 'Upload Video', category: 'Navigation' },

  // Playback
  { key: ' ', handler: () => {}, description: 'Play/Pause', category: 'Playback' },
  { key: 'ArrowUp', handler: () => {}, description: 'Previous Video', category: 'Playback' },
  { key: 'ArrowDown', handler: () => {}, description: 'Next Video', category: 'Playback' },
  { key: 'ArrowLeft', handler: () => {}, description: 'Seek -5s', category: 'Playback' },
  { key: 'ArrowRight', handler: () => {}, description: 'Seek +5s', category: 'Playback' },
  { key: 'j', handler: () => {}, description: 'Seek -10s', category: 'Playback' },
  { key: 'l', handler: () => {}, description: 'Seek +10s', category: 'Playback' },
  { key: 'm', handler: () => {}, description: 'Toggle Mute', category: 'Playback' },
  { key: 'f', handler: () => {}, description: 'Toggle Fullscreen', category: 'Playback' },
  { key: 'i', handler: () => {}, description: 'Toggle Mini Player', category: 'Playback' },
  { key: 'p', ctrl: true, handler: () => {}, description: 'Picture-in-Picture', category: 'Playback' },

  // Actions
  { key: 'l', shift: true, handler: () => {}, description: 'Like Video', category: 'Actions' },
  { key: 'c', shift: true, handler: () => {}, description: 'Open Comments', category: 'Actions' },
  { key: 's', shift: true, handler: () => {}, description: 'Share Video', category: 'Actions' },
  { key: 'b', shift: true, handler: () => {}, description: 'Save to Collection', category: 'Actions' },

  // Help
  { key: '?', handler: () => {}, description: 'Show Shortcuts', category: 'Help' },
  { key: 'Escape', handler: () => {}, description: 'Close Modal', category: 'Help' },
];

export function useKeyboardShortcuts(customHandlers?: Record<string, () => void>) {
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore when typing in input/textarea
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      // Only allow Escape
      if (e.key !== 'Escape') return;
    }

    // Build key signature
    const keySignature = [
      e.ctrlKey ? 'ctrl' : '',
      e.shiftKey ? 'shift' : '',
      e.altKey ? 'alt' : '',
      e.metaKey ? 'meta' : '',
      e.key.toLowerCase(),
    ].filter(Boolean).join('+');

    // Check custom handlers first
    if (customHandlers?.[keySignature]) {
      e.preventDefault();
      customHandlers[keySignature]();
      return;
    }

    // Default navigation handlers
    if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'h':
          e.preventDefault();
          router.push('/');
          break;
        case 'f':
          e.preventDefault();
          router.push('/feed');
          break;
        case 's':
          e.preventDefault();
          router.push('/search');
          break;
        case 'p':
          e.preventDefault();
          router.push('/profile');
          break;
        case 'm':
          e.preventDefault();
          router.push('/messages');
          break;
        case 'n':
          e.preventDefault();
          router.push('/notifications');
          break;
        case 'u':
          e.preventDefault();
          router.push('/upload');
          break;
      }
    }
  }, [router, customHandlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts: SHORTCUTS };
}

/**
 * Hook for video player specific shortcuts
 */
export function useVideoShortcuts(handlers: {
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
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in input/textarea
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
          if (e.shiftKey) {
            handlers.onVolumeUp?.();
          } else {
            handlers.onPrevVideo?.();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (e.shiftKey) {
            handlers.onVolumeDown?.();
          } else {
            handlers.onNextVideo?.();
          }
          break;
        case 'm':
          if (!e.altKey) {
            e.preventDefault();
            handlers.onMute?.();
          }
          break;
        case 'f':
          if (!e.altKey) {
            e.preventDefault();
            handlers.onFullscreen?.();
          }
          break;
        case 'p':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handlers.onPiP?.();
          }
          break;
        case 'L':
          if (e.shiftKey) {
            e.preventDefault();
            handlers.onLike?.();
          }
          break;
        case 'C':
          if (e.shiftKey) {
            e.preventDefault();
            handlers.onComment?.();
          }
          break;
        case 'S':
          if (e.shiftKey && !e.ctrlKey) {
            e.preventDefault();
            handlers.onShare?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

/**
 * Component to display keyboard shortcuts help
 */
export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const categories = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutHandler[]>);

  const formatKey = (shortcut: ShortcutHandler): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('⌘');

    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';
    parts.push(key.toUpperCase());

    return parts.join(' + ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            ✕
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
          {Object.entries(categories).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">{category}</h3>
              <div className="grid grid-cols-2 gap-2">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span className="text-sm">{shortcut.description}</span>
                    <code className="px-2 py-1 bg-black/50 rounded text-xs font-mono">
                      {formatKey(shortcut)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
