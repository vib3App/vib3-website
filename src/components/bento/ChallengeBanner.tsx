'use client';

import { GlassPill } from '@/components/ui/Glass';
import { BentoItem } from './BentoItem';

interface ChallengeBannerProps {
  challenge: {
    id: string;
    title: string;
    hashtag: string;
    participants: number;
    reward?: string;
    backgroundUrl: string;
    endsIn: string;
  };
}

export function ChallengeBanner({ challenge }: ChallengeBannerProps) {
  return (
    <BentoItem size="wide" href={`/challenges/${challenge.id}`}>
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${challenge.backgroundUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/70 to-transparent" />

        <div className="relative h-full flex items-center p-4">
          <div className="flex-1">
            <GlassPill color="purple" className="mb-2">
              #{challenge.hashtag}
            </GlassPill>
            <h3 className="text-lg font-bold mb-1">{challenge.title}</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/60">{challenge.participants.toLocaleString()} joined</span>
              <span className="text-orange-400">Ends {challenge.endsIn}</span>
            </div>
          </div>

          {challenge.reward && (
            <div className="text-right">
              <p className="text-xs text-white/60 mb-1">Prize</p>
              <p className="text-xl font-bold gradient-text">{challenge.reward}</p>
            </div>
          )}
        </div>
      </div>
    </BentoItem>
  );
}
