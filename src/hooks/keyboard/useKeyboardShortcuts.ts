'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SHORTCUTS } from './types';

export function useKeyboardShortcuts(customHandlers?: Record<string, () => void>) {
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      if (e.key !== 'Escape') return;
    }

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

  return { shortcuts: SHORTCUTS };
}
