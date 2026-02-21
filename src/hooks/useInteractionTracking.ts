/**
 * Interaction tracking hook (Gap #103)
 * Provides React integration for the interaction tracking service.
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  initInteractionTracking,
  trackInteraction,
  trackVideoView,
  trackSearch,
  destroyInteractionTracking,
  type InteractionType,
} from '@/services/interactionTracking';

export function useInteractionTracking() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initInteractionTracking();

    return () => {
      destroyInteractionTracking();
      initialized.current = false;
    };
  }, []);

  const track = useCallback(
    (type: InteractionType, targetId: string, metadata?: Record<string, string | number | boolean>) => {
      trackInteraction(type, targetId, metadata);
    },
    []
  );

  const trackView = useCallback(
    (videoId: string, watchDuration: number, totalDuration: number, completed: boolean) => {
      trackVideoView(videoId, watchDuration, totalDuration, completed);
    },
    []
  );

  const trackLike = useCallback((videoId: string) => {
    trackInteraction('video_like', videoId);
  }, []);

  const trackComment = useCallback((videoId: string) => {
    trackInteraction('video_comment', videoId);
  }, []);

  const trackShare = useCallback((videoId: string, platform?: string) => {
    trackInteraction('video_share', videoId, platform ? { platform } : undefined);
  }, []);

  const trackFollow = useCallback((userId: string) => {
    trackInteraction('user_follow', userId);
  }, []);

  const trackSearchQuery = useCallback((query: string, resultCount: number) => {
    trackSearch(query, resultCount);
  }, []);

  const trackSave = useCallback((videoId: string) => {
    trackInteraction('video_save', videoId);
  }, []);

  return {
    track,
    trackVideoView: trackView,
    trackLike,
    trackComment,
    trackShare,
    trackFollow,
    trackSearch: trackSearchQuery,
    trackSave,
  };
}
