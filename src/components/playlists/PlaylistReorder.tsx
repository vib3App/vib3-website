'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import type { Video } from '@/types';

interface PlaylistReorderProps {
  videos: Video[];
  onReorder: (videoIds: string[]) => void;
  onClose: () => void;
}

export function PlaylistReorder({ videos, onReorder, onClose }: PlaylistReorderProps) {
  const [items, setItems] = useState(videos);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const moveItem = useCallback((from: number, to: number) => {
    setItems(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const handleSave = () => {
    onReorder(items.map(v => v.id));
    onClose();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-medium">Reorder Videos</h3>
        <div className="flex gap-2">
          <button onClick={onClose} className="text-white/50 text-sm hover:text-white">Cancel</button>
          <button onClick={handleSave} className="text-purple-400 text-sm font-medium hover:text-purple-300">Save</button>
        </div>
      </div>
      {items.map((video, index) => (
        <div
          key={video.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== index) moveItem(dragIndex, index); setDragIndex(index); }}
          onDragEnd={() => setDragIndex(null)}
          className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-grab active:cursor-grabbing ${
            dragIndex === index ? 'bg-purple-500/10 ring-1 ring-purple-500/30' : 'hover:bg-white/5'
          }`}
        >
          <div className="text-white/20 cursor-grab">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" />
            </svg>
          </div>
          <span className="text-white/30 text-sm w-6 text-right">{index + 1}</span>
          <div className="w-16 h-10 rounded-lg overflow-hidden bg-white/5 relative shrink-0">
            {video.thumbnailUrl ? (
              <Image src={video.thumbnailUrl} alt={video.caption || 'Video'} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{video.caption || video.title || 'Untitled'}</p>
            <p className="text-white/30 text-xs">@{video.username}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
