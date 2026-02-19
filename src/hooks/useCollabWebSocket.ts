'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';

interface CollabParticipantState {
  userId: string;
  username: string;
  isMuted: boolean;
  isCameraOn: boolean;
  isReady: boolean;
}

interface CollabChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

interface CollabReaction {
  id: string;
  userId: string;
  username: string;
  emoji: string;
  timestamp: number;
}

/**
 * Gap #82: Collab Rooms Real-Time WebSocket
 * Wires WebSocket events for real-time collaboration features:
 * participant join/leave, audio/video state, chat, and reactions.
 */
export function useCollabWebSocket(roomId: string) {
  const { user } = useAuthStore();
  const [participants, setParticipants] = useState<CollabParticipantState[]>([]);
  const [chatMessages, setChatMessages] = useState<CollabChatMessage[]>([]);
  const [reactions, setReactions] = useState<CollabReaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const joinedRef = useRef(false);

  // Connect to collab room WebSocket channel
  useEffect(() => {
    if (!roomId || !user?.token) return;

    websocketService.connect(user.token);
    websocketService.joinCollabRoom(roomId);
    joinedRef.current = true;

    const unsubConnection = websocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (connected && joinedRef.current) {
        websocketService.joinCollabRoom(roomId);
      }
    });

    const unsubJoin = websocketService.onCollabJoin((data: {
      userId: string; username: string;
    }) => {
      setParticipants(prev => {
        if (prev.find(p => p.userId === data.userId)) return prev;
        return [...prev, {
          userId: data.userId,
          username: data.username,
          isMuted: false,
          isCameraOn: true,
          isReady: false,
        }];
      });
    });

    const unsubLeave = websocketService.onCollabLeave((data: { userId: string }) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    });

    const unsubState = websocketService.onCollabState((data: {
      userId: string; isMuted?: boolean; isCameraOn?: boolean; isReady?: boolean;
    }) => {
      setParticipants(prev => prev.map(p => {
        if (p.userId !== data.userId) return p;
        return {
          ...p,
          ...(data.isMuted !== undefined && { isMuted: data.isMuted }),
          ...(data.isCameraOn !== undefined && { isCameraOn: data.isCameraOn }),
          ...(data.isReady !== undefined && { isReady: data.isReady }),
        };
      }));
    });

    const unsubChat = websocketService.onCollabChat((data: {
      userId: string; username: string; message: string;
    }) => {
      setChatMessages(prev => [...prev, {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        userId: data.userId,
        username: data.username,
        message: data.message,
        timestamp: Date.now(),
      }]);
    });

    const unsubReaction = websocketService.onCollabReaction((data: {
      userId: string; username: string; emoji: string;
    }) => {
      const reaction: CollabReaction = {
        id: `reaction-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        userId: data.userId,
        username: data.username,
        emoji: data.emoji,
        timestamp: Date.now(),
      };
      setReactions(prev => [...prev, reaction]);

      // Auto-remove reactions after 3 seconds
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    setIsConnected(websocketService.isConnected());

    return () => {
      unsubConnection();
      unsubJoin();
      unsubLeave();
      unsubState();
      unsubChat();
      unsubReaction();
      websocketService.leaveCollabRoom(roomId);
      joinedRef.current = false;
    };
  }, [roomId, user?.token]);

  /** Send a chat message */
  const sendChat = useCallback((message: string) => {
    if (!message.trim()) return;
    websocketService.sendCollabChat(roomId, message.trim());
  }, [roomId]);

  /** Send a reaction */
  const sendReaction = useCallback((emoji: string) => {
    websocketService.sendCollabReaction(roomId, emoji);
  }, [roomId]);

  /** Toggle mute and broadcast state */
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    websocketService.updateCollabState(roomId, { isMuted: newMuted });
  }, [roomId, isMuted]);

  /** Toggle camera and broadcast state */
  const toggleCamera = useCallback(() => {
    const newCameraOn = !isCameraOn;
    setIsCameraOn(newCameraOn);
    websocketService.updateCollabState(roomId, { isCameraOn: newCameraOn });
  }, [roomId, isCameraOn]);

  return {
    participants,
    chatMessages,
    reactions,
    isConnected,
    isMuted,
    isCameraOn,
    sendChat,
    sendReaction,
    toggleMute,
    toggleCamera,
  };
}
