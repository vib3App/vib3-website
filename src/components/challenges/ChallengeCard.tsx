'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Challenge } from '@/types/challenge';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function getTimeRemaining(endDate: string): string | null {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} min`;
}

function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    music: '🎵',
    dance: '💃',
    comedy: '😂',
    sponsored: '⭐',
    trending: '🔥',
    new: '✨',
  };
  return emojiMap[category] || '🏆';
}

interface ChallengeCardProps {
  challenge: Challenge;
  joiningId: string | null;
  onJoin: (e: React.MouseEvent, challengeId: string, hasJoined: boolean) => void;
  onViewDetail?: (challengeId: string) => void;
}

export function ChallengeCard({ challenge, joiningId, onJoin, onViewDetail }: ChallengeCardProps) {
  const timeRemaining = getTimeRemaining(challenge.endDate);
  const creatorUsername =
    typeof challenge.creatorId === 'object' && challenge.creatorId.username
      ? challenge.creatorId.username
      : 'Unknown';

  const handleClick = (e: React.MouseEvent) => {
    if (onViewDetail) {
      e.preventDefault();
      onViewDetail(challenge._id);
    }
  };

  return (
    <Link
      href={`/hashtag/${challenge.hashtag}`}
      onClick={handleClick}
      className="glass-card overflow-hidden hover:border-amber-500/50 transition-all hover:scale-[1.02] group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-amber-500/20 to-orange-500/20">
        {challenge.coverImage ? (
          <Image src={challenge.coverImage} alt={challenge.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {getCategoryEmoji(challenge.category)}
          </div>
        )}
        {challenge.prize && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            🏆 {challenge.prize}
          </div>
        )}
        {timeRemaining && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            ⏰ Ends in {timeRemaining}
          </div>
        )}
        <div
          className={`absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
            challenge.difficulty === 'easy'
              ? 'bg-green-500/80 text-white'
              : challenge.difficulty === 'medium'
              ? 'bg-amber-500/80 text-white'
              : 'bg-red-500/80 text-white'
          }`}
        >
          {challenge.difficulty}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors">
          {challenge.title}
        </h3>
        <p className="text-amber-500 font-medium mb-1">#{challenge.hashtag}</p>
        <p className="text-white/40 text-xs mb-2">by @{creatorUsername}</p>
        <p className="text-white/60 text-sm mb-4 line-clamp-2">{challenge.description}</p>
        <div className="flex items-center gap-4 text-white/50 text-sm">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>{formatCount(challenge.stats.participantCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
            </svg>
            <span>{formatCount(challenge.stats.videoCount)} videos</span>
          </div>
        </div>
      </div>

      {/* Join Button */}
      <div className="px-4 pb-4">
        <button
          onClick={(e) => onJoin(e, challenge._id, !!challenge.hasJoined)}
          disabled={joiningId === challenge._id}
          className={`w-full font-semibold py-3 rounded-xl transition-opacity ${
            challenge.hasJoined
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90'
          } ${joiningId === challenge._id ? 'opacity-50' : ''}`}
        >
          {joiningId === challenge._id ? 'Loading...' : challenge.hasJoined ? 'Joined ✓' : 'Join Challenge'}
        </button>
      </div>
    </Link>
  );
}
