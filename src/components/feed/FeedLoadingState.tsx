'use client';

interface FeedLoadingStateProps {
  message?: string;
}

export function FeedLoadingState({ message = 'Loading your feed...' }: FeedLoadingStateProps) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50">{message}</p>
      </div>
    </div>
  );
}

export function FeedLoadingMore() {
  return (
    <div className="h-full w-full flex items-center justify-center snap-start">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Loading more...</p>
      </div>
    </div>
  );
}
