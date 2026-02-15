'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { liveApi } from '@/services/api';
import { useToastStore } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import type { LiveStream, LiveChatMessage, LiveGift, LiveKitCredentials } from '@/types';

interface FloatingReaction {
  id: string;
  type: string;
  x: number;
}

export function useLiveStream(streamId: string, isHost: boolean) {
  const router = useRouter();
  const addToast = useToastStore(s => s.addToast);
  const confirmDialog = useConfirmStore(s => s.show);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Stream data
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [gifts, setGifts] = useState<LiveGift[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  // LiveKit credentials
  const [liveKitCredentials, setLiveKitCredentials] = useState<LiveKitCredentials | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showGuestRequests, setShowGuestRequests] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  // Host controls
  const [guestRequests, setGuestRequests] = useState<Array<{ requestId: string; userId: string; username: string; avatar?: string }>>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Join stream and get LiveKit credentials
  useEffect(() => {
    const joinStream = async () => {
      try {
        // Join the stream (this increments viewer count and returns LiveKit token)
        const joinResponse = await liveApi.joinStream(streamId);
        setStream(joinResponse.stream);
        setViewerCount(joinResponse.stream.viewerCount || 0);
        setLikeCount(joinResponse.stream.likeCount || 0);

        if (joinResponse.liveKit) {
          setLiveKitCredentials(joinResponse.liveKit);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to join stream:', err);
        // Try to just fetch the stream info
        try {
          const data = await liveApi.getLiveStream(streamId);
          setStream(data);
          setViewerCount(data.viewerCount);
          setLikeCount(data.likeCount);
          setLoading(false);
        } catch {
          setError('Stream not found or has ended');
          setLoading(false);
        }
      }
    };

    joinStream();

    // Leave stream on unmount
    return () => {
      liveApi.leaveStream(streamId).catch(() => {});
    };
  }, [streamId]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await liveApi.getChatMessages(streamId);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [streamId]);

  // Fetch gifts
  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const data = await liveApi.getGifts();
        setGifts(data);
      } catch (err) {
        console.error('Failed to fetch gifts:', err);
      }
    };
    fetchGifts();
  }, []);

  // Host: Fetch guest requests
  useEffect(() => {
    if (!isHost) return;
    const fetchRequests = async () => {
      try {
        const requests = await liveApi.getGuestRequests(streamId);
        setGuestRequests(requests);
      } catch (err) {
        console.error('Failed to fetch guest requests:', err);
      }
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [streamId, isHost]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    try {
      const msg = await liveApi.sendChatMessage(streamId, chatMessage.trim());
      setMessages(prev => [...prev, msg]);
      setChatMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [streamId, chatMessage]);

  const handleReaction = useCallback(async (type: 'like' | 'heart' | 'fire' | 'laugh' | 'wow' | 'clap') => {
    try {
      await liveApi.sendReaction(streamId, type);
      const id = Date.now().toString();
      setFloatingReactions(prev => [...prev, { id, type, x: Math.random() * 80 + 10 }]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== id));
      }, 2000);
      setShowReactions(false);
    } catch (err) {
      console.error('Failed to send reaction:', err);
    }
  }, [streamId]);

  const handleSendGift = useCallback(async (giftId: string) => {
    try {
      await liveApi.sendGift(streamId, giftId, 1);
      setShowGifts(false);
    } catch (err) {
      console.error('Failed to send gift:', err);
    }
  }, [streamId]);

  const handleLike = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      handleReaction('heart');
    }
  }, [isLiked, handleReaction]);

  const handleRequestToJoin = useCallback(async () => {
    try {
      await liveApi.requestToJoin(streamId);
      addToast('Join request sent!', 'success');
    } catch (err) {
      console.error('Failed to request to join:', err);
    }
  }, [streamId]);

  const handleAcceptGuest = useCallback(async (requestId: string) => {
    try {
      await liveApi.acceptGuest(streamId, requestId);
      setGuestRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (err) {
      console.error('Failed to accept guest:', err);
    }
  }, [streamId]);

  const handleRejectGuest = useCallback(async (requestId: string) => {
    try {
      await liveApi.rejectGuest(streamId, requestId);
      setGuestRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (err) {
      console.error('Failed to reject guest:', err);
    }
  }, [streamId]);

  const handleEndStream = useCallback(async () => {
    const ok = await confirmDialog({ title: 'End Stream', message: 'Are you sure you want to end the stream?', variant: 'danger', confirmText: 'End Stream' });
    if (!ok) return;
    try {
      await liveApi.endStream(streamId);
      router.push('/live');
    } catch (err) {
      console.error('Failed to end stream:', err);
    }
  }, [streamId, router]);

  return {
    // Refs
    videoRef,
    chatContainerRef,
    // Data
    stream,
    messages,
    gifts,
    viewerCount,
    likeCount,
    loading,
    error,
    // LiveKit
    liveKitCredentials,
    // UI State
    chatMessage,
    setChatMessage,
    showGifts,
    setShowGifts,
    showReactions,
    setShowReactions,
    showGuestRequests,
    setShowGuestRequests,
    floatingReactions,
    isLiked,
    // Host State
    guestRequests,
    audioEnabled,
    setAudioEnabled,
    videoEnabled,
    setVideoEnabled,
    // Actions
    handleSendMessage,
    handleReaction,
    handleSendGift,
    handleLike,
    handleRequestToJoin,
    handleAcceptGuest,
    handleRejectGuest,
    handleEndStream,
  };
}
