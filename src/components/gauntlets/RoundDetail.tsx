'use client';

import Image from 'next/image';
import type { GauntletRound, GauntletMatch } from '@/types/gauntlet';

interface RoundDetailProps {
  round: GauntletRound;
  gauntletId: string;
  onClose: () => void;
  onSelectMatch?: (match: GauntletMatch) => void;
  onSubmitVideo?: () => void;
  canSubmit?: boolean;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function RoundDetail({ round, gauntletId, onClose, onSelectMatch, onSubmitVideo, canSubmit }: RoundDetailProps) {
  const isActive = round.status === 'active';

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Round {round.roundNumber}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              isActive ? 'bg-purple-500/20 text-purple-400' :
              round.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              'bg-white/10 text-white/40'
            }`}>{round.status}</span>
          </div>
          {round.theme && <p className="text-white/50 text-sm mt-0.5">Theme: {round.theme}</p>}
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Timing */}
      <div className="flex gap-4 text-xs text-white/40">
        <span>Start: {formatDateTime(round.startsAt)}</span>
        {round.endsAt && <span>End: {formatDateTime(round.endsAt)}</span>}
      </div>

      {/* Submit button for active rounds */}
      {isActive && canSubmit && onSubmitVideo && (
        <button
          onClick={onSubmitVideo}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
        >
          Submit Video
        </button>
      )}

      {/* Matchups */}
      {round.matches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-white/60 text-sm font-medium">Matchups</h4>
          {round.matches.map((match) => (
            <button
              key={match.id}
              onClick={() => onSelectMatch?.(match)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition hover:bg-white/5 ${
                match.status === 'active' ? 'ring-1 ring-purple-500/50 bg-purple-500/5' : 'bg-white/[0.02]'
              }`}
            >
              <ParticipantBadge
                username={match.participant1.username}
                avatar={match.participant1.avatar}
                isWinner={match.winnerId === match.participant1.userId}
                isEliminated={match.participant1.isEliminated}
              />
              <div className="text-center shrink-0">
                <span className="text-white/20 text-xs font-bold">VS</span>
                <div className="text-[10px] text-white/30 mt-0.5">
                  {match.participant1Votes} - {match.participant2Votes}
                </div>
              </div>
              <ParticipantBadge
                username={match.participant2.username}
                avatar={match.participant2.avatar}
                isWinner={match.winnerId === match.participant2.userId}
                isEliminated={match.participant2.isEliminated}
                alignRight
              />
              {match.status === 'active' && (
                <span className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-pulse shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Submissions (pool rounds) */}
      {round.submissions && round.submissions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-white/60 text-sm font-medium">Submissions ({round.submissions.length})</h4>
          <div className="grid grid-cols-3 gap-2">
            {round.submissions.map((sub) => (
              <div key={sub.id} className={`relative rounded-lg overflow-hidden ${sub.isEliminated ? 'opacity-40' : ''}`}>
                {sub.thumbnailUrl ? (
                  <Image src={sub.thumbnailUrl} alt={sub.username} width={120} height={160} className="w-full aspect-[9/16] object-cover" />
                ) : (
                  <div className="w-full aspect-[9/16] bg-white/5 flex items-center justify-center text-white/20 text-xs">
                    No preview
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <p className="text-white text-[10px] truncate">@{sub.username}</p>
                  <p className="text-white/50 text-[10px]">{sub.voteCount} votes</p>
                </div>
                {sub.isEliminated && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-red-400 text-xs font-bold">Eliminated</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantBadge({ username, avatar, isWinner, isEliminated, alignRight }: {
  username: string; avatar?: string; isWinner: boolean; isEliminated: boolean; alignRight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${alignRight ? 'flex-row-reverse text-right' : ''}`}>
      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-white/10">
        {avatar ? (
          <Image src={avatar} alt={username} width={28} height={28} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-bold">
            {username[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <span className={`text-xs truncate ${
        isWinner ? 'text-yellow-400 font-bold' :
        isEliminated ? 'text-white/30 line-through' : 'text-white/70'
      }`}>
        @{username}
      </span>
    </div>
  );
}
