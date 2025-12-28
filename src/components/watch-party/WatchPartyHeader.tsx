'use client';

import Link from 'next/link';
import { ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';

interface WatchPartyHeaderProps {
  title: string;
  participantCount: number;
  isHost: boolean;
  onShare: () => void;
  onEndParty: () => void;
  onLeave: () => void;
}

export function WatchPartyHeader({
  title,
  participantCount,
  isHost,
  onShare,
  onEndParty,
  onLeave,
}: WatchPartyHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-full px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/watch-party" className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold">{title}</h1>
            <div className="text-xs text-gray-400">
              {participantCount} watching
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onShare}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ShareIcon className="w-5 h-5" />
          </button>

          {isHost ? (
            <button
              onClick={onEndParty}
              className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-full text-sm font-medium transition"
            >
              End Party
            </button>
          ) : (
            <button
              onClick={onLeave}
              className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-full text-sm font-medium transition"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
