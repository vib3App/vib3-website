'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { challengesApi } from '@/services/api';
import { useToastStore } from '@/stores/toastStore';
import {
  ChallengesHero,
  ChallengeCategoryTabs,
  ChallengeCard,
  CreateChallengeModal,
} from '@/components/challenges';
import type { Challenge, ChallengeCategory, CreateChallengeInput } from '@/types/challenge';
import { logger } from '@/utils/logger';

export default function ChallengesPage() {
  const addToast = useToastStore(s => s.addToast);
  const [activeCategory, setActiveCategory] = useState<ChallengeCategory | 'all'>('all');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formHashtag, setFormHashtag] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<ChallengeCategory>('other');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formPrize, setFormPrize] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await challengesApi.getChallenges({
          category: activeCategory,
          page: 1,
          limit: 20,
        });
        if (!cancelled) {
          setChallenges(response.challenges);
          setHasMore(response.hasMore);
          setPage(1);
        }
      } catch (err) {
        logger.error('Error fetching challenges:', err);
        if (!cancelled) {
          setError('Failed to load challenges');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeCategory, refreshKey]);

  const fetchMoreChallenges = useCallback(async (nextPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await challengesApi.getChallenges({
        category: activeCategory,
        page: nextPage,
        limit: 20,
      });
      setChallenges((prev) => [...prev, ...response.challenges]);
      setHasMore(response.hasMore);
    } catch (err) {
      logger.error('Error fetching challenges:', err);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  const handleCategoryChange = (category: ChallengeCategory | 'all') => {
    setActiveCategory(category);
    setPage(1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMoreChallenges(nextPage);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormHashtag('');
    setFormDescription('');
    setFormCategory('other');
    setFormDifficulty('medium');
    setFormPrize('');
    setFormEndDate('');
  };

  const handleCreateChallenge = async () => {
    if (!formTitle || !formHashtag || !formDescription || !formEndDate) return;
    try {
      setCreating(true);
      const input: CreateChallengeInput = {
        title: formTitle,
        hashtag: formHashtag.replace('#', ''),
        description: formDescription,
        category: formCategory,
        difficulty: formDifficulty,
        prize: formPrize || undefined,
        endDate: new Date(formEndDate).toISOString(),
      };
      await challengesApi.createChallenge(input);
      setShowCreateModal(false);
      resetForm();
      setRefreshKey(k => k + 1);
    } catch (err) {
      logger.error('Error creating challenge:', err);
      addToast('Failed to create challenge. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinChallenge = async (e: React.MouseEvent, challengeId: string, hasJoined: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setJoiningId(challengeId);
      if (hasJoined) {
        await challengesApi.leaveChallenge(challengeId);
      } else {
        await challengesApi.joinChallenge(challengeId);
      }
      setChallenges((prev) =>
        prev.map((c) =>
          c._id === challengeId
            ? { ...c, hasJoined: !hasJoined, stats: { ...c.stats, participantCount: c.stats.participantCount + (hasJoined ? -1 : 1) } }
            : c
        )
      );
    } catch (err) {
      logger.error('Error joining/leaving challenge:', err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        <div className="px-6 py-4">
          <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition inline-flex">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
        </div>

        <ChallengesHero onCreateClick={() => setShowCreateModal(true)} />
        <ChallengeCategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

        {loading && challenges.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => setRefreshKey(k => k + 1)} className="px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition">
              Retry
            </button>
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold text-white mb-2">No challenges yet</h2>
            <p className="text-white/60 mb-6">Be the first to create a challenge!</p>
            <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium hover:opacity-90 transition">
              Create Challenge
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge._id} challenge={challenge} joiningId={joiningId} onJoin={handleJoinChallenge} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-4 text-center pb-8">
                <button onClick={loadMore} disabled={loading} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition disabled:opacity-50">
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        <CreateChallengeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateChallenge}
          creating={creating}
          formState={{ title: formTitle, hashtag: formHashtag, description: formDescription, category: formCategory, difficulty: formDifficulty, prize: formPrize, endDate: formEndDate }}
          onFormChange={{ setTitle: setFormTitle, setHashtag: setFormHashtag, setDescription: setFormDescription, setCategory: setFormCategory, setDifficulty: setFormDifficulty, setPrize: setFormPrize, setEndDate: setFormEndDate }}
        />
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
