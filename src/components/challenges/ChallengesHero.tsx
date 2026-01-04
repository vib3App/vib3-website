'use client';

import Link from 'next/link';

interface ChallengesHeroProps {
  onCreateClick: () => void;
}

export function ChallengesHero({ onCreateClick }: ChallengesHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/60 via-orange-500/60 to-amber-500/60 backdrop-blur-3xl" />
      <div className="relative px-6 py-12 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <span>🏆</span> VIB3 Challenges
        </h1>
        <p className="text-xl text-white/90 mb-8">Join trending challenges and go viral</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={onCreateClick}
            className="bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <span>➕</span> Create Challenge
          </button>
          <Link
            href="/challenges/my"
            className="bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <span>🎵</span> My Participations
          </Link>
        </div>
      </div>
    </div>
  );
}
