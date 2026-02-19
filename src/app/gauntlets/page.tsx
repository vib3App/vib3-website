'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GauntletCard, CreateGauntletModal, GauntletTutorial } from '@/components/gauntlets';
import { gauntletsApi } from '@/services/api/gauntlets';
import { useAuthStore } from '@/stores/authStore';
import type { Gauntlet, CreateGauntletInput } from '@/types/gauntlet';
import { logger } from '@/utils/logger';

type Tab = 'active' | 'upcoming' | 'completed';

export default function GauntletsPage() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [gauntlets, setGauntlets] = useState<Gauntlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { gauntlets: data } = await gauntletsApi.getGauntlets({ status: activeTab });
        setGauntlets(data);
      } catch (err) {
        logger.error('Failed to load gauntlets:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeTab]);

  const handleCreate = async (input: CreateGauntletInput) => {
    try {
      const created = await gauntletsApi.createGauntlet(input);
      setGauntlets(prev => [created, ...prev]);
    } catch (err) {
      logger.error('Failed to create gauntlet:', err);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-lg font-semibold text-white">Gauntlets</h1>
            <div className="flex gap-2">
              {/* Gap #68: Active battles link */}
              <Link href="/gauntlets/active" className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded-full hover:bg-red-500/30 transition">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Live
              </Link>
              {isAuthenticated && (
                <Link href="/gauntlets/my" className="flex items-center gap-2 px-4 py-2 glass text-white/70 text-sm font-medium rounded-full hover:bg-white/10 transition">
                  My Battles
                </Link>
              )}
              {isAuthenticated && (
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm font-medium rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create
              </button>
              )}
            </div>
          </div>
          <div className="flex px-4 gap-1 pb-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl animate-pulse">
                  <div className="h-40 bg-white/5 rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-white/10 rounded w-2/3" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : gauntlets.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/40">No {activeTab} gauntlets</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {gauntlets.map(g => <GauntletCard key={g.id} gauntlet={g} />)}
            </div>
          )}
        </div>
      </main>
      <CreateGauntletModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      {/* Gap #66: Tutorial overlay for first-time visitors */}
      <GauntletTutorial />
    </div>
  );
}
