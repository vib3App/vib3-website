'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { messagesApi } from '@/services/api';
import type { Conversation, Message } from '@/types';
import { logger } from '@/utils/logger';

interface ForwardModalProps {
  message: Message;
  onClose: () => void;
  onForwarded: () => void;
}

export function ForwardModal({ message, onClose, onForwarded }: ForwardModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await messagesApi.getConversations(1, 50);
        setConversations(data.items);
      } catch (err) {
        logger.error('Failed to load conversations:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = search.trim()
    ? conversations.filter(c => {
        const name = c.name || c.participants[0]?.username || '';
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : conversations;

  const handleForward = useCallback(async (conversationId: string) => {
    setSendingTo(conversationId);
    try {
      const fwdPrefix = `Forwarded from @${message.senderUsername}:\n`;
      if (message.type === 'text' || message.type === 'sticker') {
        await messagesApi.sendMessage(conversationId, {
          content: fwdPrefix + message.content,
          type: 'text',
        });
      } else if (message.type === 'gif' && message.mediaUrl) {
        await messagesApi.sendMessage(conversationId, {
          content: 'GIF',
          type: 'gif',
          mediaUrl: message.mediaUrl,
        });
      } else if (message.type === 'location' && message.location) {
        await messagesApi.sendMessage(conversationId, {
          content: message.content || 'Shared Location',
          type: 'location',
          location: message.location,
        });
      } else {
        // For media messages (image/video/voice), forward the media URL as text
        await messagesApi.sendMessage(conversationId, {
          content: fwdPrefix + (message.mediaUrl || message.content),
          type: 'text',
        });
      }
      onForwarded();
    } catch (err) {
      logger.error('Failed to forward message:', err);
    } finally {
      setSendingTo(null);
    }
  }, [message, onForwarded]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md mx-4 glass-heavy rounded-2xl border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-white font-semibold">Forward Message</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white/5 text-white rounded-xl px-4 py-2 text-sm outline-none placeholder:text-white/30 focus:bg-white/10 transition-colors"
            autoFocus
          />
        </div>

        {/* Message preview */}
        <div className="mx-4 mb-2 px-3 py-2 bg-white/5 rounded-lg">
          <p className="text-white/40 text-xs">Message:</p>
          <p className="text-white/70 text-sm truncate">
            {message.type === 'text' ? message.content : `[${message.type}]`}
          </p>
        </div>

        {/* Conversation list */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No conversations found</p>
          ) : (
            filtered.map(conv => {
              const p = conv.participants[0];
              const name = conv.name || p?.username || 'Unknown';
              const avatar = conv.avatar || p?.avatar;
              const isSending = sendingTo === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleForward(conv.id)}
                  disabled={!!sendingTo}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden glass flex-shrink-0">
                    {avatar ? (
                      <Image src={avatar} alt={name} width={40} height={40} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-medium">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-sm font-medium flex-1 text-left truncate">{name}</span>
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
