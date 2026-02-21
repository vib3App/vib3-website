export interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
  category: string;
}

/**
 * Reference list of all keyboard shortcuts for the help modal.
 * Actual handling is in useKeyboardShortcuts (navigation),
 * useVideoShortcuts (playback/actions), and useFeedNavigation (feed).
 */
export const SHORTCUTS: ShortcutHandler[] = [
  // Navigation (handled by useKeyboardShortcuts in providers)
  { key: 'h', alt: true, handler: () => {}, description: 'Go Home', category: 'Navigation' },
  { key: 'f', alt: true, handler: () => {}, description: 'Go to Feed', category: 'Navigation' },
  { key: 's', alt: true, handler: () => {}, description: 'Go to Search', category: 'Navigation' },
  { key: 'p', alt: true, handler: () => {}, description: 'Go to Profile', category: 'Navigation' },
  { key: 'm', alt: true, handler: () => {}, description: 'Go to Messages', category: 'Navigation' },
  { key: 'n', alt: true, handler: () => {}, description: 'Go to Notifications', category: 'Navigation' },
  { key: 'u', alt: true, handler: () => {}, description: 'Upload Video', category: 'Navigation' },

  // Playback (handled by useVideoShortcuts on video pages, useFeedNavigation on feed)
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

  // Actions (handled by useVideoShortcuts on video pages, useFeedNavigation on feed)
  { key: 'l', shift: true, handler: () => {}, description: 'Like Video', category: 'Actions' },
  { key: 'c', shift: true, handler: () => {}, description: 'Open Comments', category: 'Actions' },
  { key: 's', shift: true, handler: () => {}, description: 'Share Video', category: 'Actions' },
  { key: 'b', shift: true, handler: () => {}, description: 'Save to Collection', category: 'Actions' },

  // Help (handled by useKeyboardShortcuts in providers)
  { key: '?', handler: () => {}, description: 'Show Shortcuts', category: 'Help' },
  { key: 'Escape', handler: () => {}, description: 'Close Modal', category: 'Help' },
];
