'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import { collaborationApi } from '@/services/api';
import type { WatchParty, WatchPartyChatMessage } from '@/types/collaboration';

export function useWatchParty(partyId: string) {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Party data
  const [party, setParty] = useState<WatchParty | null>(null);
  const [messages, setMessages] = useState<WatchPartyChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const isHost = party?.hostId === 'current-user-id';

  // Fetch party data
  useEffect(() => {
    const fetchParty = async () => {
      try {
        const data = await collaborationApi.getWatchParty(partyId);
        setParty(data);
      } catch (err) {
        console.error('Failed to fetch party:', err);
        setError('Watch party not found');
      } finally {
        setLoading(false);
      }
    };

    fetchParty();
    const interval = setInterval(fetchParty, 2000);
    return () => clearInterval(interval);
  }, [partyId]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await collaborationApi.getWatchPartyChat(partyId);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [partyId]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Sync video position
  useEffect(() => {
    if (!party || !videoRef.current) return;

    if (party.status === 'playing') {
      videoRef.current.play();
    } else if (party.status === 'paused') {
      videoRef.current.pause();
    }

    const currentTime = videoRef.current.currentTime;
    if (Math.abs(currentTime - party.currentPosition) > 2) {
      videoRef.current.currentTime = party.currentPosition;
    }
  }, [party?.status, party?.currentPosition]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const msg = await collaborationApi.sendChatMessage(partyId, chatMessage.trim());
      setMessages(prev => [...prev, msg]);
      setChatMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [partyId, chatMessage]);

  const handlePlayPause = useCallback(async () => {
    if (!party || !isHost) return;
    try {
      await collaborationApi.setPlaybackState(partyId, party.status !== 'playing');
    } catch (err) {
      console.error('Failed to set playback state:', err);
    }
  }, [party, isHost, partyId]);

  const handleSkipNext = useCallback(async () => {
    if (!isHost) return;
    try {
      await collaborationApi.skipToNext(partyId);
    } catch (err) {
      console.error('Failed to skip:', err);
    }
  }, [isHost, partyId]);

  const handleSkipToVideo = useCallback(async (index: number) => {
    if (!isHost) return;
    try {
      await collaborationApi.skipToVideo(partyId, index);
    } catch (err) {
      console.error('Failed to skip:', err);
    }
  }, [isHost, partyId]);

  const handleRemoveFromPlaylist = useCallback(async (videoId: string) => {
    if (!isHost) return;
    try {
      await collaborationApi.removeFromPlaylist(partyId, videoId);
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  }, [isHost, partyId]);

  const handleAddVideo = useCallback(async (videoId: string) => {
    try {
      await collaborationApi.addToPlaylist(partyId, videoId);
      setShowAddVideoModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Failed to add video:', err);
    }
  }, [partyId]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      setSearchResults([
        { id: '1', title: 'Sample Video 1', thumbnail: undefined },
        { id: '2', title: 'Sample Video 2', thumbnail: undefined },
      ]);
    } catch (err) {
      console.error('Failed to search:', err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleLeave = useCallback(async () => {
    if (!confirm('Are you sure you want to leave?')) return;
    try {
      await collaborationApi.leaveWatchParty(partyId);
      router.push('/watch-party');
    } catch (err) {
      console.error('Failed to leave:', err);
    }
  }, [partyId, router]);

  const handleEndParty = useCallback(async () => {
    if (!confirm('Are you sure you want to end the party?')) return;
    try {
      await collaborationApi.endWatchParty(partyId);
      router.push('/watch-party');
    } catch (err) {
      console.error('Failed to end party:', err);
    }
  }, [partyId, router]);

  const copyShareLink = useCallback(() => {
    const url = `${window.location.origin}/watch-party/${partyId}`;
    navigator.clipboard.writeText(party?.inviteCode ? `${url}?code=${party.inviteCode}` : url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [partyId, party?.inviteCode]);

  const copyInviteCode = useCallback(() => {
    if (party?.inviteCode) {
      navigator.clipboard.writeText(party.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [party?.inviteCode]);

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
    chatMessage,
    setChatMessage,
    showPlaylist,
    setShowPlaylist,
    showParticipants,
    setShowParticipants,
    showShareModal,
    setShowShareModal,
    showAddVideoModal,
    setShowAddVideoModal,
    copied,
    // Search
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    // Actions
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
