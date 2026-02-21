'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SHORTCUTS } from './types';

/**
 * Global keyboard shortcuts for navigation and help modal.
 * Navigation: Alt+H/F/S/P/M/N/U
 * Help: ? opens shortcuts modal, Escape closes any modal
 */
export function useKeyboardShortcuts(customHandlers?: Record<string, () => void>) {
  const router = useRouter();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip when typing in inputs (except Escape)
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      if (e.key === 'Escape') {
        setShowShortcutsModal(false);
      }
      return;
    }

    // Build key signature for custom handlers
    const keySignature = [
      e.ctrlKey ? 'ctrl' : '',
      e.shiftKey ? 'shift' : '',
      e.altKey ? 'alt' : '',
      e.metaKey ? 'meta' : '',
      e.key.toLowerCase(),
    ].filter(Boolean).join('+');

    if (customHandlers?.[keySignature]) {
      e.preventDefault();
      customHandlers[keySignature]();
      return;
    }

    // Help shortcuts
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      setShowShortcutsModal(prev => !prev);
      return;
    }

    if (e.key === 'Escape') {
      setShowShortcutsModal(false);
      return;
    }

    // Navigation: Alt + key
    if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'h': e.preventDefault(); router.push('/'); break;
        case 'f': e.preventDefault(); router.push('/feed'); break;
        case 's': e.preventDefault(); router.push('/search'); break;
        case 'p': e.preventDefault(); router.push('/profile'); break;
        case 'm': e.preventDefault(); router.push('/messages'); break;
        case 'n': e.preventDefault(); router.push('/notifications'); break;
        case 'u': e.preventDefault(); router.push('/upload'); break;
      }
    }
  }, [router, customHandlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: SHORTCUTS,
    showShortcutsModal,
    setShowShortcutsModal,
  };
}
