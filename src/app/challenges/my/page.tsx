'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { challengesApi } from '@/services/api';
import type { Challenge } from '@/types/challenge';

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

export default function MyChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'joined' | 'created'>('joined');

  useEffect(() => {
    async function fetchMyChallenges() {
      try {
        setLoading(true);
        setError(null);
        // API returns Challenge[] directly
        const challenges = await challengesApi.getMyChallenges();
        setChallenges(challenges || []);
      } catch (err) {
        console.error('Error fetching my challenges:', err);
        setError('Failed to load your challenges');
      } finally {
        setLoading(false);
      }
    }

    fetchMyChallenges();
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (activeFilter === 'created') {
      return c.isCreator;
    }
    return c.hasJoined;
  });

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
        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/challenges" className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">My Challenges</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-6 py-4">
          <button
            onClick={() => setActiveFilter('joined')}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeFilter === 'joined'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'glass text-white/70 hover:bg-white/10'
            }`}
          >
            🎵 Joined
          </button>
          <button
            onClick={() => setActiveFilter('created')}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeFilter === 'created'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'glass text-white/70 hover:bg-white/10'
            }`}
          >
            ✨ Created
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Link
              href="/challenges"
              className="px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition inline-block"
            >
              Browse Challenges
            </Link>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{activeFilter === 'joined' ? '🎵' : '✨'}</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {activeFilter === 'joined' ? 'No challenges joined yet' : 'No challenges created yet'}
            </h2>
            <p className="text-white/60 mb-6">
              {activeFilter === 'joined'
                ? 'Join a challenge to see it here!'
                : 'Create a challenge to see it here!'}
            </p>
            <Link
              href="/challenges"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium hover:opacity-90 transition inline-block"
            >
              Browse Challenges
            </Link>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((challenge) => {
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
                        ⏰ {timeRemaining}
                      </div>
                    )}
                    {challenge.isCreator && (
                      <div className="absolute bottom-3 left-3 bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full">
                        Creator
                      </div>
                    )}
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
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
