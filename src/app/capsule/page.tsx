'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  ClockIcon,
  LockClosedIcon,
  LockOpenIcon,
  BellIcon,
  BellSlashIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { capsuleApi } from '@/services/api/capsule';
import type { TimeCapsule, CapsuleStatus } from '@/types/capsule';

const STATUS_CONFIG: Record<CapsuleStatus, { label: string; color: string; bgColor: string }> = {
  sealed: { label: 'Sealed', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  unlocking: { label: 'Unlocking...', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  unlocked: { label: 'Unlocked', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  expired: { label: 'Expired', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
};

function formatTimeUntil(date: string): string {
  const now = new Date();
  const unlock = new Date(date);
  const diff = unlock.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function CapsulePage() {
  const [tab, setTab] = useState<'upcoming' | 'unlocked' | 'my' | 'received'>('upcoming');
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCapsules = async () => {
      setLoading(true);
      try {
        let data: TimeCapsule[];
        switch (tab) {
          case 'upcoming':
            const upcoming = await capsuleApi.getUpcomingCapsules();
            data = upcoming.capsules;
            break;
          case 'unlocked':
            const unlocked = await capsuleApi.getUnlockedCapsules();
            data = unlocked.capsules;
            break;
          case 'my':
            data = await capsuleApi.getMyCapsules();
            break;
          case 'received':
            data = await capsuleApi.getReceivedCapsules();
            break;
        }
        setCapsules(data);
      } catch (err) {
        console.error('Failed to fetch capsules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [tab]);

  const handleSubscribe = async (capsuleId: string) => {
    try {
      if (subscribedIds.has(capsuleId)) {
        await capsuleApi.unsubscribeFromCapsule(capsuleId);
        setSubscribedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(capsuleId);
          return newSet;
        });
      } else {
        await capsuleApi.subscribeToCapsule(capsuleId, { notifyPush: true });
        setSubscribedIds(prev => new Set([...prev, capsuleId]));
      }
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold">Time Capsules</h1>
          </div>
          <Link
            href="/capsule/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium text-sm hover:opacity-90 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Create Capsule
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl">
          <h2 className="text-2xl font-bold mb-2">Create moments for the future</h2>
          <p className="text-gray-400 max-w-xl">
            Time Capsules let you create videos that unlock at a future date. Perfect for birthday
            surprises, anniversary messages, or predictions for your future self.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'upcoming' as const, label: 'Upcoming', icon: ClockIcon },
            { id: 'unlocked' as const, label: 'Unlocked', icon: LockOpenIcon },
            { id: 'my' as const, label: 'My Capsules', icon: CalendarIcon },
            { id: 'received' as const, label: 'Received', icon: LockClosedIcon },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                  tab === t.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : capsules.length === 0 ? (
          <div className="text-center py-20">
            <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">
              {tab === 'my' ? 'No capsules created yet' :
               tab === 'received' ? 'No capsules received' :
               tab === 'unlocked' ? 'No unlocked capsules' :
               'No upcoming capsules'}
            </h2>
            <p className="text-gray-400 mb-6">
              {tab === 'my' ? 'Create your first time capsule!' : 'Check back later for new reveals'}
            </p>
            {tab === 'my' && (
              <Link
                href="/capsule/create"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium hover:opacity-90 transition"
              >
                Create Capsule
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capsules.map(capsule => {
              const statusConfig = STATUS_CONFIG[capsule.status];
              const isSubscribed = subscribedIds.has(capsule.id);

              return (
                <div
                  key={capsule.id}
                  className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition group"
                >
                  {/* Cover Image */}
                  <div className="aspect-video bg-gray-800 relative overflow-hidden">
                    {capsule.status === 'unlocked' && capsule.thumbnailUrl ? (
                      <img
                        src={capsule.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : capsule.coverImageUrl ? (
                      <img
                        src={capsule.coverImageUrl}
                        alt=""
                        className="w-full h-full object-cover blur-sm opacity-50"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                        <LockClosedIcon className="w-16 h-16 text-purple-400 opacity-50" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-1 ${statusConfig.bgColor} rounded-full`}>
                      <span className={`text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Lock Icon for sealed capsules */}
                    {capsule.status !== 'unlocked' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
                          <LockClosedIcon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Countdown */}
                    {capsule.status === 'sealed' && (
                      <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-black/70 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-gray-400">Unlocks in</span>
                        <span className="font-mono font-bold text-purple-400">
                          {formatTimeUntil(capsule.unlockAt)}
                        </span>
                      </div>
                    )}

                    {/* Subscribe Button */}
                    {capsule.status === 'sealed' && tab !== 'my' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubscribe(capsule.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition"
                        title={isSubscribed ? 'Unsubscribe' : 'Notify me'}
                      >
                        {isSubscribed ? (
                          <BellIcon className="w-5 h-5 text-purple-400" />
                        ) : (
                          <BellSlashIcon className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1 group-hover:text-purple-400 transition">
                      {capsule.title}
                    </h3>

                    {capsule.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {capsule.description}
                      </p>
                    )}

                    {/* Creator */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                        {capsule.creatorAvatar ? (
                          <img src={capsule.creatorAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                            {capsule.creatorUsername[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm">{capsule.creatorUsername}</span>
                    </div>

                    {/* Stats (for unlocked) */}
                    {capsule.status === 'unlocked' && (
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          {formatCount(capsule.viewCount)}
                        </div>
                        <div className="flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" />
                          {formatCount(capsule.likeCount)}
                        </div>
                      </div>
                    )}

                    {/* Unlock date */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                      <CalendarIcon className="w-4 h-4" />
                      {capsule.status === 'unlocked'
                        ? `Unlocked ${new Date(capsule.unlockedAt!).toLocaleDateString()}`
                        : `Unlocks ${new Date(capsule.unlockAt).toLocaleDateString()}`
                      }
                    </div>

                    {/* Recipients (for private capsules) */}
                    {capsule.isPrivate && capsule.recipientUsernames && capsule.recipientUsernames.length > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        For: {capsule.recipientUsernames.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Link overlay for unlocked capsules */}
                  {capsule.status === 'unlocked' && (
                    <Link href={`/capsule/${capsule.id}`} className="absolute inset-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
