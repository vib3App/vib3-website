'use client';

import Image from 'next/image';
import type { GauntletMatch } from '@/types/gauntlet';

interface MatchViewProps {
  match: GauntletMatch;
  onVote: (participantId: string) => void;
  isVoting: boolean;
}

function ParticipantPanel({ username, avatar, videoUrl, thumbnailUrl, isWinner }: {
  username: string; avatar?: string; videoUrl?: string; thumbnailUrl?: string; isWinner: boolean;
}) {
  return (
    <div className={`flex-1 space-y-3 ${isWinner ? 'ring-2 ring-yellow-400 rounded-xl p-2' : ''}`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center overflow-hidden">
          {avatar ? <Image src={avatar} alt={username} width={32} height={32} className="object-cover" /> : (
            <span className="text-white text-xs font-bold">{username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-white text-sm font-medium truncate">@{username}</span>
        {isWinner && <span className="text-yellow-400 text-xs">Winner</span>}
      </div>
      <div className="aspect-[9/16] rounded-xl overflow-hidden bg-white/5">
        {videoUrl ? (
          <video src={videoUrl} poster={thumbnailUrl} className="w-full h-full object-cover" controls playsInline />
        ) : thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={username} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <span className="text-sm">No video yet</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MatchView({ match, onVote, isVoting }: MatchViewProps) {
  const totalVotes = match.participant1Votes + match.participant2Votes;
  const p1Pct = totalVotes > 0 ? Math.round((match.participant1Votes / totalVotes) * 100) : 50;
  const p2Pct = 100 - p1Pct;
  const canVote = match.status === 'active' && !match.userVote;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          match.status === 'active' ? 'bg-green-500/20 text-green-400' :
          match.status === 'completed' ? 'bg-white/10 text-white/50' : 'bg-blue-500/20 text-blue-400'
        }`}>{match.status === 'active' ? 'Live' : match.status}</span>
        {totalVotes > 0 && <span className="text-white/40 text-xs">{totalVotes} votes</span>}
      </div>

      <div className="flex gap-4">
        <ParticipantPanel username={match.participant1.username} avatar={match.participant1.avatar}
          videoUrl={match.videoUrl1} thumbnailUrl={match.thumbnailUrl1} isWinner={match.winnerId === match.participant1.userId} />
        <div className="flex items-center shrink-0"><span className="text-white/20 font-bold text-2xl">VS</span></div>
        <ParticipantPanel username={match.participant2.username} avatar={match.participant2.avatar}
          videoUrl={match.videoUrl2} thumbnailUrl={match.thumbnailUrl2} isWinner={match.winnerId === match.participant2.userId} />
      </div>

      {totalVotes > 0 && (
        <div className="glass-card rounded-xl p-3">
          <div className="flex justify-between text-xs text-white/60 mb-1"><span>{p1Pct}%</span><span>{p2Pct}%</span></div>
          <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
            <div className="bg-gradient-to-r from-purple-500 to-purple-400 transition-all" style={{ width: `${p1Pct}%` }} />
            <div className="bg-gradient-to-r from-teal-400 to-teal-500 transition-all" style={{ width: `${p2Pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>{match.participant1Votes} votes</span><span>{match.participant2Votes} votes</span>
          </div>
        </div>
      )}

      {canVote && (
        <div className="flex gap-3">
          <button onClick={() => onVote(match.participant1.userId)} disabled={isVoting}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50">
            Vote @{match.participant1.username}
          </button>
          <button onClick={() => onVote(match.participant2.userId)} disabled={isVoting}
            className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-400 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50">
            Vote @{match.participant2.username}
          </button>
        </div>
      )}

      {match.userVote && (
        <div className="text-center">
          <span className="px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-full">
            You voted for @{match.userVote === match.participant1.userId ? match.participant1.username : match.participant2.username}
          </span>
        </div>
      )}
    </div>
  );
}
