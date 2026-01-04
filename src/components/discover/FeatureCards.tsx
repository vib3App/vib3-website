'use client';

import Link from 'next/link';
import { GlassButton } from '@/components/ui/Glass';

export function WatchPartyCard() {
  return (
    <div className="bento-lg glass-card p-0 overflow-hidden group">
      <Link href="/watch-party">
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-900/70 to-teal-900/50" />
          <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-2xl font-black mb-2">Watch Party</h3>
            <p className="text-white/70 mb-4">Watch together with friends in real-time</p>
            <GlassButton variant="brutal">Start Party</GlassButton>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function TimeCapsuleCard() {
  return (
    <div className="bento-wide glass-card p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-3xl">⏳</span>
        <h3 className="text-xl font-bold">Time Capsules</h3>
      </div>
      <p className="text-white/60 mb-4">Save moments that unlock on a special date</p>
      <Link href="/capsule/create">
        <GlassButton variant="glass" glow>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Capsule
        </GlassButton>
      </Link>
    </div>
  );
}
