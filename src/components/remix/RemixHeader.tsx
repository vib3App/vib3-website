'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { RemixType } from '@/types/collaboration';

const REMIX_LABELS: Record<RemixType, string> = {
  echo: 'Echo',
  duet: 'Duet',
  stitch: 'Stitch',
  remix: 'Remix',
};

interface RemixHeaderProps {
  videoId: string;
  remixType: RemixType;
  recordedBlob: Blob | null;
  uploading: boolean;
  onSubmit: () => void;
}

export function RemixHeader({ videoId, remixType, recordedBlob, uploading, onSubmit }: RemixHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/video/${videoId}`} className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">Create {REMIX_LABELS[remixType]}</h1>
        </div>

        {recordedBlob && (
          <button
            onClick={onSubmit}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50 transition"
          >
            {uploading ? 'Publishing...' : 'Publish'}
          </button>
        )}
      </div>
    </header>
  );
}
