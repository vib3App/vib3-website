/**
 * Interaction tracking service (Gap #103)
 * Tracks user interactions: video views, likes, comments, shares, follows, searches.
 * Queues events and batch-sends to backend.
 */

import { apiClient } from './api/client';

export type InteractionType =
  | 'video_view'
  | 'video_like'
  | 'video_comment'
  | 'video_share'
  | 'user_follow'
  | 'search'
  | 'profile_view'
  | 'video_save'
  | 'feed_scroll';

export interface InteractionEvent {
  type: InteractionType;
  targetId: string;          // videoId, userId, searchQuery, etc.
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

interface QueuedEvent extends InteractionEvent {
  id: string;
}

const BATCH_SIZE = 15;
const FLUSH_INTERVAL_MS = 10_000; // 10 seconds
const MAX_QUEUE_SIZE = 200;

let eventQueue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let eventCounter = 0;
let isInitialized = false;

/**
 * Initialize the interaction tracker
 */
export function initInteractionTracking(): void {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  flushTimer = setInterval(flushEvents, FLUSH_INTERVAL_MS);

  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    flushEventsSync();
  });

  // Flush when page becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEventsSync();
    }
  });
}

/**
 * Track a user interaction
 */
export function trackInteraction(
  type: InteractionType,
  targetId: string,
  metadata?: Record<string, string | number | boolean>
): void {
  const event: QueuedEvent = {
    id: `evt_${++eventCounter}_${Date.now()}`,
    type,
    targetId,
    timestamp: Date.now(),
    metadata,
  };

  eventQueue.push(event);

  // Evict oldest if over limit
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    eventQueue = eventQueue.slice(-MAX_QUEUE_SIZE);
  }

  // Auto-flush if batch is full
  if (eventQueue.length >= BATCH_SIZE) {
    flushEvents();
  }
}

/**
 * Track a video view with duration
 */
export function trackVideoView(
  videoId: string,
  watchDuration: number,
  totalDuration: number,
  completed: boolean
): void {
  trackInteraction('video_view', videoId, {
    watchDuration,
    totalDuration,
    watchPercentage: totalDuration > 0 ? Math.round((watchDuration / totalDuration) * 100) : 0,
    completed,
  });
}

/**
 * Track a search query
 */
export function trackSearch(query: string, resultCount: number): void {
  trackInteraction('search', query, { resultCount });
}

/**
 * Flush events to backend asynchronously
 */
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, BATCH_SIZE);

  try {
    await apiClient.post('/analytics/interactions', {
      events: batch.map(({ id: _id, ...rest }) => rest),
    });
  } catch {
    // Re-queue failed events at the front
    eventQueue.unshift(...batch);
    // Trim if re-queuing pushed over limit
    if (eventQueue.length > MAX_QUEUE_SIZE) {
      eventQueue = eventQueue.slice(-MAX_QUEUE_SIZE);
    }
  }
}

/**
 * Synchronous flush using sendBeacon (for page unload)
 */
function flushEventsSync(): void {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, BATCH_SIZE);
  const payload = JSON.stringify({
    events: batch.map(({ id: _id, ...rest }) => rest),
  });

  try {
    navigator.sendBeacon(
      `${apiClient.defaults.baseURL || ''}/analytics/interactions`,
      new Blob([payload], { type: 'application/json' })
    );
  } catch {
    // Last resort: re-queue
    eventQueue.unshift(...batch);
  }
}

/**
 * Get pending events count
 */
export function getPendingEventsCount(): number {
  return eventQueue.length;
}

/**
 * Clear all queued events
 */
export function clearEventQueue(): void {
  eventQueue = [];
}

/**
 * Destroy the tracker (cleanup timers)
 */
export function destroyInteractionTracking(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  isInitialized = false;
  eventQueue = [];
}
