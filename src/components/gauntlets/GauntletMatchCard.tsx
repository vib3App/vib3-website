'use client';

import Image from 'next/image';
import type { GauntletMatch } from '@/types/gauntlet';

interface GauntletMatchCardProps {
  match: GauntletMatch;
  onVote: (matchId: string, participantId: string) => void;
}

function ParticipantAvatar({ username, avatar }: { username: string; avatar?: string }) {
  return avatar ? (
    <Image src={avatar} alt={username} width={40} height={40} className="rounded-full object-cover" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
      {username[0]?.toUpperCase()}
    </div>
  );
}

export function GauntletMatchCard({ match, onVote }: GauntletMatchCardProps) {
  const totalVotes = match.participant1Votes + match.participant2Votes;
  const p1Pct = totalVotes > 0 ? Math.round((match.participant1Votes / totalVotes) * 100) : 50;
  const p2Pct = 100 - p1Pct;
  const canVote = match.status === 'active' && !match.userVote;

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-4">
        {/* Participant 1 */}
        <div className="flex-1 text-center">
          <ParticipantAvatar username={match.participant1.username} avatar={match.participant1.avatar} />
          <p className="text-white text-sm font-medium mt-1 truncate">@{match.participant1.username}</p>
          {canVote && (
            <button onClick={() => onVote(match.id, match.participant1.userId)} className="mt-2 px-4 py-1.5 text-xs font-medium glass rounded-full text-white hover:bg-white/10 transition">
              Vote
            </button>
          )}
          {match.userVote === match.participant1.userId && (
            <span className="mt-2 inline-block px-3 py-1 text-xs bg-purple-500/30 text-purple-300 rounded-full">Voted</span>
          )}
        </div>

        {/* VS */}
        <div className="text-center shrink-0">
          <span className="text-white/30 font-bold text-lg">VS</span>
          {totalVotes > 0 && (
            <div className="mt-2 text-xs text-white/40">{totalVotes} votes</div>
          )}
        </div>

        {/* Participant 2 */}
        <div className="flex-1 text-center">
          <ParticipantAvatar username={match.participant2.username} avatar={match.participant2.avatar} />
          <p className="text-white text-sm font-medium mt-1 truncate">@{match.participant2.username}</p>
          {canVote && (
            <button onClick={() => onVote(match.id, match.participant2.userId)} className="mt-2 px-4 py-1.5 text-xs font-medium glass rounded-full text-white hover:bg-white/10 transition">
              Vote
            </button>
          )}
          {match.userVote === match.participant2.userId && (
            <span className="mt-2 inline-block px-3 py-1 text-xs bg-purple-500/30 text-purple-300 rounded-full">Voted</span>
          )}
        </div>
      </div>

      {/* Vote bar */}
      {totalVotes > 0 && (
        <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-white/10">
          <div className="bg-gradient-to-r from-purple-500 to-purple-400 transition-all" style={{ width: `${p1Pct}%` }} />
          <div className="bg-gradient-to-r from-teal-400 to-teal-500 transition-all" style={{ width: `${p2Pct}%` }} />
        </div>
      )}
    </div>
  );
}
