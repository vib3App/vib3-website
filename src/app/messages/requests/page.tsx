'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { messagesApi } from '@/services/api';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import type { Conversation } from '@/types';
import { logger } from '@/utils/logger';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function RequestCard({
  request,
  onAccept,
  onDecline,
  isProcessing,
}: {
  request: Conversation;
  onAccept: () => void;
  onDecline: () => void;
  isProcessing: boolean;
}) {
  // Get the other participant (not current user)
  const otherParticipant = request.participants[0];

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start gap-4">
        <Link href={`/profile/${otherParticipant?.userId}`} className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            {otherParticipant?.avatar ? (
              <Image
                src={otherParticipant.avatar}
                alt={otherParticipant.username || 'User'}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                {(otherParticipant?.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/profile/${otherParticipant?.userId}`} className="font-medium text-white hover:underline truncate">
              {otherParticipant?.username || 'Unknown User'}
            </Link>
            <span className="text-white/50 text-xs">
              {request.updatedAt && formatTimeAgo(request.updatedAt)}
            </span>
          </div>
          <p className="text-white/50 text-sm">@{otherParticipant?.username}</p>

          {request.lastMessage && (
            <p className="text-white/70 text-sm mt-2 line-clamp-2">
              {request.lastMessage.content}
            </p>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onDecline}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 glass text-white rounded-full text-sm font-medium hover:bg-white/10 transition disabled:opacity-50"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [requests, setRequests] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadRequests = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await messagesApi.getMessageRequests(pageNum, 20);

      if (append) {
        setRequests(prev => [...prev, ...response.items]);
      } else {
        setRequests(response.items);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      logger.error('Failed to load message requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/messages/requests');
      return;
    }

    loadRequests(1);
  }, [isAuthenticated, isAuthVerified, router, loadRequests]);

  const handleAccept = async (conversationId: string) => {
    setProcessingId(conversationId);
    try {
      await messagesApi.acceptRequest(conversationId);
      setRequests(prev => prev.filter(r => r.id !== conversationId));
      // Optionally navigate to the conversation
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      logger.error('Failed to accept request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (conversationId: string) => {
    setProcessingId(conversationId);
    try {
      await messagesApi.declineRequest(conversationId);
      setRequests(prev => prev.filter(r => r.id !== conversationId));
    } catch (error) {
      logger.error('Failed to decline request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center gap-4 px-4 h-14">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">Message Requests</h1>
              <p className="text-white/50 text-xs">{requests.length} pending</p>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          {/* Info banner */}
          <div className="glass-card rounded-xl p-4 mb-6">
            <p className="text-white/70 text-sm">
              These are messages from people you don&apos;t follow. Accept a request to start a conversation, or decline to delete it.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                      <div className="h-3 bg-white/10 rounded w-24 mb-4" />
                      <div className="flex gap-3">
                        <div className="flex-1 h-10 bg-white/10 rounded-full" />
                        <div className="flex-1 h-10 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-xl font-semibold text-white mb-2">No Message Requests</h2>
              <p className="text-white/50 max-w-md mx-auto">
                When someone you don&apos;t follow sends you a message, it will appear here.
              </p>
              <Link href="/messages" className="inline-block mt-6 px-6 py-3 glass text-white rounded-full hover:bg-white/10 transition">
                Back to Messages
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => handleAccept(request.id)}
                    onDecline={() => handleDecline(request.id)}
                    isProcessing={processingId === request.id}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => loadRequests(page + 1, true)}
                    className="px-6 py-3 glass text-white rounded-full hover:bg-white/10 transition"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
