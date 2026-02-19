'use client';

import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ActiveBattlesList } from '@/components/gauntlets/ActiveBattlesList';

export default function ActiveBattlesPage() {
  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full uppercase">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Live
                </span>
                Active Battles
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Watch and vote on live gauntlet battles
              </p>
            </div>
            <Link
              href="/gauntlets"
              className="px-4 py-2 glass text-white/70 text-sm font-medium rounded-full hover:bg-white/10 transition"
            >
              All Gauntlets
            </Link>
          </div>

          <ActiveBattlesList />
        </div>
      </main>
    </div>
  );
}
