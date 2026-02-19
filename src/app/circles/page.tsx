'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { CircleCard, CreateCircleModal } from '@/components/circles';
import { useCircles } from '@/hooks/useCircles';
import { useAuthStore } from '@/stores/authStore';
import { logger } from '@/utils/logger';

export default function CirclesPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const { circles, isLoading, error, createCircle } = useCircles();
  const [showCreate, setShowCreate] = useState(false);

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/circles');
    return null;
  }

  const handleCreate = async (name: string, color: string, memberIds: string[]) => {
    try {
      await createCircle(name, color, memberIds);
    } catch (err) {
      logger.error('Failed to create circle:', err);
    }
  };

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-lg font-semibold text-white">Circles</h1>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm font-medium rounded-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Circle
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl animate-pulse">
                  <div className="h-24 bg-white/5 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-white/10 rounded w-2/3" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          ) : circles.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-white/40 mb-4">No circles yet</p>
              <button onClick={() => setShowCreate(true)} className="px-6 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm font-medium rounded-full">
                Create your first circle
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {circles.map(circle => <CircleCard key={circle.id} circle={circle} />)}
            </div>
          )}
        </div>
      </main>
      <CreateCircleModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
    </div>
  );
}
