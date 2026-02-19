'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { gauntletsApi } from '@/services/api/gauntlets';
import { logger } from '@/utils/logger';
import type { GauntletMatch } from '@/types/gauntlet';

interface VotingPanelProps {
  match: GauntletMatch;
  gauntletId: string;
  roundNumber: number;
  onVoteComplete?: (result: { participant1Votes: number; participant2Votes: number }) => void;
}

export function VotingPanel({ match, gauntletId, roundNumber, onVoteComplete }: VotingPanelProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [localVote, setLocalVote] = useState<string | null>(match.userVote || null);
  const [votes, setVotes] = useState({
    p1: match.participant1Votes,
    p2: match.participant2Votes,
  });

  const hasVoted = !!localVote;
  const totalVotes = votes.p1 + votes.p2;
  const p1Pct = totalVotes > 0 ? Math.round((votes.p1 / totalVotes) * 100) : 50;
  const p2Pct = 100 - p1Pct;

  const handleVote = useCallback(async (choice: 1 | 2) => {
    if (hasVoted || isVoting) return;
    setIsVoting(true);
    try {
      const result = await gauntletsApi.voteRound(gauntletId, roundNumber, {
        matchupId: match.id,
        choice,
      });
      setVotes({ p1: result.participant1Votes, p2: result.participant2Votes });
      setLocalVote(choice === 1 ? match.participant1.userId : match.participant2.userId);
      onVoteComplete?.(result);
    } catch (err) {
      logger.error('Failed to vote:', err);
    } finally {
      setIsVoting(false);
    }
  }, [hasVoted, isVoting, gauntletId, roundNumber, match, onVoteComplete]);

  return (
    <div className="glass-card rounded-2xl p-4 space-y-4">
      {/* Side-by-side comparison */}
      <div className="flex gap-3">
        <VideoSide
          username={match.participant1.username}
          avatar={match.participant1.avatar}
          videoUrl={match.videoUrl1}
          thumbnailUrl={match.thumbnailUrl1}
          color="purple"
          onVote={() => handleVote(1)}
          canVote={!hasVoted && match.status === 'active'}
          isVoting={isVoting}
          isSelected={localVote === match.participant1.userId}
        />
        <div className="flex items-center shrink-0">
          <span className="text-white/20 font-bold text-xl">VS</span>
        </div>
        <VideoSide
          username={match.participant2.username}
          avatar={match.participant2.avatar}
          videoUrl={match.videoUrl2}
          thumbnailUrl={match.thumbnailUrl2}
          color="teal"
          onVote={() => handleVote(2)}
          canVote={!hasVoted && match.status === 'active'}
          isVoting={isVoting}
          isSelected={localVote === match.participant2.userId}
        />
      </div>

      {/* Vote bar */}
      {totalVotes > 0 && (
        <div>
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>{p1Pct}% ({votes.p1})</span>
            <span>{p2Pct}% ({votes.p2})</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-white/10">
            <div className="bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500" style={{ width: `${p1Pct}%` }} />
            <div className="bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500" style={{ width: `${p2Pct}%` }} />
          </div>
        </div>
      )}

      {/* Voted indicator */}
      {hasVoted && (
        <p className="text-center text-sm text-purple-300">
          You voted for @{localVote === match.participant1.userId ? match.participant1.username : match.participant2.username}
        </p>
      )}
    </div>
  );
}

function VideoSide({ username, avatar, videoUrl, thumbnailUrl, color, onVote, canVote, isVoting, isSelected }: {
  username: string; avatar?: string; videoUrl?: string; thumbnailUrl?: string;
  color: 'purple' | 'teal'; onVote: () => void; canVote: boolean; isVoting: boolean; isSelected: boolean;
}) {
  const gradBg = color === 'purple' ? 'from-purple-600 to-purple-500' : 'from-teal-500 to-teal-400';

  return (
    <div className={`flex-1 space-y-2 ${isSelected ? 'ring-2 ring-yellow-400/50 rounded-xl p-1' : ''}`}>
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10">
          {avatar ? (
            <Image src={avatar} alt={username} width={24} height={24} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px] font-bold">
              {username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-white text-xs font-medium truncate">@{username}</span>
      </div>
      <div className="aspect-[9/16] rounded-lg overflow-hidden bg-white/5">
        {videoUrl ? (
          <video src={videoUrl} poster={thumbnailUrl} className="w-full h-full object-cover" controls playsInline />
        ) : thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={username} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No video</div>
        )}
      </div>
      {canVote && (
        <button
          onClick={onVote}
          disabled={isVoting}
          className={`w-full py-2 bg-gradient-to-r ${gradBg} text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50`}
        >
          {isVoting ? '...' : 'Vote'}
        </button>
      )}
    </div>
  );
}
