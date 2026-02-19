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

    const unsubReaction = websocketService.on('message:reaction', (data: {
      messageId: string; emoji: string; userId: string; username: string; action: 'add' | 'remove';
    }) => {
      setMessages(prev => prev.map(m => {
        if (m.id !== data.messageId) return m;
        const reactions = m.reactions || [];
        if (data.action === 'add') {
          return { ...m, reactions: [...reactions, { emoji: data.emoji, userId: data.userId, username: data.username }] };
        }
        return { ...m, reactions: reactions.filter(r => !(r.emoji === data.emoji && r.userId === data.userId)) };
      }));
    });

    const unsubDelete = websocketService.on('message:deleted', (data: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m.id !== data.messageId));
    });

    return () => { unsubMessage(); unsubTyping(); unsubReaction(); unsubDelete(); };
  }, [token, conversationId, connect, setMessages, setTypingUsers]);
}
