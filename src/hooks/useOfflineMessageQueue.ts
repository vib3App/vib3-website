'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { messagesApi } from '@/services/api';
import { logger } from '@/utils/logger';

import type { Message } from '@/types';

interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  type: Message['type'];
  replyToId?: string;
  queuedAt: number;
  retryCount: number;
  status: 'queued' | 'sending' | 'failed';
}

const STORAGE_KEY = 'vib3-offline-message-queue';
const MAX_RETRIES = 3;

function loadQueue(): QueuedMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Gap #78: Offline Message Queuing
 * When sending a message fails due to network error, stores it in
 * localStorage and retries when connectivity is restored.
 */
export function useOfflineMessageQueue() {
  const [queue, setQueue] = useState<QueuedMessage[]>(() => loadQueue());
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const processingRef = useRef(false);

  // Persist queue changes
  useEffect(() => {
    saveQueue(queue);
  }, [queue]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Add a failed message to the queue */
  const enqueue = useCallback((
    conversationId: string,
    content: string,
    type: Message['type'] = 'text',
    replyToId?: string,
  ) => {
    const msg: QueuedMessage = {
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      conversationId,
      content,
      type,
      replyToId,
      queuedAt: Date.now(),
      retryCount: 0,
      status: 'queued',
    };
    setQueue(prev => [...prev, msg]);
    return msg.id;
  }, []);

  /** Process all queued messages */
  const processQueue = useCallback(async () => {
    if (processingRef.current || !navigator.onLine) return;
    processingRef.current = true;

    const pending = loadQueue().filter(m => m.status !== 'sending');
    if (pending.length === 0) {
      processingRef.current = false;
      return;
    }

    logger.info(`[OfflineQueue] Processing ${pending.length} queued message(s)`);

    const results: QueuedMessage[] = [];
    for (const msg of pending) {
      try {
        setQueue(prev => prev.map(m =>
          m.id === msg.id ? { ...m, status: 'sending' } : m
        ));

        await messagesApi.sendMessage(msg.conversationId, {
          content: msg.content,
          type: msg.type,
          replyToId: msg.replyToId,
        });

        // Success - remove from queue
        logger.info(`[OfflineQueue] Sent queued message ${msg.id}`);
      } catch (err) {
        logger.error(`[OfflineQueue] Failed to send ${msg.id}:`, err);
        const updated = {
          ...msg,
          retryCount: msg.retryCount + 1,
          status: msg.retryCount + 1 >= MAX_RETRIES ? 'failed' as const : 'queued' as const,
        };
        results.push(updated);
      }
    }

    setQueue(results);
    processingRef.current = false;
  }, []);

  /** Retry a specific failed message */
  const retryMessage = useCallback(async (messageId: string) => {
    const msg = queue.find(m => m.id === messageId);
    if (!msg) return;

    setQueue(prev => prev.map(m =>
      m.id === messageId ? { ...m, status: 'sending', retryCount: 0 } : m
    ));

    try {
      await messagesApi.sendMessage(msg.conversationId, {
        content: msg.content,
        type: msg.type,
        replyToId: msg.replyToId,
      });
      setQueue(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      logger.error(`[OfflineQueue] Retry failed for ${messageId}:`, err);
      setQueue(prev => prev.map(m =>
        m.id === messageId ? { ...m, status: 'failed' } : m
      ));
    }
  }, [queue]);

  /** Remove a message from the queue */
  const removeFromQueue = useCallback((messageId: string) => {
    setQueue(prev => prev.filter(m => m.id !== messageId));
  }, []);

  /** Clear all queued messages */
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    isOnline,
    queueSize: queue.length,
    hasQueuedMessages: queue.length > 0,
    enqueue,
    processQueue,
    retryMessage,
    removeFromQueue,
    clearQueue,
  };
}
