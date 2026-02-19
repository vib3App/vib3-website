'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

export interface StoryHighlight {
  id: string;
  title: string;
  coverImage?: string;
  storyIds: string[];
  createdAt: string;
}

interface StoryHighlightsProps {
  userId: string;
  isOwnProfile: boolean;
  onViewHighlight?: (highlight: StoryHighlight) => void;
}

const HIGHLIGHTS_KEY = (userId: string) => `vib3_highlights_${userId}`;

export function StoryHighlights({ userId, isOwnProfile, onViewHighlight }: StoryHighlightsProps) {
  const [highlights, setHighlights] = useState<StoryHighlight[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(HIGHLIGHTS_KEY(userId));
    if (stored) {
      try { setHighlights(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [userId]);

  const saveHighlights = useCallback((updated: StoryHighlight[]) => {
    setHighlights(updated);
    localStorage.setItem(HIGHLIGHTS_KEY(userId), JSON.stringify(updated));
  }, [userId]);

  const addHighlight = useCallback((title: string, coverImage?: string) => {
    const newHighlight: StoryHighlight = {
      id: `hl-${Date.now()}`,
      title,
      coverImage,
      storyIds: [],
      createdAt: new Date().toISOString(),
    };
    saveHighlights([...highlights, newHighlight]);
    setShowCreateModal(false);
  }, [highlights, saveHighlights]);

  const removeHighlight = useCallback((id: string) => {
    saveHighlights(highlights.filter(h => h.id !== id));
  }, [highlights, saveHighlights]);

  if (highlights.length === 0 && !isOwnProfile) return null;

  return (
    <div className="mb-4">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
        {isOwnProfile && (
          <button onClick={() => setShowCreateModal(true)} className="flex flex-col items-center gap-1 shrink-0 w-[68px]">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] text-white/50 truncate w-full text-center">New</span>
          </button>
        )}
        {highlights.map(hl => (
          <HighlightCircle
            key={hl.id}
            highlight={hl}
            isOwnProfile={isOwnProfile}
            onClick={() => onViewHighlight?.(hl)}
            onRemove={() => removeHighlight(hl.id)}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateHighlightModal onClose={() => setShowCreateModal(false)} onSave={addHighlight} />
      )}
    </div>
  );
}

function HighlightCircle({ highlight, isOwnProfile, onClick, onRemove }: {
  highlight: StoryHighlight; isOwnProfile: boolean; onClick: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0 w-[68px] group relative">
      <button onClick={onClick} className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-teal-400">
        <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
          {highlight.coverImage ? (
            <Image src={highlight.coverImage} alt={highlight.title} width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-teal-500/30 text-white/70 text-lg font-bold">
              {highlight.title[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </button>
      <span className="text-[10px] text-white/70 truncate w-full text-center">{highlight.title}</span>
      {isOwnProfile && (
        <button onClick={onRemove}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] hidden group-hover:flex items-center justify-center">
          x
        </button>
      )}
    </div>
  );
}

function CreateHighlightModal({ onClose, onSave }: { onClose: () => void; onSave: (title: string, coverImage?: string) => void }) {
  const [title, setTitle] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white font-semibold text-lg mb-4">New Highlight</h3>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Highlight name..." maxLength={30}
          className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50 mb-4" autoFocus />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 glass text-white/70 rounded-xl">Cancel</button>
          <button onClick={() => title.trim() && onSave(title.trim())} disabled={!title.trim()}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl disabled:opacity-50 font-medium">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

/** Utility to add a story to a highlight from story viewer */
export function AddToHighlightButton({ userId, storyId }: { userId: string; storyId: string }) {
  const [highlights, setHighlights] = useState<StoryHighlight[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(HIGHLIGHTS_KEY(userId));
    if (stored) {
      try { setHighlights(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [userId]);

  const addToHighlight = (highlightId: string) => {
    const updated = highlights.map(h =>
      h.id === highlightId && !h.storyIds.includes(storyId)
        ? { ...h, storyIds: [...h.storyIds, storyId] }
        : h
    );
    setHighlights(updated);
    localStorage.setItem(HIGHLIGHTS_KEY(userId), JSON.stringify(updated));
    setShowPicker(false);
  };

  if (highlights.length === 0) return null;

  return (
    <div className="relative">
      <button onClick={() => setShowPicker(!showPicker)}
        className="text-white/70 text-sm flex items-center gap-1 px-3 py-1.5 glass rounded-full hover:bg-white/10">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Highlight
      </button>
      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 glass-card rounded-xl p-2 min-w-[160px] z-50">
          {highlights.map(h => (
            <button key={h.id} onClick={() => addToHighlight(h.id)}
              className="w-full text-left text-white text-sm px-3 py-2 hover:bg-white/10 rounded-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/30 to-teal-500/30 flex items-center justify-center text-[10px]">
                {h.title[0]?.toUpperCase()}
              </span>
              {h.title}
              {h.storyIds.includes(storyId) && <span className="ml-auto text-green-400 text-xs">Added</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
