'use client';

import Link from 'next/link';
import { GlassButton } from '@/components/ui/Glass';
import { VIBES, CATEGORIES } from './DiscoverUtils';

interface VibeSelectorProps {
  activeVibe: string | null;
  onVibeChange: (vibe: string | null) => void;
}

export function VibeSelector({ activeVibe, onVibeChange }: VibeSelectorProps) {
  return (
    <div className="bento-wide glass-card p-4">
      <h3 className="text-lg font-bold mb-3 gradient-text">Pick Your Vibe</h3>
      <div className="grid grid-cols-3 gap-2">
        {VIBES.map((vibe) => (
          <button
            key={vibe.id}
            onClick={() => onVibeChange(vibe.id === activeVibe ? null : vibe.id)}
            className={`relative rounded-xl p-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
              activeVibe === vibe.id
                ? `bg-gradient-to-br ${vibe.color} scale-105 shadow-lg`
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-xl">{vibe.emoji}</span>
            <span className="text-xs font-medium">{vibe.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CategoriesSection() {
  return (
    <div className="bento-wide glass-card p-4">
      <h3 className="font-bold mb-3">Quick Categories</h3>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link key={cat} href={`/category/${cat.toLowerCase()}`} prefetch={false}>
            <GlassButton size="sm" variant="ghost" className="text-sm hover:scale-105 transition-transform">
              {cat}
            </GlassButton>
          </Link>
        ))}
      </div>
    </div>
  );
}
