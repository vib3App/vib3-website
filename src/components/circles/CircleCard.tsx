'use client';

import Link from 'next/link';
import type { LocationCircle } from '@/types/location';

interface CircleCardProps {
  circle: LocationCircle;
}

export function CircleCard({ circle }: CircleCardProps) {
  const memberCount = circle.members.length;

  return (
    <Link
      href={`/circles/${circle.id}`}
      className="glass-card rounded-2xl overflow-hidden hover:ring-1 hover:ring-white/20 transition-all group"
    >
      <div className="h-24 relative" style={{ backgroundColor: `${circle.color}20` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center"
            style={{ backgroundColor: circle.color }}
          >
            <span className="text-2xl font-bold text-white">
              {circle.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">
          {circle.name}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-sm text-white/40">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        </div>
      </div>
    </Link>
  );
}
