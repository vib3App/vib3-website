'use client';

import { useRouter } from 'next/navigation';

interface EmptySearchStateProps {
  recentSearches: string[];
  trendingSearches: string[];
  onClearRecent: () => void;
}

export function EmptySearchState({ recentSearches, trendingSearches, onClearRecent }: EmptySearchStateProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {recentSearches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Recent Searches</h2>
            <button onClick={onClearRecent} className="text-purple-400 text-sm">
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white/70">{term}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-white font-medium mb-4">Trending Searches</h2>
        <div className="flex flex-wrap gap-2">
          {trendingSearches.map((term) => (
            <button
              key={term}
              onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
              className="px-4 py-2 glass text-white/70 rounded-full hover:bg-white/10 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
