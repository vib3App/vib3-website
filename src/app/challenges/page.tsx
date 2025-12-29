'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { challengesApi } from '@/services/api';
import type { Challenge, ChallengeCategory, CreateChallengeInput } from '@/types/challenge';

const categories = [
  { id: 'all', label: 'All', icon: '🔥' },
  { id: 'trending', label: 'Trending', icon: '📈' },
  { id: 'new', label: 'New', icon: '✨' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'dance', label: 'Dance', icon: '💃' },
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'sponsored', label: 'Sponsored', icon: '⭐' },
];

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function getTimeRemaining(endDate: string): string | null {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} min`;
}

export default function ChallengesPage() {
  const [activeCategory, setActiveCategory] = useState<ChallengeCategory | 'all'>('all');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formHashtag, setFormHashtag] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<ChallengeCategory>('other');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formPrize, setFormPrize] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const fetchChallenges = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = reset ? 1 : page;
      const response = await challengesApi.getChallenges({
        category: activeCategory,
        page: currentPage,
        limit: 20,
      });
      if (reset) {
        setChallenges(response.challenges);
      } else {
        setChallenges((prev) => [...prev, ...response.challenges]);
      }
      setHasMore(response.hasMore);
      if (reset) setPage(1);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, page]);

  useEffect(() => {
    fetchChallenges(true);
  }, [activeCategory]);

  const handleCategoryChange = (category: ChallengeCategory | 'all') => {
    setActiveCategory(category);
    setPage(1);
  };

  const loadMore = () => {
    setPage((p) => p + 1);
    fetchChallenges(false);
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
      setFormTitle('');
      setFormHashtag('');
      setFormDescription('');
      setFormCategory('other');
      setFormDifficulty('medium');
      setFormPrize('');
      setFormEndDate('');
      fetchChallenges(true);
    } catch (err) {
      console.error('Error creating challenge:', err);
      alert('Failed to create challenge. Please try again.');
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
            ? {
                ...c,
                hasJoined: !hasJoined,
                stats: {
                  ...c.stats,
                  participantCount: c.stats.participantCount + (hasJoined ? -1 : 1),
                },
              }
            : c
        )
      );
    } catch (err) {
      console.error('Error joining/leaving challenge:', err);
    } finally {
      setJoiningId(null);
    }
  };

  const getCreatorUsername = (challenge: Challenge): string => {
    if (typeof challenge.creatorId === 'object' && challenge.creatorId.username) {
      return challenge.creatorId.username;
    }
    return 'Unknown';
  };

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        {/* Back Button Header */}
        <div className="px-6 py-4">
          <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition inline-flex">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/60 via-orange-500/60 to-amber-500/60 backdrop-blur-3xl" />
          <div className="relative px-6 py-12 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <span>🏆</span> VIB3 Challenges
            </h1>
            <p className="text-xl text-white/90 mb-8">Join trending challenges and go viral</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <span>➕</span> Create Challenge
              </button>
              <Link
                href="/profile?tab=challenges"
                className="bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <span>🎵</span> My Participations
              </Link>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-6 py-4 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as ChallengeCategory | 'all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-white/20 shadow-lg shadow-amber-500/20'
                  : 'glass text-white/70 hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && challenges.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchChallenges(true)}
              className="px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
            >
              Retry
            </button>
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold text-white mb-2">No challenges yet</h2>
            <p className="text-white/60 mb-6">Be the first to create a challenge!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium hover:opacity-90 transition"
            >
              Create Challenge
            </button>
          </div>
        ) : (
          <>
            {/* Challenges Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => {
                const timeRemaining = getTimeRemaining(challenge.endDate);
                return (
                  <Link
                    key={challenge._id}
                    href={`/hashtag/${challenge.hashtag}`}
                    className="glass-card overflow-hidden hover:border-amber-500/50 transition-all hover:scale-[1.02] group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                      {challenge.coverImage ? (
                        <Image src={challenge.coverImage} alt={challenge.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-6xl">
                          {challenge.category === 'music' && '🎵'}
                          {challenge.category === 'dance' && '💃'}
                          {challenge.category === 'comedy' && '😂'}
                          {challenge.category === 'sponsored' && '⭐'}
                          {challenge.category === 'trending' && '🔥'}
                          {challenge.category === 'new' && '✨'}
                          {!['music', 'dance', 'comedy', 'sponsored', 'trending', 'new'].includes(challenge.category) &&
                            '🏆'}
                        </div>
                      )}
                      {challenge.prize && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          🏆 {challenge.prize}
                        </div>
                      )}
                      {timeRemaining && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          ⏰ Ends in {timeRemaining}
                        </div>
                      )}
                      <div
                        className={`absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                          challenge.difficulty === 'easy'
                            ? 'bg-green-500/80 text-white'
                            : challenge.difficulty === 'medium'
                            ? 'bg-amber-500/80 text-white'
                            : 'bg-red-500/80 text-white'
                        }`}
                      >
                        {challenge.difficulty}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors">
                        {challenge.title}
                      </h3>
                      <p className="text-amber-500 font-medium mb-1">#{challenge.hashtag}</p>
                      <p className="text-white/40 text-xs mb-2">by @{getCreatorUsername(challenge)}</p>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-white/50 text-sm">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          <span>{formatCount(challenge.stats.participantCount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                          </svg>
                          <span>{formatCount(challenge.stats.videoCount)} videos</span>
                        </div>
                      </div>
                    </div>

                    {/* Join Button */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={(e) => handleJoinChallenge(e, challenge._id, !!challenge.hasJoined)}
                        disabled={joiningId === challenge._id}
                        className={`w-full font-semibold py-3 rounded-xl transition-opacity ${
                          challenge.hasJoined
                            ? 'bg-white/20 text-white hover:bg-white/30'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90'
                        } ${joiningId === challenge._id ? 'opacity-50' : ''}`}
                      >
                        {joiningId === challenge._id ? 'Loading...' : challenge.hasJoined ? 'Joined ✓' : 'Join Challenge'}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-4 text-center pb-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Challenge Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="glass-heavy rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create a Challenge</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Challenge Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Give your challenge a catchy name"
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Hashtag *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">#</span>
                    <input
                      type="text"
                      value={formHashtag}
                      onChange={(e) => setFormHashtag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="YourChallengeHashtag"
                      className="w-full glass rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Description *</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe what participants should do..."
                    rows={3}
                    className="w-full glass rounded-xl px-4 py-3 text-white resize-none placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ChallengeCategory)}
                      className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-transparent"
                    >
                      <option value="dance" className="bg-gray-900">Dance</option>
                      <option value="music" className="bg-gray-900">Music</option>
                      <option value="comedy" className="bg-gray-900">Comedy</option>
                      <option value="fitness" className="bg-gray-900">Fitness</option>
                      <option value="food" className="bg-gray-900">Food</option>
                      <option value="art" className="bg-gray-900">Art</option>
                      <option value="other" className="bg-gray-900">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Difficulty</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-transparent"
                    >
                      <option value="easy" className="bg-gray-900">Easy</option>
                      <option value="medium" className="bg-gray-900">Medium</option>
                      <option value="hard" className="bg-gray-900">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">End Date *</label>
                  <input
                    type="datetime-local"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Prize (Optional)</label>
                  <input
                    type="text"
                    value={formPrize}
                    onChange={(e) => setFormPrize(e.target.value)}
                    placeholder="e.g., 1000 V3 Coins"
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <button
                  onClick={handleCreateChallenge}
                  disabled={creating || !formTitle || !formHashtag || !formDescription || !formEndDate}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Challenge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
