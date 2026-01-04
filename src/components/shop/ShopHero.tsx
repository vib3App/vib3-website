'use client';

import Link from 'next/link';
import { ArrowLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ShopHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

export function ShopHero({ searchQuery, onSearchChange, cartCount, onCartClick }: ShopHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 via-pink-500/50 to-teal-400/50" />
      <div className="absolute inset-0 backdrop-blur-3xl" />

      <Link
        href="/feed"
        className="absolute top-4 left-4 z-10 p-2 hover:bg-white/10 rounded-full transition"
      >
        <ArrowLeftIcon className="w-5 h-5 text-white" />
      </Link>

      <div className="relative px-6 py-16 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
          VIB3 Shop
        </h1>
        <p className="text-xl text-white/80 mb-8">Exclusive items, effects, and creator tools</p>

        <div className="max-w-md mx-auto relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full glass-heavy rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {cartCount > 0 && (
          <button
            onClick={onCartClick}
            className="absolute top-4 right-4 glass px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-white hover:bg-white/20 transition"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="px-2 py-0.5 bg-purple-500 rounded-full text-sm">{cartCount}</span>
          </button>
        )}
      </div>
    </div>
  );
}
