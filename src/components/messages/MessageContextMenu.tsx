'use client';

import { useEffect, useRef } from 'react';

interface MessageContextMenuProps {
  x: number;
  y: number;
  isOwn: boolean;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onReply: () => void;
  onForward?: () => void;
  onClose: () => void;
}

export function MessageContextMenu({
  x, y, isOwn, onDeleteForMe, onDeleteForEveryone, onReply, onForward, onClose,
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 200),
    zIndex: 100,
  };

  return (
    <div ref={menuRef} style={style} className="w-48 glass-heavy rounded-xl border border-white/10 shadow-2xl overflow-hidden">
      <button
        onClick={() => { onReply(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 text-sm hover:bg-white/10 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        Reply
      </button>

      {onForward && (
        <button
          onClick={() => { onForward(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 text-sm hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Forward
        </button>
      )}

      <div className="h-px bg-white/5" />

      <button
        onClick={() => { onDeleteForMe(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 text-sm hover:bg-white/10 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
        Delete for me
      </button>

      {isOwn && (
        <button
          onClick={() => { onDeleteForEveryone(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 text-sm hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete for everyone
        </button>
      )}
    </div>
  );
}
