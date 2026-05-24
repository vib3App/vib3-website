/**
 * Scheduled posts API.
 *
 * Backend routes live on the upload router, mounted at `/api/videos`:
 *   GET    /videos/scheduled                            → list
 *   POST   /videos/scheduled/:id/publish-now            → publish immediately
 *   PUT    /videos/scheduled/:id/reschedule             → change scheduledAt
 *   DELETE /videos/scheduled/:id                        → cancel + delete
 *
 * Source of truth: backend `routes/upload-routes.js` lines 2274-2480.
 * Matches the Flutter mobile client's `ScheduledPostsService`.
 */

import { apiClient } from './client';
import type { ScheduledPost } from '@/types/upload';
import { logger } from '@/utils/logger';

interface RawScheduledPost {
  _id?: string;
  id?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  hlsUrl?: string | null;
  scheduledAt?: string | null;
  privacy?: string | null;
  allowComments?: boolean;
  allowEcho?: boolean;
  allowBounce?: boolean;
  allowDownload?: boolean;
  hashtags?: string[] | string | null;
  taggedUsers?: string[] | string | null;
  locationName?: string | null;
}

function toList(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value.map(v => String(v));
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[\s,]+/).filter(Boolean);
  }
  return [];
}

function transformScheduledPost(raw: RawScheduledPost): ScheduledPost {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    description: raw.description ?? '',
    thumbnailUrl: raw.thumbnailUrl ?? undefined,
    hlsUrl: raw.hlsUrl ?? undefined,
    scheduledAt: raw.scheduledAt ?? '',
    privacy: raw.privacy ?? 'public',
    allowComments: raw.allowComments !== false,
    allowEcho: raw.allowEcho !== false,
    allowBounce: raw.allowBounce !== false,
    allowDownload: raw.allowDownload !== false,
    hashtags: toList(raw.hashtags),
    taggedUsers: toList(raw.taggedUsers),
    locationName: raw.locationName ?? undefined,
  };
}

export const scheduledPostsApi = {
  async list(): Promise<ScheduledPost[]> {
    try {
      const { data } = await apiClient.get<{ scheduled: RawScheduledPost[] }>('/videos/scheduled');
      return (data.scheduled ?? []).map(transformScheduledPost);
    } catch (err) {
      logger.error('scheduledPostsApi.list failed:', err);
      return [];
    }
  },

  async publishNow(postId: string): Promise<boolean> {
    try {
      await apiClient.post(`/videos/scheduled/${postId}/publish-now`);
      return true;
    } catch (err) {
      logger.error('scheduledPostsApi.publishNow failed:', err);
      return false;
    }
  },

  async reschedule(postId: string, when: Date): Promise<boolean> {
    try {
      await apiClient.put(`/videos/scheduled/${postId}/reschedule`, {
        scheduledAt: when.toISOString(),
      });
      return true;
    } catch (err) {
      logger.error('scheduledPostsApi.reschedule failed:', err);
      return false;
    }
  },

  async cancel(postId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/videos/scheduled/${postId}`);
      return true;
    } catch (err) {
      logger.error('scheduledPostsApi.cancel failed:', err);
      return false;
    }
  },
};
