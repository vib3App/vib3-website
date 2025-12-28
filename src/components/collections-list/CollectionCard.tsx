'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCount } from '@/utils/format';
import type { Collection } from '@/types';

interface CollectionCardProps {
  collection: Collection;
  onDelete?: (id: string) => void;
}

export function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative group">
      <Link
        href={`/collections/${collection.id}`}
        className="block aspect-square glass-card rounded-xl overflow-hidden relative"
      >
        {collection.coverUrl || collection.previewVideos?.[0]?.thumbnailUrl ? (
          <Image
            src={collection.coverUrl || collection.previewVideos![0].thumbnailUrl!}
            alt={collection.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-medium truncate">{collection.name}</h3>
          <p className="text-white/60 text-sm">{formatCount(collection.videoCount)} videos</p>
        </div>
        {collection.isPrivate && (
          <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
        )}
      </Link>

      {collection.type === 'playlist' && onDelete && (
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-1 glass-card rounded-lg shadow-xl overflow-hidden z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(collection.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-red-500 hover:bg-white/5 text-left text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
