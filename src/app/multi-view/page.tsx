'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Hls from 'hls.js';
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { videoApi, searchApi } from '@/services/api';
import type { Video } from '@/types';

type LayoutMode = 'grid' | 'focus' | 'pip';

interface VideoSlot {
  id: string;
  video: Video | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
}

const MAX_VIDEOS = 4;

export default function MultiViewPage() {
  return (
    <Suspense fallback={<MultiViewLoading />}>
      <MultiViewContent />
    </Suspense>
  );
}

function MultiViewLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function MultiViewContent() {
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

  // Load initial videos
  useEffect(() => {
    const loadInitialVideos = async () => {
      const loadedSlots: VideoSlot[] = [];

      for (const videoId of initialVideoIds.slice(0, MAX_VIDEOS)) {
        try {
          const video = await videoApi.getVideo(videoId);
          loadedSlots.push({
            id: `slot-${loadedSlots.length}`,
            video,
            isPlaying: true,
            isMuted: true,
            volume: 0.5,
          });
        } catch (err) {
          console.error(`Failed to load video ${videoId}:`, err);
        }
      }

      // Fill remaining slots with empty
      while (loadedSlots.length < MAX_VIDEOS) {
        loadedSlots.push({
          id: `slot-${loadedSlots.length}`,
          video: null,
          isPlaying: false,
          isMuted: true,
          volume: 0.5,
        });
      }

      setSlots(loadedSlots);
    };

    loadInitialVideos();
  }, []);

  // Setup HLS for each video
  useEffect(() => {
    slots.forEach((slot, index) => {
      const videoEl = videoRefs.current[index];
      if (!videoEl || !slot.video?.videoUrl) return;

      // Cleanup existing HLS
      if (hlsInstances.current[index]) {
        hlsInstances.current[index]?.destroy();
        hlsInstances.current[index] = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(slot.video.videoUrl);
        hls.attachMedia(videoEl);
        hlsInstances.current[index] = hls;
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = slot.video.videoUrl;
      }
    });

    return () => {
      hlsInstances.current.forEach(hls => hls?.destroy());
    };
  }, [slots.map(s => s.video?.id).join(',')]);

  // Search for videos
  const handleSearch = async (e: React.FormEvent) => {
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
  };

  // Add video to slot
  const addVideoToSlot = (video: Video, slotIndex: number) => {
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex
        ? { ...slot, video, isPlaying: true, isMuted: masterMuted }
        : slot
    ));
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove video from slot
  const removeVideoFromSlot = (slotIndex: number) => {
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex
        ? { ...slot, video: null, isPlaying: false }
        : slot
    ));
  };

  // Toggle play/pause for a slot
  const togglePlay = (slotIndex: number) => {
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
  };

  // Toggle mute for a slot (or master)
  const toggleMute = (slotIndex?: number) => {
    if (slotIndex === undefined) {
      // Master mute toggle
      const newMuted = !masterMuted;
      setMasterMuted(newMuted);

      videoRefs.current.forEach((videoEl, i) => {
        if (videoEl) videoEl.muted = newMuted;
      });

      setSlots(prev => prev.map(slot => ({ ...slot, isMuted: newMuted })));
    } else {
      // Individual slot mute
      const videoEl = videoRefs.current[slotIndex];
      if (videoEl) {
        videoEl.muted = !slots[slotIndex].isMuted;
      }

      setSlots(prev => prev.map((slot, i) =>
        i === slotIndex ? { ...slot, isMuted: !slot.isMuted } : slot
      ));
    }
  };

  // Play all videos
  const playAll = () => {
    videoRefs.current.forEach((videoEl, i) => {
      if (videoEl && slots[i].video) {
        videoEl.play();
      }
    });
    setSlots(prev => prev.map(slot =>
      slot.video ? { ...slot, isPlaying: true } : slot
    ));
  };

  // Pause all videos
  const pauseAll = () => {
    videoRefs.current.forEach(videoEl => {
      if (videoEl) videoEl.pause();
    });
    setSlots(prev => prev.map(slot => ({ ...slot, isPlaying: false })));
  };

  // Get empty slot index
  const getEmptySlotIndex = (): number => {
    return slots.findIndex(slot => !slot.video);
  };

  // Get grid layout classes based on mode and number of videos
  const getLayoutClasses = () => {
    if (layoutMode === 'focus') {
      return 'grid-cols-1';
    }

    const videoCount = slots.filter(s => s.video).length;
    if (videoCount <= 1) return 'grid-cols-1';
    if (videoCount === 2) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-full px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Multi-View</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Layout Modes */}
            <div className="flex items-center bg-white/10 rounded-full p-1">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-2 rounded-full transition ${
                  layoutMode === 'grid' ? 'bg-white text-black' : ''
                }`}
                title="Grid view"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('focus')}
                className={`p-2 rounded-full transition ${
                  layoutMode === 'focus' ? 'bg-white text-black' : ''
                }`}
                title="Focus view"
              >
                <ArrowsPointingOutIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Master Audio */}
            <button
              onClick={() => toggleMute()}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              {masterMuted ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>

            {/* Play/Pause All */}
            <button
              onClick={() => {
                const anyPlaying = slots.some(s => s.isPlaying && s.video);
                anyPlaying ? pauseAll() : playAll();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              {slots.some(s => s.isPlaying && s.video) ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <main className={`grid ${getLayoutClasses()} gap-1 h-[calc(100vh-3.5rem)]`}>
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            className={`relative bg-gray-900 ${
              layoutMode === 'focus' && index !== focusedSlot ? 'hidden' : ''
            }`}
          >
            {slot.video ? (
              <>
                <video
                  ref={el => { videoRefs.current[index] = el; }}
                  autoPlay
                  loop
                  muted={slot.isMuted}
                  playsInline
                  className="w-full h-full object-contain"
                  onClick={() => togglePlay(index)}
                />

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                  {/* Top bar */}
                  <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                        {slot.video.userAvatar ? (
                          <img src={slot.video.userAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                            {slot.video.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">@{slot.video.username}</span>
                    </div>
                    <button
                      onClick={() => removeVideoFromSlot(index)}
                      className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Center play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => togglePlay(index)}
                      className="p-4 bg-black/50 hover:bg-black/70 rounded-full transition"
                    >
                      {slot.isPlaying ? (
                        <PauseIcon className="w-8 h-8" />
                      ) : (
                        <PlayIcon className="w-8 h-8" />
                      )}
                    </button>
                  </div>

                  {/* Bottom bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                    <div className="text-sm truncate max-w-[70%]">
                      {slot.video.title || slot.video.caption}
                    </div>
                    <button
                      onClick={() => toggleMute(index)}
                      className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition"
                    >
                      {slot.isMuted ? (
                        <SpeakerXMarkIcon className="w-4 h-4" />
                      ) : (
                        <SpeakerWaveIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Focus mode selector */}
                {layoutMode === 'grid' && (
                  <button
                    onClick={() => {
                      setFocusedSlot(index);
                      setLayoutMode('focus');
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition"
                    title="Focus on this video"
                  >
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              // Empty slot
              <button
                onClick={() => {
                  setShowAddModal(true);
                }}
                className="w-full h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/20 hover:border-pink-500 hover:bg-pink-500/5 transition"
              >
                <PlusIcon className="w-12 h-12 text-gray-600" />
                <span className="text-gray-400">Add Video</span>
              </button>
            )}
          </div>
        ))}
      </main>

      {/* Focus mode navigation */}
      {layoutMode === 'focus' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/80 rounded-full">
          {slots.map((slot, i) => (
            <button
              key={slot.id}
              onClick={() => setFocusedSlot(i)}
              disabled={!slot.video}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                i === focusedSlot ? 'border-pink-500' : 'border-transparent'
              } ${!slot.video ? 'opacity-50' : ''}`}
            >
              {slot.video?.thumbnailUrl ? (
                <img src={slot.video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-xs">{i + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Video</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleSearch} className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for videos..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                />
              </form>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Search for videos to add
                  </div>
                ) : (
                  searchResults.map(video => (
                    <button
                      key={video.id}
                      onClick={() => addVideoToSlot(video, getEmptySlotIndex())}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition"
                    >
                      <div className="w-20 aspect-video bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm truncate">{video.title || video.caption}</div>
                        <div className="text-xs text-gray-400">@{video.username}</div>
                      </div>
                      <PlusIcon className="w-5 h-5 text-pink-400" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
