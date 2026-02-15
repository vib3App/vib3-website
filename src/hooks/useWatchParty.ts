'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collaborationApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { WatchParty, WatchPartyChatMessage } from '@/types/collaboration';
import { logger } from '@/utils/logger';
import { useWatchPartyVideo } from './useWatchPartyVideo';
import { useWatchPartyActions } from './useWatchPartyActions';

export function useWatchParty(partyId: string) {
  const { user, isAuthVerified } = useAuthStore();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  // Party data
  const [party, setParty] = useState<WatchParty | null>(null);
  const [messages, setMessages] = useState<WatchPartyChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isHost = party?.hostId === user?.id;

  // Video playback management (HLS, sync)
  const { videoRef, loadedVideoIdRef } = useWatchPartyVideo(party);

  // All actions (chat, playlist, party lifecycle)
  const actions = useWatchPartyActions({
    partyId,
    isHost,
    loadedVideoIdRef,
    inviteCode: party?.inviteCode,
  });

  // Fetch party data
  useEffect(() => {
    if (!isAuthVerified) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let isMounted = true;
    let interval: NodeJS.Timeout | null = null;

    const fetchParty = async () => {
      try {
        const data = await collaborationApi.getWatchParty(partyId);
        if (!isMounted) return;
        if (data) {
          setParty(data);
          setLoading(false);
        } else {
          setError('Watch party not found');
          setLoading(false);
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        if (!isMounted) return;
        logger.error('Failed to fetch party:', err);
        setError('Watch party not found');
        setLoading(false);
        if (interval) clearInterval(interval);
      }
    };

    fetchParty();
    interval = setInterval(fetchParty, 2000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [partyId, isAuthVerified]);

  // Fetch chat messages - only after we have a party
  useEffect(() => {
    if (!party) return;
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const msgs = await collaborationApi.getWatchPartyChat(partyId);
        if (isMounted) setMessages(msgs);
      } catch {
        // Silently fail - chat is not critical
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [partyId, party]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Wrap handleSendMessage and handlePlayPause to inject local state
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    return actions.handleSendMessage(e, setMessages);
  }, [actions]);

  const handlePlayPause = useCallback(async () => {
    if (!party) return;
    return actions.handlePlayPause(party.status);
  }, [party, actions]);

  return {
    // Refs
    videoRef,
    chatContainerRef,
    // Data
    party,
    messages,
    loading,
    error,
    isHost,
    // UI State
    chatMessage: actions.chatMessage,
    setChatMessage: actions.setChatMessage,
    showPlaylist: actions.showPlaylist,
    setShowPlaylist: actions.setShowPlaylist,
    showParticipants: actions.showParticipants,
    setShowParticipants: actions.setShowParticipants,
    showShareModal: actions.showShareModal,
    setShowShareModal: actions.setShowShareModal,
    showAddVideoModal: actions.showAddVideoModal,
    setShowAddVideoModal: actions.setShowAddVideoModal,
    copied: actions.copied,
    // Search
    searchQuery: actions.searchQuery,
    setSearchQuery: actions.setSearchQuery,
    searchResults: actions.searchResults,
    searching: actions.searching,
    // Actions
    handleSendMessage,
    handlePlayPause,
    handleSkipNext: actions.handleSkipNext,
    handleSkipToVideo: actions.handleSkipToVideo,
    handleRemoveFromPlaylist: actions.handleRemoveFromPlaylist,
    handleAddVideo: actions.handleAddVideo,
    handleSearch: actions.handleSearch,
    handleLeave: actions.handleLeave,
    handleEndParty: actions.handleEndParty,
    copyShareLink: actions.copyShareLink,
    copyInviteCode: actions.copyInviteCode,
  };
}
