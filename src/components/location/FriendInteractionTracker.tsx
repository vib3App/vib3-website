'use client';

import { useState, useMemo } from 'react';
import type { FriendInteraction } from '@/types/location';

interface FriendInteractionTrackerProps {
  interactions: FriendInteraction[];
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<FriendInteraction['type'], { icon: string; label: string; color: string }> = {
  wave: { icon: '👋', label: 'Wave', color: 'text-yellow-400' },
  meetup: { icon: '📍', label: 'Meetup', color: 'text-teal-400' },
  nearby: { icon: '📡', label: 'Nearby', color: 'text-blue-400' },
  message: { icon: '💬', label: 'Message', color: 'text-purple-400' },
  reaction: { icon: '❤️', label: 'Reaction', color: 'text-pink-400' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function FriendInteractionTracker({ interactions, isOpen, onClose }: FriendInteractionTrackerProps) {
  const [filterType, setFilterType] = useState<FriendInteraction['type'] | 'all'>('all');

  const filtered = useMemo(() => {
    const sorted = [...interactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (filterType === 'all') return sorted;
    return sorted.filter(i => i.type === filterType);
  }, [interactions, filterType]);

  // Aggregate stats
  const stats = useMemo(() => {
    const byFriend: Record<string, { count: number; username: string; lastTime: string }> = {};
    interactions.forEach(i => {
      if (!byFriend[i.friendUserId]) {
        byFriend[i.friendUserId] = { count: 0, username: i.friendUsername, lastTime: i.timestamp };
      }
      byFriend[i.friendUserId].count++;
      if (new Date(i.timestamp) > new Date(byFriend[i.friendUserId].lastTime)) {
        byFriend[i.friendUserId].lastTime = i.timestamp;
      }
    });
    return Object.entries(byFriend)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [interactions]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-heavy rounded-2xl border border-white/10 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white font-bold">Interaction History</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Top friends */}
          {stats.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white/50 text-xs font-medium mb-2">Most Interactive</h3>
              <div className="flex gap-3">
                {stats.map(([userId, data]) => (
                  <div key={userId} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                      {data.username[0]?.toUpperCase()}
                    </div>
                    <span className="text-white/60 text-[10px] mt-1">@{data.username}</span>
                    <span className="text-purple-400 text-[10px] font-mono">{data.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-1 p-3 overflow-x-auto no-scrollbar border-b border-white/10">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition ${
                filterType === 'all' ? 'bg-purple-500 text-white' : 'glass text-white/50'
              }`}
            >
              All
            </button>
            {(Object.keys(TYPE_LABELS) as FriendInteraction['type'][]).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition ${
                  filterType === type ? 'bg-purple-500 text-white' : 'glass text-white/50'
                }`}
              >
                {TYPE_LABELS[type].icon} {TYPE_LABELS[type].label}
              </button>
            ))}
          </div>

          {/* Interaction list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filtered.map(interaction => {
              const info = TYPE_LABELS[interaction.type];
              return (
                <div key={interaction.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition">
                  <span className="text-lg">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">
                      <span className={`font-medium ${info.color}`}>{info.label}</span>
                      {' with '}
                      <span className="text-white font-medium">@{interaction.friendUsername}</span>
                    </p>
                    <p className="text-white/30 text-xs">{timeAgo(interaction.timestamp)}</p>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">No interactions recorded</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
