'use client';

import Link from 'next/link';

interface UploadCompleteProps {
  isScheduled: boolean;
  scheduledDate?: string;
  onUploadAnother: () => void;
}

export function UploadComplete({ isScheduled, scheduledDate, onUploadAnother }: UploadCompleteProps) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        {isScheduled ? 'Video Scheduled!' : 'Video Posted!'}
      </h2>
      <p className="text-white/50 mb-8">
        {isScheduled && scheduledDate
          ? `Your video will go live on ${new Date(scheduledDate).toLocaleString()}`
          : 'Your video is now live'}
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/feed"
          className="px-8 py-3 bg-[#1A1F2E] text-white font-semibold rounded-full hover:bg-[#252A3E]"
        >
          View Feed
        </Link>
        <button
          onClick={onUploadAnother}
          className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full"
        >
          Upload Another
        </button>
      </div>
    </div>
  );
}
