'use client';

import Link from 'next/link';

interface FeedEmptyStateProps {
  activeTab: 'forYou' | 'following';
}

export function FeedEmptyState({ activeTab }: FeedEmptyStateProps) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center px-8">
        <div className="w-20 h-20 bg-[#1A1F2E] rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-white text-xl font-semibold">No videos yet</h3>
        <p className="text-white/50">
          {activeTab === 'following' ? 'Follow creators to see their content here' : 'Be the first to share something amazing!'}
        </p>
        <Link href="/discover" className="mt-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full">
          Explore
        </Link>
      </div>
    </div>
  );
}
