'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { searchApi } from '@/services/api';
import type { SearchUser } from '@/services/api/search';
import { logger } from '@/utils/logger';

const CLOSE_FRIENDS_KEY = 'vib3_close_friends';

export interface CloseFriend {
  id: string;
  username: string;
  avatar?: string;
}

function getCloseFriends(): CloseFriend[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CLOSE_FRIENDS_KEY);
  if (!stored) return [];
  try { return JSON.parse(stored); } catch { return []; }
}

function saveCloseFriends(friends: CloseFriend[]) {
  localStorage.setItem(CLOSE_FRIENDS_KEY, JSON.stringify(friends));
}

export function isCloseFriend(userId: string): boolean {
  return getCloseFriends().some(f => f.id === userId);
}

interface CloseFriendsListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CloseFriendsList({ isOpen, onClose }: CloseFriendsListProps) {
  const [friends, setFriends] = useState<CloseFriend[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isOpen) setFriends(getCloseFriends());
  }, [isOpen]);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setSearching(true);
    try {
      const users = await searchApi.searchUsers(query.trim());
      setResults(users || []);
    } catch (err) {
      logger.error('Search failed:', err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const addFriend = useCallback((user: SearchUser) => {
    const updated = [...friends, { id: user.id, username: user.username, avatar: user.avatar }];
    setFriends(updated);
    saveCloseFriends(updated);
  }, [friends]);

  const removeFriend = useCallback((userId: string) => {
    const updated = friends.filter(f => f.id !== userId);
    setFriends(updated);
    saveCloseFriends(updated);
  }, [friends]);

  const isFriend = useCallback((userId: string) => friends.some(f => f.id === userId), [friends]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg">Close Friends</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <p className="text-white/50 text-sm mb-3">
            Stories shared with close friends show a green ring.
          </p>
          <div className="flex gap-2">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search users..."
              className="flex-1 bg-white/10 text-white placeholder:text-white/40 rounded-xl px-3 py-2 text-sm outline-none border border-white/10 focus:border-purple-500/50" />
            <button onClick={handleSearch} disabled={searching || query.trim().length < 2}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm disabled:opacity-50">
              {searching ? '...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {results.length > 0 && (
            <div className="mb-4">
              <h4 className="text-white/40 text-xs uppercase mb-2">Search Results</h4>
              {results.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-teal-400 shrink-0">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.username} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">{user.username[0]?.toUpperCase()}</div>
                    )}
                  </div>
                  <span className="text-white text-sm flex-1">@{user.username}</span>
                  <button onClick={() => isFriend(user.id) ? removeFriend(user.id) : addFriend(user)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${isFriend(user.id) ? 'bg-green-500/20 text-green-400' : 'bg-purple-500 text-white'}`}>
                    {isFriend(user.id) ? 'Added' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <h4 className="text-white/40 text-xs uppercase mb-2">
            Close Friends ({friends.length})
          </h4>
          {friends.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">No close friends added yet</p>
          ) : (
            friends.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 p-[2px] shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
                    {f.avatar ? (
                      <Image src={f.avatar} alt={f.username} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">{f.username[0]?.toUpperCase()}</div>
                    )}
                  </div>
                </div>
                <span className="text-white text-sm flex-1">@{f.username}</span>
                <button onClick={() => removeFriend(f.id)} className="text-red-400/60 hover:text-red-400 text-xs">Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** Toggle for story creation: "Close Friends Only" */
export function CloseFriendsToggle({ enabled, onToggle }: { enabled: boolean; onToggle: (v: boolean) => void }) {
  const count = getCloseFriends().length;

  return (
    <button onClick={() => onToggle(!enabled)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition ${
        enabled ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'glass text-white/60 hover:text-white'
      }`}>
      <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-400' : 'bg-white/30'}`} />
      Close Friends Only {count > 0 && `(${count})`}
    </button>
  );
}
