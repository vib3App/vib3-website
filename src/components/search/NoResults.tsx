'use client';

interface NoResultsProps {
  query: string;
}

export function NoResults({ query }: NoResultsProps) {
  return (
    <div className="text-center py-12">
      <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p className="text-white/50">No results for &quot;{query}&quot;</p>
      <p className="text-white/30 text-sm mt-1">Try a different search term</p>
    </div>
  );
}
