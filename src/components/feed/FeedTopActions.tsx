'use client';

import Link from 'next/link';

interface FeedTopActionsProps {
  showQueue: boolean;
  onToggleQueue: () => void;
}

export function FeedTopActions({ showQueue: _showQueue, onToggleQueue }: FeedTopActionsProps) {
  return (
    <div className="fixed top-20 right-4 z-40 flex items-center gap-2">
      <button
        onClick={onToggleQueue}
        className="p-2 bg-black/30 backdrop-blur-sm rounded-full hidden md:block"
        title="Up Next"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
      <Link href="/search" className="p-2 bg-black/30 backdrop-blur-sm rounded-full md:hidden">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </Link>
    </div>
  );
}
