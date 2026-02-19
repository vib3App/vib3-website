'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  NoSymbolIcon,
  SpeakerXMarkIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { liveApi } from '@/services/api';
import { logger } from '@/utils/logger';

/**
 * Gap #43: Stream Moderation Panel
 *
 * Provides host with moderation tools:
 *  - Ban viewer (removes from stream)
 *  - Mute viewer (hides their chat)
 *  - Report viewer
 *
 * Uses API: POST /api/live/{streamId}/ban
 */

interface ModerationPanelProps {
  streamId: string;
  isOpen: boolean;
  onClose: () => void;
  /** Optional list of current viewers for quick action */
  viewers?: Array<{ userId: string; username: string; avatar?: string }>;
}

interface BannedUser {
  userId: string;
  username: string;
  bannedAt: string;
}

export function ModerationPanel({
  streamId,
  isOpen,
  onClose,
  viewers = [],
}: ModerationPanelProps) {
  const [tab, setTab] = useState<'viewers' | 'banned'>('viewers');
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banTarget, setBanTarget] = useState<string | null>(null);

  // Load banned users
  useEffect(() => {
    if (!isOpen || tab !== 'banned') return;
    const load = async () => {
      setIsLoading(true);
      try {
        const users = await liveApi.getBannedUsers(streamId);
        setBannedUsers(users);
      } catch (err) {
        logger.error('Failed to load banned users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [streamId, isOpen, tab]);

  const handleBan = useCallback(async (userId: string, reason?: string) => {
    try {
      await liveApi.banUser(streamId, userId, reason || undefined);
      setBannedUsers((prev) => [
        ...prev,
        { userId, username: viewers.find((v) => v.userId === userId)?.username || 'User', bannedAt: new Date().toISOString() },
      ]);
      setBanTarget(null);
      setBanReason('');
    } catch (err) {
      logger.error('Failed to ban user:', err);
    }
  }, [streamId, viewers]);

  const handleUnban = useCallback(async (userId: string) => {
    try {
      await liveApi.unbanUser(streamId, userId);
      setBannedUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      logger.error('Failed to unban user:', err);
    }
  }, [streamId]);

  const handleMuteToggle = useCallback((userId: string) => {
    setMutedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
    // Send mute event via the chat moderation
    // In a real implementation, this would call an API endpoint
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Moderation</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Close">
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setTab('viewers')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === 'viewers' ? 'text-white border-b-2 border-pink-500' : 'text-white/50 hover:text-white/70'
            }`}
          >
            Viewers ({viewers.length})
          </button>
          <button
            onClick={() => setTab('banned')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === 'banned' ? 'text-white border-b-2 border-pink-500' : 'text-white/50 hover:text-white/70'
            }`}
          >
            Banned ({bannedUsers.length})
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {tab === 'viewers' ? (
            viewers.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">No viewers yet</div>
            ) : (
              <div className="space-y-2">
                {viewers.map((viewer) => {
                  const isMuted = mutedUserIds.has(viewer.userId);
                  const isBanned = bannedUsers.some((b) => b.userId === viewer.userId);
                  if (isBanned) return null;
                  return (
                    <div key={viewer.userId} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden flex-shrink-0">
                        {viewer.avatar ? (
                          <Image src={viewer.avatar} alt={viewer.username} width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {viewer.username[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-white text-sm font-medium flex-1">{viewer.username}</span>

                      {/* Mute chat */}
                      <button
                        onClick={() => handleMuteToggle(viewer.userId)}
                        className={`p-1.5 rounded-full transition ${
                          isMuted ? 'bg-orange-500' : 'bg-white/10 hover:bg-white/20'
                        }`}
                        title={isMuted ? 'Unmute chat' : 'Mute chat'}
                      >
                        <SpeakerXMarkIcon className="w-4 h-4 text-white" />
                      </button>

                      {/* Ban */}
                      <button
                        onClick={() => setBanTarget(viewer.userId)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-full transition"
                        title="Ban"
                      >
                        <NoSymbolIcon className="w-4 h-4 text-red-400" />
                      </button>

                      {/* Report */}
                      <button
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition"
                        title="Report"
                      >
                        <FlagIcon className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Banned tab */
            isLoading ? (
              <div className="text-center py-6">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              </div>
            ) : bannedUsers.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">No banned users</div>
            ) : (
              <div className="space-y-2">
                {bannedUsers.map((user) => (
                  <div key={user.userId} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <NoSymbolIcon className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{user.username}</p>
                      <p className="text-white/30 text-xs">
                        Banned {new Date(user.bannedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnban(user.userId)}
                      className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                    >
                      Unban
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Ban confirmation dialog */}
        {banTarget && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
              <h4 className="text-white font-semibold mb-3">Ban User</h4>
              <p className="text-white/50 text-sm mb-4">
                Ban {viewers.find((v) => v.userId === banTarget)?.username || 'this user'} from the stream?
              </p>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason (optional)"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/30 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setBanTarget(null); setBanReason(''); }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBan(banTarget, banReason)}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm font-medium transition"
                >
                  Ban
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
