'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { GradientText } from '@/components/ui/Glass';

interface DiscoverHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function DiscoverHeader({ searchQuery, onSearchChange, onSearchSubmit }: DiscoverHeaderProps) {
  return (
    <header className="px-4 md:px-8 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-4xl md:text-5xl font-black">
          <GradientText animate>Discover</GradientText>
        </h1>
      </div>
      <p className="text-white/60 text-lg">Find your next obsession</p>

      <form onSubmit={onSearchSubmit} className="mt-4 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search videos, creators, sounds..."
          className="w-full glass rounded-2xl px-12 py-4 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </form>
    </header>
  );
}
