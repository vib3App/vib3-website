'use client';

import { useEffect } from 'react';

interface VideoContextMenuProps {
  open: boolean;
  isSaved: boolean;
  onClose: () => void;
  onSave: () => void;
  onShare: () => void;
  onNotInterested: () => void;
  onReport: () => void;
  onHideCreator: () => void;
}

interface MenuItem {
  key: string;
  label: string;
  emoji: string;
  destructive?: boolean;
  onClick: () => void;
}

export function VideoContextMenu({
  open,
  isSaved,
  onClose,
  onSave,
  onShare,
  onNotInterested,
  onReport,
  onHideCreator,
}: VideoContextMenuProps) {
  // Close on Escape so keyboard users can dismiss.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const items: MenuItem[] = [
    {
      key: 'save',
      emoji: isSaved ? '🔖' : '📑',
      label: isSaved ? 'Unsave' : 'Save',
      onClick: () => { onSave(); onClose(); },
    },
    {
      key: 'share',
      emoji: '↗️',
      label: 'Share',
      onClick: () => { onShare(); onClose(); },
    },
    {
      key: 'not_interested',
      emoji: '🚫',
      label: 'Not interested',
      onClick: () => { onNotInterested(); onClose(); },
    },
    {
      key: 'report',
      emoji: '⚠️',
      label: 'Report',
      destructive: true,
      onClick: () => { onReport(); onClose(); },
    },
    {
      key: 'hide_creator',
      emoji: '👤',
      label: 'Hide creator',
      destructive: true,
      onClick: () => { onHideCreator(); onClose(); },
    },
  ];

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/5 text-xs uppercase tracking-wide text-white/40 text-center">
          Video options
        </div>
        <ul className="py-1">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition ${
                  item.destructive ? 'text-red-400' : 'text-white'
                }`}
              >
                <span className="text-lg" aria-hidden="true">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 text-sm text-white/60 border-t border-white/5 hover:bg-white/5"
        >
          Close
        </button>
      </div>
    </div>
  );
}
