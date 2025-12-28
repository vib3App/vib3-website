'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SideNav } from '@/components/ui/SideNav';
import { BottomNav } from '@/components/ui/BottomNav';

interface Challenge {
  id: string;
  title: string;
  hashtag: string;
  description: string;
  thumbnail?: string;
  participants: number;
  videos: number;
  prize?: string;
  endsIn?: string;
  category: 'trending' | 'new' | 'music' | 'dance' | 'comedy' | 'sponsored';
  difficulty: 'easy' | 'medium' | 'hard';
}

const challenges: Challenge[] = [
  {
    id: '1',
    title: 'New Year Countdown',
    hashtag: 'NYE2025',
    description: 'Show us your best New Year celebration moments!',
    participants: 125000,
    videos: 89000,
    prize: '10,000 V3 Coins',
    endsIn: '3 days',
    category: 'trending',
    difficulty: 'easy',
  },
  {
    id: '2',
    title: 'Dance Revolution',
    hashtag: 'DanceRev',
    description: 'Create your own dance to the trending beat',
    participants: 89000,
    videos: 67000,
    category: 'dance',
    difficulty: 'medium',
  },
  {
    id: '3',
    title: 'Comedy Gold',
    hashtag: 'ComedyGold',
    description: 'Make us laugh with your best comedy skit',
    participants: 45000,
    videos: 32000,
    prize: '5,000 V3 Coins',
    category: 'comedy',
    difficulty: 'medium',
  },
  {
    id: '4',
    title: 'Lip Sync Battle',
    hashtag: 'LipSyncBattle',
    description: 'Show off your lip sync skills to popular songs',
    participants: 234000,
    videos: 178000,
    category: 'music',
    difficulty: 'easy',
  },
  {
    id: '5',
    title: 'VIB3 Creator Challenge',
    hashtag: 'VIB3Creator',
    description: 'Official VIB3 creator challenge with amazing prizes',
    participants: 56000,
    videos: 41000,
    prize: '25,000 V3 Coins + Feature',
    endsIn: '7 days',
    category: 'sponsored',
    difficulty: 'hard',
  },
  {
    id: '6',
    title: 'Transformation Tuesday',
    hashtag: 'TransformationTuesday',
    description: 'Show your amazing before/after transformations',
    participants: 78000,
    videos: 54000,
    category: 'new',
    difficulty: 'easy',
  },
];

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

export default function ChallengesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredChallenges =
    activeCategory === 'all'
      ? challenges
      : challenges.filter((c) => c.category === activeCategory);

  return (
    <div className="flex min-h-screen aurora-bg">
      <SideNav />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/60 via-orange-500/60 to-amber-500/60 backdrop-blur-3xl" />
          <div className="relative px-6 py-12 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <span>🏆</span> VIB3 Challenges
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Join trending challenges and go viral
            </p>
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
              onClick={() => setActiveCategory(cat.id)}
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

        {/* Challenges Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => (
            <Link
              key={challenge.id}
              href={`/hashtag/${challenge.hashtag}`}
              className="glass-card overflow-hidden hover:border-amber-500/50 transition-all hover:scale-[1.02] group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                {challenge.thumbnail ? (
                  <Image
                    src={challenge.thumbnail}
                    alt={challenge.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {challenge.category === 'music' && '🎵'}
                    {challenge.category === 'dance' && '💃'}
                    {challenge.category === 'comedy' && '😂'}
                    {challenge.category === 'sponsored' && '⭐'}
                    {challenge.category === 'trending' && '🔥'}
                    {challenge.category === 'new' && '✨'}
                  </div>
                )}
                {challenge.prize && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    🏆 {challenge.prize}
                  </div>
                )}
                {challenge.endsIn && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    ⏰ Ends in {challenge.endsIn}
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
                <p className="text-amber-500 font-medium mb-2">#{challenge.hashtag}</p>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                  {challenge.description}
                </p>
                <div className="flex items-center gap-4 text-white/50 text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span>{formatCount(challenge.participants)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                    </svg>
                    <span>{formatCount(challenge.videos)} videos</span>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <div className="px-4 pb-4">
                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
                  Join Challenge
                </button>
              </div>
            </Link>
          ))}
        </div>

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
                  <label className="block text-white/70 text-sm mb-2">Challenge Title</label>
                  <input
                    type="text"
                    placeholder="Give your challenge a catchy name"
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Hashtag</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">#</span>
                    <input
                      type="text"
                      placeholder="YourChallengeHashtag"
                      className="w-full glass rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Description</label>
                  <textarea
                    placeholder="Describe what participants should do..."
                    rows={3}
                    className="w-full glass rounded-xl px-4 py-3 text-white resize-none placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Category</label>
                  <select className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                    <option value="dance">Dance</option>
                    <option value="music">Music</option>
                    <option value="comedy">Comedy</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Prize (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 1000 V3 Coins"
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity mt-4">
                  Create Challenge
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav />

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
