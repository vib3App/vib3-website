'use client';

import Link from 'next/link';
import { GlassPill, SoundVisualizer } from '@/components/ui/Glass';
import type { Challenge } from '@/types/challenge';
import type { MusicTrack } from '@/types/sound';
import { formatCount } from './DiscoverUtils';

interface TrendingSoundsCardProps {
  sounds: MusicTrack[];
  activeSound: number;
  isPlaying: boolean;
  onSoundSelect: (index: number) => void;
}

export function TrendingSoundsCard({ sounds, activeSound, isPlaying, onSoundSelect }: TrendingSoundsCardProps) {
  return (
    <div className="bento-md glass-card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Trending Sounds</h3>
        <SoundVisualizer isPlaying={isPlaying} />
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
        {sounds.length === 0 ? (
          <p className="text-white/40 text-center py-4 text-sm">No sounds available</p>
        ) : sounds.map((sound, i) => (
          <button
            key={sound._id || sound.id || i}
            onClick={() => onSoundSelect(i)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${activeSound === i ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            {sound.coverUrl ? (
              <img src={sound.coverUrl} alt={sound.title || 'Sound'} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">🎵</div>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-sm truncate">{sound.title || 'Untitled'}</p>
              <p className="text-xs text-white/60 truncate">{sound.artist || 'Unknown Artist'}</p>
            </div>
            <span className="text-xs text-white/40">{formatCount(sound.plays || 0)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ChallengeBannerProps {
  challenge: Challenge | null;
}

export function ChallengeBanner({ challenge }: ChallengeBannerProps) {
  if (!challenge) {
    return (
      <div className="bento-wide glass-card p-6 flex items-center justify-center">
        <Link href="/challenges" className="text-center">
          <h3 className="text-lg font-bold mb-2">Explore Challenges</h3>
          <p className="text-white/60 text-sm">Join trending challenges and go viral</p>
        </Link>
      </div>
    );
  }

  return (
    <div className="bento-wide glass-card p-0 overflow-hidden">
      <Link href={`/hashtag/${challenge.hashtag}`} prefetch={false}>
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: challenge.coverImage
                ? `url(${challenge.coverImage})`
                : 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/70 to-transparent" />
          <div className="relative h-full flex items-center justify-between p-4">
            <div>
              <GlassPill color="purple" className="mb-2">#{challenge.hashtag}</GlassPill>
              <h3 className="text-lg font-bold mb-1">{challenge.title}</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white/60">{formatCount(challenge.stats?.participantCount || 0)} joined</span>
                {challenge.endDate && (
                  <span className="text-orange-400">Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            {challenge.prize && (
              <div className="text-right">
                <p className="text-xs text-white/60 mb-1">Prize</p>
                <p className="text-xl font-bold gradient-text">{challenge.prize}</p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
