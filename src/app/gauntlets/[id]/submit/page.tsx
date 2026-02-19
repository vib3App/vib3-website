'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { VideoSubmitForm } from '@/components/gauntlets/VideoSubmitForm';
import { gauntletsApi } from '@/services/api/gauntlets';
import { useAuthStore } from '@/stores/authStore';
import type { Gauntlet } from '@/types/gauntlet';
import { logger } from '@/utils/logger';

export default function SubmitVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [gauntlet, setGauntlet] = useState<Gauntlet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try { setGauntlet(await gauntletsApi.getGauntlet(id)); }
      catch (err) { logger.error('Failed to load gauntlet:', err); }
      finally { setIsLoading(false); }
    };
    load();
  }, [id]);

  const handleSubmit = async (videoId: string) => {
    if (!gauntlet?.pendingMatchId) return;
    setIsSubmitting(true);
    try {
      await gauntletsApi.submitVideo(id, gauntlet.pendingMatchId, videoId);
      setSubmitted(true);
    } catch (err) {
      logger.error('Failed to submit video:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthVerified && !isAuthenticated) {
    router.push(`/login?redirect=/gauntlets/${id}/submit`);
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <div className="max-w-2xl mx-auto px-4">
          <Link href={`/gauntlets/${id}`} className="inline-flex items-center gap-1 text-white/40 hover:text-white/60 text-sm mb-4 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gauntlet
          </Link>

          {isLoading ? (
            <div className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => <div key={i} className="aspect-[9/16] bg-white/5 rounded-lg" />)}
              </div>
            </div>
          ) : submitted ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Video Submitted</h2>
              <p className="text-white/50 mb-6">Your video has been submitted for this match.</p>
              <button onClick={() => router.push(`/gauntlets/${id}`)} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl">
                Back to Gauntlet
              </button>
            </div>
          ) : !gauntlet ? (
            <div className="text-center py-20"><p className="text-white/40 text-lg">Gauntlet not found</p></div>
          ) : !gauntlet.pendingMatchId ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-white/40 text-lg mb-4">No pending match to submit for</p>
              <Link href={`/gauntlets/${id}`} className="text-purple-400 hover:text-purple-300 text-sm">Return to gauntlet</Link>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6">
              <h1 className="text-xl font-bold text-white mb-1">Submit Video</h1>
              <p className="text-white/50 text-sm mb-6">Choose a video to submit for your match in {gauntlet.title}</p>
              <VideoSubmitForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
