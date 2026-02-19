'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { XMarkIcon, MagnifyingGlassIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { userApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import { logger } from '@/utils/logger';

interface Follower {
  id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}

interface InviteFollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
}

export function InviteFollowersModal({ isOpen, onClose, streamId }: InviteFollowersModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [search, setSearch] = useState('');
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const loadFollowers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getFollowers('me');
      const mapped: Follower[] = (data.users || []).map((f: { id?: string; userId?: string; username: string; avatar?: string; profilePicture?: string }) => ({
        id: f.id || f.userId || '',
        username: f.username,
        avatar: f.avatar || f.profilePicture,
      }));
      setFollowers(mapped);
    } catch (err) {
      logger.error('Failed to load followers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFollowers();
      setInvitedIds(new Set());
      setSearch('');
    }
  }, [isOpen, loadFollowers]);

  const handleInvite = useCallback((userId: string) => {
    websocketService.send('live:invite', { streamId, userId });
    setInvitedIds((prev) => new Set(prev).add(userId));
  }, [streamId]);

  const handleInviteAll = useCallback(() => {
    const filtered = getFiltered();
    filtered.forEach((f) => {
      if (!invitedIds.has(f.id)) {
        websocketService.send('live:invite', { streamId, userId: f.id });
      }
    });
    setInvitedIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((f) => next.add(f.id));
      return next;
    });
  }, [streamId, invitedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const getFiltered = useCallback(() => {
    if (!search.trim()) return followers;
    const q = search.toLowerCase();
    return followers.filter((f) => f.username.toLowerCase().includes(q));
  }, [followers, search]);

  if (!isOpen) return null;
  const filtered = getFiltered();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 glass-card rounded-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg">Invite Followers</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
            <XMarkIcon className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search followers..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Invite All */}
        {filtered.length > 0 && (
          <div className="px-4 pb-2">
            <button
              onClick={handleInviteAll}
              className="w-full py-2 text-sm font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition"
            >
              Invite All ({filtered.length})
            </button>
          </div>
        )}

        {/* Follower List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">
                {search ? 'No followers match your search' : 'No followers yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((follower) => {
                const isInvited = invitedIds.has(follower.id);
                return (
                  <div key={follower.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                      {follower.avatar ? (
                        <Image src={follower.avatar} alt={follower.username} width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-bold">
                          {follower.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-white text-sm font-medium flex-1 truncate">
                      @{follower.username}
                    </span>
                    <button
                      onClick={() => handleInvite(follower.id)}
                      disabled={isInvited}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                        isInvited
                          ? 'bg-green-500/20 text-green-400 cursor-default'
                          : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Sent
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-3.5 h-3.5" />
                          Invite
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
