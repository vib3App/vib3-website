'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { liveApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import type { LiveChatMessage } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Gap #38: Live Chat
 *
 * Real-time chat for live streams via WebSocket.
 * Listens to `chat_message` events on the stream channel.
 * Sends messages via POST /api/live/{streamId}/comment (mapped to sendChatMessage).
 * Shows system messages (user joined, gift sent, etc.).
 * Auto-scroll on new messages.
 */

interface LiveChatProps {
  streamId: string;
  className?: string;
}

export function LiveChat({ streamId, className = '' }: LiveChatProps) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await liveApi.getChatMessages(streamId);
        setMessages(msgs);
      } catch (err) {
        logger.error('Failed to load chat messages:', err);
      }
    };
    loadMessages();
  }, [streamId]);

  // Listen for real-time chat messages via WebSocket
  useEffect(() => {
    const unsubChat = websocketService.on('chat_message', (data: LiveChatMessage & { streamId?: string }) => {
      if (data.streamId === streamId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    // Also listen for join/leave system messages
    const unsubJoin = websocketService.on('viewer_joined', (data: { streamId: string; username: string }) => {
      if (data.streamId === streamId) {
        const sysMsg: LiveChatMessage = {
          id: `join-${Date.now()}`,
          streamId,
          userId: '',
          username: data.username,
          content: 'joined the stream',
          type: 'join',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, sysMsg]);
      }
    });

    const unsubGift = websocketService.on('gift_sent', (data: {
      streamId: string;
      senderName: string;
      giftName: string;
      giftValue: number;
    }) => {
      if (data.streamId === streamId) {
        const giftMsg: LiveChatMessage = {
          id: `gift-${Date.now()}`,
          streamId,
          userId: '',
          username: data.senderName,
          content: `sent ${data.giftName}`,
          type: 'gift',
          giftName: data.giftName,
          giftValue: data.giftValue,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, giftMsg]);
      }
    });

    return () => {
      unsubChat();
      unsubJoin();
      unsubGift();
    };
  }, [streamId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      const msg = await liveApi.sendChatMessage(streamId, text);
      setMessages((prev) => [...prev, msg]);
      setInputValue('');
    } catch (err) {
      logger.error('Failed to send chat message:', err);
    } finally {
      setIsSending(false);
    }
  }, [streamId, inputValue, isSending]);

  return (
    <div className={`flex flex-col bg-gray-900/50 border-l border-white/10 ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Live Chat</h3>
        <span className="text-white/40 text-xs">{messages.length}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Say something..."
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-full text-sm focus:outline-none focus:border-pink-500 text-white placeholder-white/30"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="p-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatMessageItem({ message }: { message: LiveChatMessage }) {
  if (message.type === 'join') {
    return (
      <div className="text-white/40 text-xs py-0.5">
        <span className="font-medium text-white/60">{message.username}</span> joined
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="text-white/40 text-xs italic py-0.5">{message.content}</div>
    );
  }

  if (message.type === 'gift') {
    return (
      <div className="flex items-center gap-2 py-0.5 px-2 bg-yellow-500/10 rounded-lg">
        <span className="text-yellow-400 text-xs font-medium">
          {message.username} sent {message.giftName}
        </span>
        {message.giftValue && (
          <span className="text-yellow-500/60 text-[10px]">({message.giftValue} coins)</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex-shrink-0 overflow-hidden">
        {message.avatar ? (
          <Image src={message.avatar} alt={message.username} width={24} height={24} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
            {message.username[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <span className="text-pink-400 text-xs font-medium mr-1">{message.username}</span>
        <span className="text-white/80 text-xs break-words">{message.content}</span>
      </div>
    </div>
  );
}
