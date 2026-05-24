'use client';

import { useCallback, useEffect, useState } from 'react';
import { scheduledPostsApi } from '@/services/api/scheduledPosts';
import type { ScheduledPost } from '@/types/upload';

interface UseScheduledPostsResult {
  posts: ScheduledPost[];
  loading: boolean;
  busyId: string | null;
  banner: { text: string; tone: 'success' | 'error' } | null;
  clearBanner: () => void;
  refresh: () => Promise<void>;
  publishNow: (post: ScheduledPost) => Promise<void>;
  reschedule: (post: ScheduledPost, when: Date) => Promise<void>;
  cancel: (post: ScheduledPost) => Promise<void>;
}

export function useScheduledPosts(): UseScheduledPostsResult {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [banner, setBanner] = useState<UseScheduledPostsResult['banner']>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await scheduledPostsApi.list();
    list.sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return a.scheduledAt.localeCompare(b.scheduledAt);
    });
    setPosts(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await scheduledPostsApi.list();
      if (cancelled) return;
      list.sort((a, b) => {
        if (!a.scheduledAt) return 1;
        if (!b.scheduledAt) return -1;
        return a.scheduledAt.localeCompare(b.scheduledAt);
      });
      setPosts(list);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const publishNow = useCallback(async (post: ScheduledPost) => {
    setBusyId(post.id);
    const ok = await scheduledPostsApi.publishNow(post.id);
    setBusyId(null);
    if (ok) {
      setBanner({ text: 'Published', tone: 'success' });
      await refresh();
    } else {
      setBanner({ text: 'Could not publish — try again', tone: 'error' });
    }
  }, [refresh]);

  const reschedule = useCallback(async (post: ScheduledPost, when: Date) => {
    setBusyId(post.id);
    const ok = await scheduledPostsApi.reschedule(post.id, when);
    setBusyId(null);
    if (ok) {
      setBanner({ text: 'Rescheduled', tone: 'success' });
      await refresh();
    } else {
      setBanner({ text: 'Could not reschedule — try again', tone: 'error' });
    }
  }, [refresh]);

  const cancel = useCallback(async (post: ScheduledPost) => {
    setBusyId(post.id);
    const ok = await scheduledPostsApi.cancel(post.id);
    setBusyId(null);
    if (ok) {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      setBanner({ text: 'Scheduled post canceled', tone: 'success' });
    } else {
      setBanner({ text: 'Could not cancel — try again', tone: 'error' });
    }
  }, []);

  return {
    posts,
    loading,
    busyId,
    banner,
    clearBanner: () => setBanner(null),
    refresh,
    publishNow,
    reschedule,
    cancel,
  };
}
