'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Hls from 'hls.js';
import { videoApi, searchApi } from '@/services/api';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

type LayoutMode = 'grid' | 'focus' | 'pip';

export interface VideoSlot {
  id: string;
  video: Video | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
}

const MAX_VIDEOS = 4;

export function useMultiView() {
  const searchParams = useSearchParams();
  const initialVideoIds = useMemo(() => searchParams.get('videos')?.split(',') || [], [searchParams]);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const hlsInstances = useRef<(Hls | null)[]>([]);

  const [slots, setSlots] = useState<VideoSlot[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [focusedSlot, setFocusedSlot] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [searching, setSearching] = useState(false);
  const [masterMuted, setMasterMuted] = useState(true);

  useEffect(() => {
    const loadInitialVideos = async () => {
      const loadedSlots: VideoSlot[] = [];
      for (const videoId of initialVideoIds.slice(0, MAX_VIDEOS)) {
        try {
          const video = await videoApi.getVideo(videoId);
          loadedSlots.push({ id: `slot-${loadedSlots.length}`, video, isPlaying: true, isMuted: true, volume: 0.5 });
        } catch (err) {
          logger.error(`Failed to load video ${videoId}:`, err);
        }
      }
      while (loadedSlots.length < MAX_VIDEOS) {
        loadedSlots.push({ id: `slot-${loadedSlots.length}`, video: null, isPlaying: false, isMuted: true, volume: 0.5 });
      }
      setSlots(loadedSlots);
    };
    loadInitialVideos();
  }, [initialVideoIds]);

  // Track slot video URLs for HLS setup - only changes when videos are added/removed
  const slotVideoUrls = useMemo(() => slots.map(s => s.video?.videoUrl || ''), [slots]);
  const slotVideoUrlsKey = useMemo(() => slotVideoUrls.join(','), [slotVideoUrls]);

  // Use a ref to hold the latest slots so the HLS setup effect can read current
  // isPlaying/isMuted/volume without depending on the slots state directly
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  // HLS setup effect - only runs when video URLs change (add/remove video),
  // NOT on play/pause/mute changes
  useEffect(() => {
    const currentHlsInstances = hlsInstances.current;
    const currentSlots = slotsRef.current;

    slotVideoUrls.forEach((videoUrl, index) => {
      const videoEl = videoRefs.current[index];
      if (!videoEl || !videoUrl) return;

      if (currentHlsInstances[index]) {
        currentHlsInstances[index]?.destroy();
        currentHlsInstances[index] = null;
      }

      const slot = currentSlots[index];

      // Apply volume and mute state
      videoEl.muted = slot.isMuted;
      videoEl.volume = slot.volume;

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(videoEl);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (slotsRef.current[index]?.isPlaying) videoEl.play().catch(() => {});
        });
        currentHlsInstances[index] = hls;
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = videoUrl;
        if (slot.isPlaying) videoEl.play().catch(() => {});
      }
    });

    return () => {
      currentHlsInstances.forEach(hls => hls?.destroy());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotVideoUrlsKey]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchApi.searchVideos(searchQuery);
      setSearchResults(results.items || []);
    } catch (err) {
      logger.error('Failed to search:', err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const masterMutedRef = useRef(masterMuted);
  masterMutedRef.current = masterMuted;

  const addVideoToSlot = useCallback((video: Video, slotIndex: number) => {
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex ? { ...slot, video, isPlaying: true, isMuted: masterMutedRef.current } : slot
    ));
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const removeVideoFromSlot = useCallback((slotIndex: number) => {
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex ? { ...slot, video: null, isPlaying: false } : slot
    ));
  }, []);

  const togglePlay = useCallback((slotIndex: number) => {
    const videoEl = videoRefs.current[slotIndex];
    if (!videoEl) return;
    const currentSlot = slotsRef.current[slotIndex];
    if (currentSlot.isPlaying) {
      videoEl.pause();
    } else {
      videoEl.play();
    }
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex ? { ...slot, isPlaying: !slot.isPlaying } : slot
    ));
  }, []);

  const toggleMute = useCallback((slotIndex?: number) => {
    if (slotIndex === undefined) {
      setMasterMuted(prev => {
        const newMuted = !prev;
        videoRefs.current.forEach(videoEl => { if (videoEl) videoEl.muted = newMuted; });
        setSlots(prevSlots => prevSlots.map(slot => ({ ...slot, isMuted: newMuted })));
        return newMuted;
      });
    } else {
      const videoEl = videoRefs.current[slotIndex];
      const currentSlot = slotsRef.current[slotIndex];
      if (videoEl) videoEl.muted = !currentSlot.isMuted;
      setSlots(prev => prev.map((slot, i) =>
        i === slotIndex ? { ...slot, isMuted: !slot.isMuted } : slot
      ));
    }
  }, []);

  const playAll = useCallback(() => {
    videoRefs.current.forEach((videoEl, i) => {
      if (videoEl && slotsRef.current[i].video) videoEl.play();
    });
    setSlots(prev => prev.map(slot => slot.video ? { ...slot, isPlaying: true } : slot));
  }, []);

  const pauseAll = useCallback(() => {
    videoRefs.current.forEach(videoEl => { if (videoEl) videoEl.pause(); });
    setSlots(prev => prev.map(slot => ({ ...slot, isPlaying: false })));
  }, []);

  const getEmptySlotIndex = useCallback(() => slotsRef.current.findIndex(slot => !slot.video), []);

  const getLayoutClasses = useCallback(() => {
    if (layoutMode === 'focus') return 'grid-cols-1';
    const videoCount = slotsRef.current.filter(s => s.video).length;
    if (videoCount <= 1) return 'grid-cols-1';
    return 'grid-cols-2';
  }, [layoutMode]);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    slots,
    layoutMode,
    setLayoutMode,
    focusedSlot,
    setFocusedSlot,
    showAddModal,
    setShowAddModal,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    masterMuted,
    videoRefs,
    handleSearch,
    addVideoToSlot,
    removeVideoFromSlot,
    togglePlay,
    toggleMute,
    playAll,
    pauseAll,
    getEmptySlotIndex,
    getLayoutClasses,
    closeAddModal,
  };
}
