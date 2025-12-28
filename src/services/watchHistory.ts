/**
 * Watch History Service
 * Tracks watched videos locally and syncs with backend
 */

import { videoApi } from './api';

export interface WatchHistoryEntry {
  videoId: string;
  watchedAt: number;
  progress: number; // 0-100 percentage watched
  duration: number;
  completed: boolean;
}

const STORAGE_KEY = 'vib3_watch_history';
const MAX_HISTORY = 500;
const SYNC_INTERVAL = 30000; // 30 seconds

class WatchHistoryService {
  private history: WatchHistoryEntry[] = [];
  private pendingSync: WatchHistoryEntry[] = [];
  private syncTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.startSyncInterval();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load watch history:', error);
      this.history = [];
    }
  }

  private saveToStorage() {
    try {
      // Keep only the most recent entries
      const trimmed = this.history.slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save watch history:', error);
    }
  }

  private startSyncInterval() {
    // Sync pending entries periodically
    setInterval(() => {
      this.syncToBackend();
    }, SYNC_INTERVAL);

    // Also sync on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.syncToBackend();
      }
    });
  }

  private async syncToBackend() {
    if (this.pendingSync.length === 0) return;

    const toSync = [...this.pendingSync];
    this.pendingSync = [];

    try {
      // Batch sync to backend - only send completed views
      const completedViews = toSync.filter(entry => entry.completed);
      await Promise.all(
        completedViews.map(entry =>
          videoApi.recordView(entry.videoId).catch(() => {})
        )
      );
    } catch (error) {
      // Re-add failed entries to pending
      this.pendingSync.push(...toSync);
    }
  }

  /**
   * Record that a video was watched
   */
  trackWatch(videoId: string, progress: number, duration: number) {
    const now = Date.now();
    const completed = progress >= 90;

    // Update or add entry
    const existingIndex = this.history.findIndex(e => e.videoId === videoId);
    const entry: WatchHistoryEntry = {
      videoId,
      watchedAt: now,
      progress,
      duration,
      completed,
    };

    if (existingIndex >= 0) {
      // Update existing entry
      this.history[existingIndex] = entry;
      // Move to front
      this.history.unshift(this.history.splice(existingIndex, 1)[0]);
    } else {
      // Add new entry at front
      this.history.unshift(entry);
    }

    // Add to pending sync
    this.pendingSync.push(entry);

    this.saveToStorage();
  }

  /**
   * Check if a video was recently watched
   */
  wasRecentlyWatched(videoId: string, withinMs = 3600000): boolean {
    const entry = this.history.find(e => e.videoId === videoId);
    if (!entry) return false;
    return Date.now() - entry.watchedAt < withinMs;
  }

  /**
   * Get watch progress for a video
   */
  getProgress(videoId: string): number | null {
    const entry = this.history.find(e => e.videoId === videoId);
    return entry ? entry.progress : null;
  }

  /**
   * Get all watch history
   */
  getHistory(): WatchHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Get recently watched video IDs
   */
  getRecentlyWatchedIds(limit = 50): string[] {
    return this.history.slice(0, limit).map(e => e.videoId);
  }

  /**
   * Clear watch history
   */
  clear() {
    this.history = [];
    this.saveToStorage();
  }

  /**
   * Remove a specific video from history
   */
  remove(videoId: string) {
    this.history = this.history.filter(e => e.videoId !== videoId);
    this.saveToStorage();
  }
}

export const watchHistoryService = new WatchHistoryService();
