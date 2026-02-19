'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { XMarkIcon, UserPlusIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { liveApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import { logger } from '@/utils/logger';

/**
 * Gap #42: Multi-Host / Guest Request Panel
 *
 * Shows pending guest requests for host.
 * Accept/decline buttons.
 * When accepted: guest's video stream added to layout.
 * Listens to WebSocket events: battle:challenger_joined, battle:challenger_left.
 */

interface GuestRequest {
  requestId: string;
  userId: string;
  username: string;
  avatar?: string;
}

interface ActiveGuest {
  userId: string;
  username: string;
  avatar?: string;
  isMuted: boolean;
}

interface GuestRequestPanelProps {
  streamId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GuestRequestPanel({ streamId, isOpen, onClose }: GuestRequestPanelProps) {
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [activeGuests, setActiveGuests] = useState<ActiveGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load pending requests
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await liveApi.getGuestRequests(streamId);
        setRequests(data);
      } catch (err) {
        logger.error('Failed to load guest requests:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [streamId, isOpen]);

  // Listen for guest join/leave via WebSocket
  useEffect(() => {
    const unsubJoin = websocketService.on('battle:challenger_joined', (data: {
      streamId: string;
      userId: string;
      username: string;
      avatar?: string;
    }) => {
      if (data.streamId !== streamId) return;
      setActiveGuests((prev) => {
        if (prev.some((g) => g.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, username: data.username, avatar: data.avatar, isMuted: false }];
      });
    });

    const unsubLeave = websocketService.on('battle:challenger_left', (data: {
      streamId: string;
      userId: string;
    }) => {
      if (data.streamId !== streamId) return;
      setActiveGuests((prev) => prev.filter((g) => g.userId !== data.userId));
    });

    return () => {
      unsubJoin();
      unsubLeave();
    };
  }, [streamId]);

  const handleAccept = useCallback(async (requestId: string) => {
    try {
      await liveApi.acceptGuest(streamId, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      logger.error('Failed to accept guest:', err);
    }
  }, [streamId]);

  const handleReject = useCallback(async (requestId: string) => {
    try {
      await liveApi.rejectGuest(streamId, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      logger.error('Failed to reject guest:', err);
    }
  }, [streamId]);

  const handleRemoveGuest = useCallback(async (userId: string) => {
    try {
      await liveApi.removeGuest(streamId, userId);
      setActiveGuests((prev) => prev.filter((g) => g.userId !== userId));
    } catch (err) {
      logger.error('Failed to remove guest:', err);
    }
  }, [streamId]);

  const handleToggleMute = useCallback(async (userId: string, currentMuted: boolean) => {
    try {
      await liveApi.toggleGuestMute(streamId, userId, !currentMuted);
      setActiveGuests((prev) =>
        prev.map((g) => g.userId === userId ? { ...g, isMuted: !currentMuted } : g)
      );
    } catch (err) {
      logger.error('Failed to toggle guest mute:', err);
    }
  }, [streamId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Guest Management</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Close">
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Active guests */}
          {activeGuests.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
                Active Guests ({activeGuests.length})
              </h4>
              <div className="space-y-2">
                {activeGuests.map((guest) => (
                  <div key={guest.userId} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden flex-shrink-0">
                      {guest.avatar ? (
                        <Image src={guest.avatar} alt={guest.username} width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {guest.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-white text-sm font-medium flex-1">{guest.username}</span>
                    <button
                      onClick={() => handleToggleMute(guest.userId, guest.isMuted)}
                      className={`p-1.5 rounded-full transition ${guest.isMuted ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'}`}
                      title={guest.isMuted ? 'Unmute' : 'Mute'}
                    >
                      <MicrophoneIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleRemoveGuest(guest.userId)}
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-full transition"
                      title="Remove"
                    >
                      <XMarkIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending requests */}
          <div className="p-4">
            <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
              Pending Requests ({requests.length})
            </h4>
            {isLoading ? (
              <div className="text-center py-6">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">
                No pending requests
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <div key={req.requestId} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden flex-shrink-0">
                      {req.avatar ? (
                        <Image src={req.avatar} alt={req.username} width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {req.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{req.username}</p>
                      <p className="text-white/40 text-xs">wants to join</p>
                    </div>
                    <button
                      onClick={() => handleReject(req.requestId)}
                      className="p-2 hover:bg-white/10 rounded-full transition text-red-400"
                      aria-label="Reject"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleAccept(req.requestId)}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition"
                      aria-label="Accept"
                    >
                      <UserPlusIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
