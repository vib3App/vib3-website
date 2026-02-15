'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { messagesApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import type { Message, Conversation, TypingIndicator } from '@/types';
import { logger } from '@/utils/logger';

export function useConversation() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { user, isAuthenticated, isAuthVerified } = useAuthStore();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const [convData, messagesData] = await Promise.all([
        messagesApi.getConversation(conversationId),
        messagesApi.getMessages(conversationId),
      ]);
      setConversation(convData);
      setMessages(messagesData.items.reverse());
      await messagesApi.markAsRead(conversationId);
    } catch (error) {
      logger.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    // Wait for auth to be verified before checking authentication
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/messages');
      return;
    }

    loadMessages();

    if (user?.token) {
      websocketService.connect(user.token);

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

      return () => { unsubMessage(); unsubTyping(); };
    }
  }, [isAuthVerified, isAuthenticated, user?.token, conversationId, router, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleTyping = useCallback(() => {
    websocketService.sendTyping(conversationId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTyping(conversationId, false);
    }, 2000);
  }, [conversationId]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user?.id || '',
      senderUsername: user?.username || '',
      senderAvatar: user?.profilePicture,
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const sent = await messagesApi.sendMessage(conversationId, { content, type: 'text' });
      setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? sent : m));
      websocketService.sendTyping(conversationId, false);
    } catch (error) {
      logger.error('Failed to send message:', error);
      setMessages(prev => prev.map(m =>
        m.id === optimisticMessage.id ? { ...m, status: 'failed' as const } : m
      ));
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, conversationId, user]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const participant = conversation?.participants[0];

  return {
    conversation,
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isSending,
    typingUsers,
    showEmojiPicker,
    setShowEmojiPicker,
    messagesEndRef,
    inputRef,
    participant,
    user,
    isAuthenticated,
    handleTyping,
    handleSend,
    handleKeyDown,
    goBack: () => router.push('/messages'),
  };
}
