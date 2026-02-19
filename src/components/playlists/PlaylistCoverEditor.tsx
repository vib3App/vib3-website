'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { Video } from '@/types';

interface PlaylistCoverEditorProps {
  currentCover?: string;
  videos: Video[];
  onSave: (coverUrl: string) => void;
  onClose: () => void;
}

export function PlaylistCoverEditor({ currentCover, videos, onSave, onClose }: PlaylistCoverEditorProps) {
  const [selected, setSelected] = useState(currentCover || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const thumbnails = videos.filter(v => v.thumbnailUrl).map(v => v.thumbnailUrl!);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-4">Playlist Cover</h2>

          {/* Preview */}
          <div className="w-40 h-40 rounded-xl overflow-hidden mx-auto mb-4 bg-white/5 relative">
            {selected ? (
              <Image src={selected} alt="Cover" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Upload custom */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 glass text-white/60 text-sm rounded-xl hover:bg-white/10 transition mb-4"
          >
            Upload Custom Image
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelected(URL.createObjectURL(file));
          }} />

          {/* From video thumbnails */}
          {thumbnails.length > 0 && (
            <>
              <p className="text-white/50 text-sm mb-2">Or choose from video thumbnails</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {thumbnails.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(thumb)}
                    className={`aspect-square rounded-lg overflow-hidden relative transition ${
                      selected === thumb ? 'ring-2 ring-purple-500' : 'hover:ring-1 hover:ring-white/20'
                    }`}
                  >
                    <Image src={thumb} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 glass text-white/70 rounded-xl hover:bg-white/10 transition">Cancel</button>
            <button
              onClick={() => { if (selected) onSave(selected); onClose(); }}
              disabled={!selected}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium rounded-xl disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
