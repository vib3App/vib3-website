'use client';

import { useState, useCallback } from 'react';

interface AdSlotProps {
  position: number;
}

interface HouseAd {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaUrl: string;
  gradient: string;
  icon: string;
}

const HOUSE_ADS: HouseAd[] = [
  {
    id: 'ha-1',
    title: 'Create Your First Video',
    subtitle: 'Record, edit, and share with millions. Your next viral moment starts here.',
    cta: 'Start Creating',
    ctaUrl: '/camera',
    gradient: 'from-purple-600 to-teal-500',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
  {
    id: 'ha-2',
    title: 'Join the Gauntlet',
    subtitle: 'Compete head-to-head in video battles. Earn rewards and climb the leaderboard.',
    cta: 'Enter Gauntlet',
    ctaUrl: '/gauntlets',
    gradient: 'from-orange-500 to-pink-600',
    icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  },
  {
    id: 'ha-3',
    title: 'Go Live Today',
    subtitle: 'Stream to your followers in real-time. Get gifts, interact with fans.',
    cta: 'Go Live',
    ctaUrl: '/live/setup',
    gradient: 'from-red-500 to-purple-600',
    icon: 'M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z',
  },
  {
    id: 'ha-4',
    title: 'Discover New Creators',
    subtitle: 'Find your next favorite creator. Personalized recommendations just for you.',
    cta: 'Explore',
    ctaUrl: '/search',
    gradient: 'from-teal-500 to-blue-600',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    id: 'ha-5',
    title: 'Collab Rooms',
    subtitle: 'Edit videos together in real-time with other creators.',
    cta: 'Start Collab',
    ctaUrl: '/collab',
    gradient: 'from-indigo-500 to-cyan-500',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

export function AdSlot({ position }: AdSlotProps) {
  const [dismissed, setDismissed] = useState(false);
  const ad = HOUSE_ADS[position % HOUSE_ADS.length];

  const handleClick = useCallback(() => {
    window.location.href = ad.ctaUrl;
  }, [ad.ctaUrl]);

  if (dismissed) return null;

  return (
    <div className="relative w-full h-full snap-start snap-always flex-shrink-0 flex items-center justify-center bg-black">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${ad.gradient} opacity-20`} />

      {/* Ad label */}
      <div className="absolute top-20 md:top-14 left-4 z-20">
        <span className="text-white/40 text-xs bg-white/10 px-2 py-0.5 rounded">
          Sponsored
        </span>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-20 md:top-14 right-4 z-20 text-white/40 hover:text-white/70 p-2"
        aria-label="Dismiss ad"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-sm mx-auto px-6 text-center space-y-6">
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${ad.gradient} flex items-center justify-center shadow-2xl`}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ad.icon} />
          </svg>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-white text-2xl font-bold">{ad.title}</h3>
          <p className="text-white/60 text-sm leading-relaxed">{ad.subtitle}</p>
        </div>

        {/* CTA */}
        <button
          onClick={handleClick}
          className={`px-8 py-3 bg-gradient-to-r ${ad.gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105`}
        >
          {ad.cta}
        </button>

        {/* VIB3 branding */}
        <p className="text-white/20 text-xs">VIB3 House Ad</p>
      </div>
    </div>
  );
}

/** How many real videos between ads */
export const AD_INTERVAL = 8;

/** Check if a given feed index should be an ad slot */
export function isAdPosition(index: number): boolean {
  return index > 0 && index % AD_INTERVAL === 0;
}
