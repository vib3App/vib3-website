'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collaborationApi, feedApi } from '@/services/api';
import { useConfirmStore } from '@/stores/confirmStore';
import type { WatchPartyChatMessage } from '@/types/collaboration';
import { logger } from '@/utils/logger';

interface UseWatchPartyActionsOptions {
  partyId: string;
  isHost: boolean;
  loadedVideoIdRef: React.MutableRefObject<string | null>;
  inviteCode?: string;
}

/**
 * Chat, playlist, and party lifecycle actions for a watch party.
 */
export function useWatchPartyActions({
  partyId,
  isHost,
  loadedVideoIdRef,
  inviteCode,
}: UseWatchPartyActionsOptions) {
  const router = useRouter();
  const confirmDialog = useConfirmStore(s => s.show);

  // UI state
  const [chatMessage, setChatMessage] = useState('');
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add video modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; thumbnail?: string }>>([]);
  const [searching, setSearching] = useState(false);

  const handleSendMessage = useCallback(async (
    e: React.FormEvent,
    setMessages: React.Dispatch<React.SetStateAction<WatchPartyChatMessage[]>>,
  ) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    try {
      const msg = await collaborationApi.sendChatMessage(partyId, chatMessage.trim());
      setMessages(prev => [...prev, msg]);
      setChatMessage('');
    } catch (err) {
      logger.error('Failed to send message:', err);
    }
  }, [partyId, chatMessage]);

  const handlePlayPause = useCallback(async (partyStatus: string) => {
    if (!isHost) return;
    try {
      await collaborationApi.setPlaybackState(partyId, partyStatus !== 'playing');
    } catch (err) {
      logger.error('Failed to set playback state:', err);
    }
  }, [isHost, partyId]);

  const handleSkipNext = useCallback(async () => {
    if (!isHost) return;
    loadedVideoIdRef.current = null;
    try {
      await collaborationApi.skipToNext(partyId);
    } catch (err) {
      logger.error('Failed to skip:', err);
    }
  }, [isHost, partyId, loadedVideoIdRef]);

  const handleSkipToVideo = useCallback(async (index: number) => {
    if (!isHost) return;
    loadedVideoIdRef.current = null;
    try {
      await collaborationApi.skipToVideo(partyId, index);
    } catch (err) {
      logger.error('Failed to skip:', err);
    }
  }, [isHost, partyId, loadedVideoIdRef]);

  const handleRemoveFromPlaylist = useCallback(async (videoId: string) => {
    if (!isHost) return;
    try {
      await collaborationApi.removeFromPlaylist(partyId, videoId);
    } catch (err) {
      logger.error('Failed to remove:', err);
    }
  }, [isHost, partyId]);

  const handleAddVideo = useCallback(async (videoId: string) => {
    try {
      await collaborationApi.addToPlaylist(partyId, videoId);
      setShowAddVideoModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      logger.error('Failed to add video:', err);
    }
  }, [partyId]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await feedApi.searchVideos(searchQuery.trim());
      setSearchResults(
        response.items.map(v => ({
          id: v.id,
          title: v.caption || v.title || 'Untitled',
          thumbnail: v.thumbnailUrl,
        }))
      );
    } catch (err) {
      logger.error('Failed to search:', err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleLeave = useCallback(async () => {
    const ok = await confirmDialog({ title: 'Leave Party', message: 'Are you sure you want to leave?' });
    if (!ok) return;
    try {
      await collaborationApi.leaveWatchParty(partyId);
      router.push('/watch-party');
    } catch (err) {
      logger.error('Failed to leave:', err);
    }
  }, [partyId, router, confirmDialog]);

  const handleEndParty = useCallback(async () => {
    const ok = await confirmDialog({ title: 'End Party', message: 'Are you sure you want to end the party?', variant: 'danger', confirmText: 'End Party' });
    if (!ok) return;
    try {
      await collaborationApi.endWatchParty(partyId);
      router.push('/watch-party');
    } catch (err) {
      logger.error('Failed to end party:', err);
    }
  }, [partyId, router, confirmDialog]);

  const copyShareLink = useCallback(() => {
    const url = `${window.location.origin}/watch-party/${partyId}`;
    navigator.clipboard.writeText(inviteCode ? `${url}?code=${inviteCode}` : url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [partyId, inviteCode]);

  const copyInviteCode = useCallback(() => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [inviteCode]);

  return {
    chatMessage, setChatMessage,
    showPlaylist, setShowPlaylist,
    showParticipants, setShowParticipants,
    showShareModal, setShowShareModal,
    showAddVideoModal, setShowAddVideoModal,
    copied,
    searchQuery, setSearchQuery, searchResults, searching,
    handleSendMessage,
    handlePlayPause,
    handleSkipNext,
    handleSkipToVideo,
    handleRemoveFromPlaylist,
    handleAddVideo,
    handleSearch,
    handleLeave,
    handleEndParty,
    copyShareLink,
    copyInviteCode,
  };
}
