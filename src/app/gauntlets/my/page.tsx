'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { MyGauntletCard } from '@/components/gauntlets/MyGauntletCard';
import { gauntletsApi } from '@/services/api/gauntlets';
import { useAuthStore } from '@/stores/authStore';
import type { Gauntlet } from '@/types/gauntlet';
import { logger } from '@/utils/logger';

export default function MyGauntletsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [gauntlets, setGauntlets] = useState<Gauntlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try { setGauntlets((await gauntletsApi.getMyGauntlets()).gauntlets); }
      catch (err) { logger.error('Failed to load my gauntlets:', err); }
      finally { setIsLoading(false); }
    };
    load();
  }, [isAuthenticated]);

  if (isAuthVerified && !isAuthenticated) {
    router.push('/login?redirect=/gauntlets/my');
    return null;
  }

  const active = gauntlets.filter(g => g.status === 'active' || g.status === 'voting');
  const upcoming = gauntlets.filter(g => g.status === 'upcoming');
  const completed = gauntlets.filter(g => g.status === 'completed');

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">My Gauntlets</h1>
            <Link href="/gauntlets" className="text-sm text-purple-400 hover:text-purple-300 transition">Browse All</Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-white/5 rounded-lg" />
                    <div className="flex-1 space-y-2"><div className="h-5 bg-white/10 rounded w-2/3" /><div className="h-4 bg-white/5 rounded w-1/2" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : gauntlets.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/40 mb-4">You haven&apos;t joined any gauntlets yet</p>
              <Link href="/gauntlets" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl">Browse Gauntlets</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {active.length > 0 && (
                <section>
                  <h2 className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">Active</h2>
                  <div className="space-y-3">{active.map(g => <MyGauntletCard key={g.id} gauntlet={g} />)}</div>
                </section>
              )}
              {upcoming.length > 0 && (
                <section>
                  <h2 className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">Upcoming</h2>
                  <div className="space-y-3">{upcoming.map(g => <MyGauntletCard key={g.id} gauntlet={g} />)}</div>
                </section>
              )}
              {completed.length > 0 && (
                <section>
                  <h2 className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">Completed</h2>
                  <div className="space-y-3">{completed.map(g => <MyGauntletCard key={g.id} gauntlet={g} />)}</div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
