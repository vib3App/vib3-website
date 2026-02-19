'use client';

import { useEffect, useCallback } from 'react';
import { websocketService } from '@/services/websocket';
import type { Message, TypingIndicator } from '@/types';

/**
 * Encapsulates WebSocket subscriptions for a conversation view:
 * new messages, typing indicators, reactions, and deletions.
 */
export function useConversationSocket(
  conversationId: string,
  token: string | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>,
) {
  const connect = useCallback(() => {
    if (!token) return;
    websocketService.connect(token);
  }, [token]);

  useEffect(() => {
    connect();

    if (!token) return;

    const unsubMessage = websocketService.onMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
        websocketService.sendRead(conversationId, message.id);
      }
    });

    const unsubTyping = websocketService.onTyping((indicator: TypingIndicator) => {
      if (indicator.conversationId === conversationId) {
        setTypingUsers(prev => {
          if (indicator.isTyping) {
            return prev.includes(indicator.username) ? prev : [...prev, indicator.username];
          }
          return prev.filter(u => u !== indicator.username);
        });
      }
    });

    // GAP-03: Handle both web format (array) and Flutter format (Map<userId,emoji>) for reactions
    const unsubReaction = websocketService.on('message:reaction', (data: {
      messageId: string; emoji?: string; userId?: string; username?: string; action?: 'add' | 'remove';
      // Flutter may send reactions as object map: { [userId]: emoji }
      reactions?: Record<string, string> | Array<{ emoji: string; userId: string; username?: string }>;
    }) => {
      setMessages(prev => prev.map(m => {
        if (m.id !== data.messageId) return m;
        // If full reactions replacement (Flutter format: object map)
        if (data.reactions && !Array.isArray(data.reactions)) {
          const normalized = Object.entries(data.reactions).map(([userId, emoji]) => ({ emoji, userId, username: '' }));
          return { ...m, reactions: normalized };
        }
        // If full reactions replacement (array format)
        if (data.reactions && Array.isArray(data.reactions)) {
          return { ...m, reactions: data.reactions.map(r => ({ emoji: r.emoji, userId: r.userId, username: r.username || '' })) };
        }
        // Incremental add/remove (web format)
        const reactions = m.reactions || [];
        if (data.action === 'add' && data.emoji && data.userId) {
          return { ...m, reactions: [...reactions, { emoji: data.emoji, userId: data.userId, username: data.username || '' }] };
        }
        if (data.action === 'remove' && data.emoji && data.userId) {
          return { ...m, reactions: reactions.filter(r => !(r.emoji === data.emoji && r.userId === data.userId)) };
        }
        return m;
      }));
    });

    const unsubDelete = websocketService.on('message:deleted', (data: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m.id !== data.messageId));
    });

    // GAP-07: Also listen for Flutter-format read receipt events
    const unsubChatRead = websocketService.on('chat:read', (data: { conversationId: string; messageId?: string }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => prev.map(m => ({ ...m, status: 'read' as const })));
      }
    });

    const unsubMessageRead = websocketService.on('message:read', (data: { conversationId: string; messageId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'read' as const } : m));
      }
    });

    return () => { unsubMessage(); unsubTyping(); unsubReaction(); unsubDelete(); unsubChatRead(); unsubMessageRead(); };
  }, [token, conversationId, connect, setMessages, setTypingUsers]);
}
