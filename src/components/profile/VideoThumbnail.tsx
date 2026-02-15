'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useConfirmStore } from '@/stores/confirmStore';
import { formatCount } from '@/utils/format';
import type { Video } from '@/types';

export function VideoThumbnail({ video, showDelete, onDelete }: { video: Video; showDelete?: boolean; onDelete?: (videoId: string) => void }) {
  const confirmDialog = useConfirmStore(s => s.show);
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      const ok = await confirmDialog({ title: 'Delete Video', message: 'Are you sure you want to delete this video?', variant: 'danger', confirmText: 'Delete' });
      if (ok) onDelete(video.id);
    }
  };

  return (
    <Link href={`/video/${video.id}?user=${video.userId}`} className="relative aspect-[9/16] glass-card rounded-lg overflow-hidden group">
      {video.thumbnailUrl ? (
        <Image src={video.thumbnailUrl} alt={video.title || video.caption || 'Video thumbnail'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-teal-500/30">
          <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />

      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 rounded-full">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
        <span className="text-white text-[10px] font-semibold">{formatCount(video.viewsCount || 0)}</span>
      </div>

      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 rounded-full">
        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="text-white text-[10px] font-semibold">{formatCount(video.likesCount || 0)}</span>
      </div>

      {showDelete && (
        <button
          onClick={handleDelete}
          className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors group/delete"
          title="Delete video"
        >
          <svg className="w-4 h-4 text-white group-hover/delete:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </Link>
  );
}
