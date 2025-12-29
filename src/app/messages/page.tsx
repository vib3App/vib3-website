'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { messagesApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import type { Conversation, Message } from '@/types';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  // Get the other participant for direct messages
  const participant = conversation.participants[0];
  const displayName = conversation.type === 'group'
    ? conversation.name
    : participant?.username;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
    >
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden glass">
          {(conversation.avatar || participant?.avatar) ? (
            <Image
              src={conversation.avatar || participant?.avatar || ''}
              alt={displayName || ''}
              width={56}
              height={56}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-xl font-medium">
              {displayName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        {participant?.isOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-transparent" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`font-medium ${conversation.unreadCount > 0 ? 'text-white' : 'text-white/70'}`}>
            {displayName}
          </span>
          <span className="text-white/50 text-xs">
            {conversation.lastMessage && timeAgo(conversation.lastMessage.createdAt)}
          </span>
        </div>
        <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-white/70' : 'text-white/50'}`}>
          {conversation.lastMessage?.content || 'No messages yet'}
        </p>
      </div>

      {conversation.unreadCount > 0 && (
        <div className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">{conversation.unreadCount}</span>
        </div>
      )}
    </Link>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const response = await messagesApi.getConversations();
      setConversations(response.items);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/messages');
      return;
    }

    loadConversations();

    // Connect to WebSocket
    if (user?.token) {
      websocketService.connect(user.token);

      const unsubConnection = websocketService.onConnectionChange((connected) => {
        setIsConnected(connected);
      });

      const unsubMessage = websocketService.onMessage((message: Message) => {
        // Update conversation with new message
        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.id === message.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + 1,
                updatedAt: message.createdAt,
              };
            }
            return conv;
          });
          // Sort by most recent
          return updated.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
      });

      const unsubPresence = websocketService.onPresence((userId, isOnline) => {
        setConversations(prev => prev.map(conv => ({
          ...conv,
          participants: conv.participants.map(p =>
            p.userId === userId ? { ...p, isOnline } : p
          ),
        })));
      });

      return () => {
        unsubConnection();
        unsubMessage();
        unsubPresence();
      };
    }
  }, [isAuthenticated, user?.token, router, loadConversations]);

  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.participants.some(p =>
          p.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : conversations;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative">
      <AuroraBackground intensity={20} />
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Messages</h1>
              {isConnected && (
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
              )}
            </div>
            <button
              onClick={() => router.push('/messages/new')}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full glass text-white px-10 py-2.5 rounded-full outline-none placeholder:text-white/30 focus:ring-2 focus:ring-purple-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Conversations List */}
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-white/50">No messages yet</p>
              <p className="text-white/30 text-sm mt-1">
                Start a conversation with someone you follow
              </p>
              <button
                onClick={() => router.push('/messages/new')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-full hover:from-purple-600 hover:to-teal-600 transition-colors"
              >
                New Message
              </button>
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
