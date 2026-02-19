'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { StoryGroup } from '@/types/story';

interface UseStoryViewerOptions {
  storyGroups: StoryGroup[];
  onMarkViewed: (storyId: string) => void;
  onClose: () => void;
}

export function useStoryViewer({ storyGroups, onMarkViewed, onClose }: UseStoryViewerOptions) {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const goNextRef = useRef<() => void>(() => {});

  const activeGroup = storyGroups[activeGroupIndex];
  const activeStory = activeGroup?.stories[activeStoryIndex];
  const storyDuration = (activeStory?.duration || 5) * 1000;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
      const pct = Math.min((elapsed / storyDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearTimer();
        goNextRef.current();
      }
    }, 50);
  }, [storyDuration, clearTimer]);

  const goNext = useCallback(() => {
    clearTimer();
    elapsedRef.current = 0;
    setProgress(0);
    if (activeStoryIndex < (activeGroup?.stories.length || 0) - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else if (activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex(prev => prev + 1);
      setActiveStoryIndex(0);
    } else {
      onClose();
    }
  }, [activeStoryIndex, activeGroupIndex, activeGroup, storyGroups.length, onClose, clearTimer]);

  // Keep ref in sync
  useEffect(() => {
    goNextRef.current = goNext;
  }, [goNext]);

  const goPrev = useCallback(() => {
    clearTimer();
    elapsedRef.current = 0;
    setProgress(0);
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else if (activeGroupIndex > 0) {
      setActiveGroupIndex(prev => prev - 1);
      const prevGroup = storyGroups[activeGroupIndex - 1];
      setActiveStoryIndex(prevGroup ? prevGroup.stories.length - 1 : 0);
    }
  }, [activeStoryIndex, activeGroupIndex, storyGroups, clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    elapsedRef.current += Date.now() - startTimeRef.current;
    setIsPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPaused(false);
    startTimer();
  }, [startTimer]);

  const openGroup = useCallback((groupIndex: number) => {
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(0);
    elapsedRef.current = 0;
    setProgress(0);
  }, []);

  // Mark viewed + start timer when story changes
  useEffect(() => {
    if (activeStory) {
      onMarkViewed(activeStory.id);
      elapsedRef.current = 0;
      setProgress(0);
      if (!isPaused) startTimer();
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStory?.id]);

  return {
    activeGroupIndex,
    activeStoryIndex,
    activeGroup,
    activeStory,
    progress,
    isPaused,
    goNext,
    goPrev,
    pause,
    resume,
    openGroup,
  };
}
