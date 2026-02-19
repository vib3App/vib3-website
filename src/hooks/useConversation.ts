'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { messagesApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import type { Message } from '@/types';
import { logger } from '@/utils/logger';
import { useConversationSocket } from './useConversationSocket';

export function useConversation() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { user, isAuthenticated, isAuthVerified } = useAuthStore();

  const [conversation, setConversation] = useState<import('@/types').Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

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
    if (!isAuthVerified) return;
    if (!isAuthenticated) { router.push('/login?redirect=/messages'); return; }
    loadMessages();
  }, [isAuthVerified, isAuthenticated, router, loadMessages]);

  // WebSocket subscriptions (extracted hook)
  useConversationSocket(conversationId, user?.token, setMessages, setTypingUsers);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleTyping = useCallback(() => {
    websocketService.sendTyping(conversationId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTyping(conversationId, false);
    }, 2000);
  }, [conversationId]);

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId);
    const existing = message?.reactions?.find(r => r.emoji === emoji && r.userId === user?.id);
    try {
      if (existing) {
        await messagesApi.removeReaction(conversationId, messageId, emoji);
        setMessages(prev => prev.map(m => m.id !== messageId ? m
          : { ...m, reactions: (m.reactions || []).filter(r => !(r.emoji === emoji && r.userId === user?.id)) }));
      } else {
        await messagesApi.addReaction(conversationId, messageId, emoji);
        setMessages(prev => prev.map(m => m.id !== messageId ? m
          : { ...m, reactions: [...(m.reactions || []), { emoji, userId: user?.id || '', username: user?.username || '' }] }));
      }
      websocketService.send('message:reaction', { conversationId, messageId, emoji, action: existing ? 'remove' : 'add' });
    } catch (error) { logger.error('Failed to toggle reaction:', error); }
  }, [conversationId, messages, user]);

  const handleReply = useCallback((message: Message) => { setReplyingTo(message); inputRef.current?.focus(); }, []);
  const cancelReply = useCallback(() => { setReplyingTo(null); }, []);

  const handleDelete = useCallback(async (messageId: string) => {
    try {
      await messagesApi.deleteMessage(conversationId, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      websocketService.send('message:delete', { conversationId, messageId });
    } catch (error) { logger.error('Failed to delete message:', error); }
  }, [conversationId]);

  const handleDeleteForMe = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji); setShowEmojiPicker(false); inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;
    const content = newMessage.trim();
    setNewMessage(''); setIsSending(true);
    const opt: Message = {
      id: `temp-${Date.now()}`, conversationId, senderId: user?.id || '',
      senderUsername: user?.username || '', senderAvatar: user?.profilePicture, content, type: 'text',
      replyTo: replyingTo ? { id: replyingTo.id, content: replyingTo.content, senderUsername: replyingTo.senderUsername } : undefined,
      createdAt: new Date().toISOString(), status: 'sending',
    };
    setMessages(prev => [...prev, opt]); setReplyingTo(null);
    try {
      const sent = await messagesApi.sendMessage(conversationId, { content, type: 'text', replyToId: replyingTo?.id });
      setMessages(prev => prev.map(m => m.id === opt.id ? sent : m));
      websocketService.sendTyping(conversationId, false);
    } catch (error) {
      logger.error('Failed to send message:', error);
      setMessages(prev => prev.map(m => m.id === opt.id ? { ...m, status: 'failed' as const } : m));
    } finally { setIsSending(false); }
  }, [newMessage, isSending, conversationId, user, replyingTo]);

  const sendOptimistic = useCallback(async (partial: Partial<Message>, sendFn: () => Promise<Message>) => {
    setIsSending(true);
    const opt: Message = {
      id: `temp-${Date.now()}`, conversationId, senderId: user?.id || '',
      senderUsername: user?.username || '', senderAvatar: user?.profilePicture,
      content: '', type: 'text', createdAt: new Date().toISOString(), status: 'sending', ...partial,
    };
    setMessages(prev => [...prev, opt]);
    try { const sent = await sendFn(); setMessages(prev => prev.map(m => m.id === opt.id ? sent : m)); }
    catch (error) { logger.error('Failed to send:', error); setMessages(prev => prev.map(m => m.id === opt.id ? { ...m, status: 'failed' as const } : m)); }
    finally { setIsSending(false); }
  }, [conversationId, user]);

  const handleSendVoice = useCallback(async (blob: Blob, duration: number) => {
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
    await sendOptimistic({ content: 'Voice message', type: 'voice', mediaDuration: duration },
      () => messagesApi.sendMediaMessage(conversationId, file, 'voice'));
  }, [conversationId, sendOptimistic]);

  const handleSendMedia = useCallback(async (file: File, type: 'image' | 'video') => {
    await sendOptimistic({ content: type === 'video' ? 'Video message' : 'Image', type },
      () => messagesApi.sendMediaMessage(conversationId, file, type));
  }, [conversationId, sendOptimistic]);

  const handleSendLocation = useCallback(async (lat: number, lng: number, address?: string) => {
    await sendOptimistic({ content: address || 'Shared Location', type: 'location', location: { lat, lng, address } },
      () => messagesApi.sendMessage(conversationId, { content: address || 'Shared Location', type: 'location', location: { lat, lng, address } }));
  }, [conversationId, sendOptimistic]);

  const handleSendGif = useCallback(async (gifUrl: string) => {
    const isSticker = gifUrl.length <= 4 && /\p{Emoji}/u.test(gifUrl);
    if (isSticker) {
      await sendOptimistic({ content: gifUrl, type: 'sticker' },
        () => messagesApi.sendMessage(conversationId, { content: gifUrl, type: 'sticker' }));
    } else {
      await sendOptimistic({ content: 'GIF', type: 'gif', mediaUrl: gifUrl },
        () => messagesApi.sendMessage(conversationId, { content: 'GIF', type: 'gif', mediaUrl: gifUrl }));
    }
  }, [conversationId, sendOptimistic]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const participant = conversation?.participants[0];

  return {
    conversation, messages, newMessage, setNewMessage, isLoading, isSending,
    typingUsers, showEmojiPicker, setShowEmojiPicker, replyingTo,
    messagesEndRef, inputRef, participant, user, isAuthenticated,
    handleTyping, handleSend, handleKeyDown, handleReaction, handleReply,
    cancelReply, handleDelete, handleEmojiSelect, handleSendMedia,
    handleSendLocation, handleSendVoice, handleSendGif, handleDeleteForMe,
    goBack: () => router.push('/messages'),
  };
}
