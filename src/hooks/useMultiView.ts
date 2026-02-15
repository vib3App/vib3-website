'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Hls from 'hls.js';
import { videoApi, searchApi } from '@/services/api';
import type { Video } from '@/types';

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
  const initialVideoIds = searchParams.get('videos')?.split(',') || [];

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
          console.error(`Failed to load video ${videoId}:`, err);
        }
      }
      while (loadedSlots.length < MAX_VIDEOS) {
        loadedSlots.push({ id: `slot-${loadedSlots.length}`, video: null, isPlaying: false, isMuted: true, volume: 0.5 });
      }
      setSlots(loadedSlots);
    };
    loadInitialVideos();
  }, []);

  useEffect(() => {
    slots.forEach((slot, index) => {
      const videoEl = videoRefs.current[index];
      if (!videoEl || !slot.video?.videoUrl) return;

      if (hlsInstances.current[index]) {
        hlsInstances.current[index]?.destroy();
        hlsInstances.current[index] = null;
      }

      // Apply volume and mute state
      videoEl.muted = slot.isMuted;
      videoEl.volume = slot.volume;

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(slot.video.videoUrl);
        hls.attachMedia(videoEl);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (slot.isPlaying) videoEl.play().catch(() => {});
        });
        hlsInstances.current[index] = hls;
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = slot.video.videoUrl;
        if (slot.isPlaying) videoEl.play().catch(() => {});
      }
    });

    return () => {
      hlsInstances.current.forEach(hls => hls?.destroy());
    };
  }, [slots.map(s => s.video?.id).join(',')]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchApi.searchVideos(searchQuery);
      setSearchResults(results.items || []);
    } catch (err) {
      console.error('Failed to search:', err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const addVideoToSlot = useCallback((video: Video, slotIndex: number) => {
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex ? { ...slot, video, isPlaying: true, isMuted: masterMuted } : slot
    ));
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [masterMuted]);

  const removeVideoFromSlot = useCallback((slotIndex: number) => {
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex ? { ...slot, video: null, isPlaying: false } : slot
    ));
  }, []);

  const togglePlay = useCallback((slotIndex: number) => {
    const videoEl = videoRefs.current[slotIndex];
    if (!videoEl) return;
    if (slots[slotIndex].isPlaying) {
      videoEl.pause();
    } else {
      videoEl.play();
    }
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex ? { ...slot, isPlaying: !slot.isPlaying } : slot
    ));
  }, [slots]);

  const toggleMute = useCallback((slotIndex?: number) => {
    if (slotIndex === undefined) {
      const newMuted = !masterMuted;
      setMasterMuted(newMuted);
      videoRefs.current.forEach(videoEl => { if (videoEl) videoEl.muted = newMuted; });
      setSlots(prev => prev.map(slot => ({ ...slot, isMuted: newMuted })));
    } else {
      const videoEl = videoRefs.current[slotIndex];
      if (videoEl) videoEl.muted = !slots[slotIndex].isMuted;
      setSlots(prev => prev.map((slot, i) =>
        i === slotIndex ? { ...slot, isMuted: !slot.isMuted } : slot
      ));
    }
  }, [masterMuted, slots]);

  const playAll = useCallback(() => {
    videoRefs.current.forEach((videoEl, i) => {
      if (videoEl && slots[i].video) videoEl.play();
    });
    setSlots(prev => prev.map(slot => slot.video ? { ...slot, isPlaying: true } : slot));
  }, [slots]);

  const pauseAll = useCallback(() => {
    videoRefs.current.forEach(videoEl => { if (videoEl) videoEl.pause(); });
    setSlots(prev => prev.map(slot => ({ ...slot, isPlaying: false })));
  }, []);

  const getEmptySlotIndex = useCallback(() => slots.findIndex(slot => !slot.video), [slots]);

  const getLayoutClasses = useCallback(() => {
    if (layoutMode === 'focus') return 'grid-cols-1';
    const videoCount = slots.filter(s => s.video).length;
    if (videoCount <= 1) return 'grid-cols-1';
    return 'grid-cols-2';
  }, [layoutMode, slots]);

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
