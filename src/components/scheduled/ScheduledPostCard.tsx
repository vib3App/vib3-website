'use client';

import Image from 'next/image';
import type { ScheduledPost } from '@/types/upload';

interface ScheduledPostCardProps {
  post: ScheduledPost;
  busy: boolean;
  onPublishNow: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}

function formatScheduledAt(iso: string): string {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ScheduledPostCard({
  post,
  busy,
  onPublishNow,
  onReschedule,
  onCancel,
}: ScheduledPostCardProps) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex gap-3">
        <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-white/10">
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 6h16v12H4z" opacity="0.4" />
                <path d="M10 9l5 3-5 3V9z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold mb-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            <span className="truncate">{formatScheduledAt(post.scheduledAt)}</span>
          </div>

          <p className="text-white text-sm line-clamp-3">
            {post.description.trim() || <span className="text-white/40">(No description)</span>}
          </p>

          {post.hashtags.length > 0 && (
            <p className="text-teal-400 text-xs mt-1 truncate">
              {post.hashtags.map(h => `#${h}`).join(' ')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        {busy ? (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onPublishNow}
              className="flex flex-col items-center gap-1 py-2 rounded-xl text-sm text-purple-300 hover:bg-white/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Publish now</span>
            </button>
            <button
              type="button"
              onClick={onReschedule}
              className="flex flex-col items-center gap-1 py-2 rounded-xl text-sm text-teal-300 hover:bg-white/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
              </svg>
              <span>Reschedule</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex flex-col items-center gap-1 py-2 rounded-xl text-sm text-red-400 hover:bg-white/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
