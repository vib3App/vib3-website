'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { gauntletsApi } from '@/services/api/gauntlets';
import { logger } from '@/utils/logger';
import type { GauntletSubmission } from '@/types/gauntlet';

interface SubmissionVoteProps {
  submissions: GauntletSubmission[];
  gauntletId: string;
  roundNumber: number;
}

export function SubmissionVote({ submissions, gauntletId, roundNumber }: SubmissionVoteProps) {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [localVotes, setLocalVotes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    submissions.forEach((s) => { map[s.id] = s.voteCount; });
    return map;
  });
  const [votingId, setVotingId] = useState<string | null>(null);

  const handleUpvote = useCallback(async (submissionId: string) => {
    if (votedIds.has(submissionId) || votingId) return;
    setVotingId(submissionId);
    try {
      await gauntletsApi.voteRound(gauntletId, roundNumber, { submissionId });
      setVotedIds((prev) => new Set(prev).add(submissionId));
      setLocalVotes((prev) => ({ ...prev, [submissionId]: (prev[submissionId] || 0) + 1 }));
    } catch (err) {
      logger.error('Failed to vote on submission:', err);
    } finally {
      setVotingId(null);
    }
  }, [votedIds, votingId, gauntletId, roundNumber]);

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/40 text-sm">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-white/60 text-sm font-medium">Vote for your favorites</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {submissions.map((sub) => {
          const hasVoted = votedIds.has(sub.id);
          const isVoting = votingId === sub.id;
          return (
            <div
              key={sub.id}
              className={`relative rounded-xl overflow-hidden ${sub.isEliminated ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {/* Thumbnail */}
              <div className="aspect-[9/16] bg-white/5">
                {sub.thumbnailUrl ? (
                  <Image src={sub.thumbnailUrl} alt={sub.username} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                    No preview
                  </div>
                )}
              </div>

              {/* Overlay info */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10">
                    {sub.avatar ? (
                      <Image src={sub.avatar} alt={sub.username} width={20} height={20} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-white/60 font-bold">
                        {sub.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-xs truncate">@{sub.username}</span>
                </div>

                {/* Upvote button */}
                <button
                  onClick={() => handleUpvote(sub.id)}
                  disabled={hasVoted || isVoting || sub.isEliminated}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    hasVoted
                      ? 'bg-purple-500/30 text-purple-300'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  } disabled:opacity-50`}
                >
                  <svg className="w-3.5 h-3.5" fill={hasVoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span>{localVotes[sub.id] || 0}</span>
                </button>
              </div>

              {/* Eliminated overlay */}
              {sub.isEliminated && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-red-400 text-xs font-bold">Eliminated</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
