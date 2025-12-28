'use client';

import Image from 'next/image';
import type { VideoDraft } from '@/types';

interface DraftsPanelProps {
  drafts: VideoDraft[];
  onLoadDraft: (draft: VideoDraft) => void;
  onDeleteDraft: (draftId: string) => void;
}

export function DraftsPanel({ drafts, onLoadDraft, onDeleteDraft }: DraftsPanelProps) {
  return (
    <div className="mb-8 p-4 glass-card rounded-2xl">
      <h2 className="text-white font-medium mb-4">Your Drafts</h2>
      <div className="space-y-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex items-center gap-3 p-3 glass rounded-xl"
          >
            <div className="w-16 h-24 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
              {draft.thumbnailUrl ? (
                <Image
                  src={draft.thumbnailUrl}
                  alt="Draft"
                  width={64}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">
                {draft.caption || 'No caption'}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {new Date(draft.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => onLoadDraft(draft)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm rounded-full hover:opacity-90"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteDraft(draft.id)}
              className="p-1.5 text-white/30 hover:text-red-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
