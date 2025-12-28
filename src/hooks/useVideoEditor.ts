'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export const EDITOR_FILTERS = [
  { name: 'Normal', filter: 'none' },
  { name: 'Vintage', filter: 'sepia(0.5) contrast(1.1)' },
  { name: 'B&W', filter: 'grayscale(1)' },
  { name: 'Warm', filter: 'sepia(0.3) saturate(1.4)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.7)' },
  { name: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
  { name: 'Fade', filter: 'contrast(0.9) brightness(1.1) saturate(0.8)' },
  { name: 'Drama', filter: 'contrast(1.3) brightness(0.9)' },
];

type EditMode = 'trim' | 'filters' | 'text' | 'stickers' | 'audio';

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export function useVideoEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('video') || (typeof window !== 'undefined' ? sessionStorage.getItem('editVideoUrl') : null);

  const [editMode, setEditMode] = useState<EditMode>('trim');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);
  const [volume, setVolume] = useState(1);
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!videoUrl) router.push('/upload');
  }, [videoUrl, router]);

  const generateThumbnails = useCallback(async () => {
    if (!videoRef.current || thumbnailsRef.current.length > 0) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 60;
    canvas.height = 80;
    const thumbCount = 10;
    const interval = video.duration / thumbCount;
    for (let i = 0; i < thumbCount; i++) {
      video.currentTime = i * interval;
      await new Promise(resolve => {
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbnailsRef.current.push(canvas.toDataURL('image/jpeg', 0.5));
          resolve(null);
        };
      });
    }
    video.currentTime = 0;
  }, []);

  const handleVideoLoad = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrimEnd(videoRef.current.duration);
      setVideoLoaded(true);
      generateThumbnails();
    }
  }, [generateThumbnails]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  }, [isDragging, trimEnd, trimStart]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (videoRef.current.currentTime < trimStart || videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, trimStart, trimEnd]);

  const handleTimelineMouseDown = useCallback((e: React.MouseEvent, type: 'start' | 'end' | 'playhead') => {
    e.preventDefault();
    setIsDragging(type);
  }, []);

  const handleTimelineMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current || !videoRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;
    if (isDragging === 'start') {
      setTrimStart(Math.min(time, trimEnd - 1));
    } else if (isDragging === 'end') {
      setTrimEnd(Math.max(time, trimStart + 1));
    } else if (isDragging === 'playhead') {
      videoRef.current.currentTime = Math.max(trimStart, Math.min(trimEnd, time));
      setCurrentTime(time);
    }
  }, [isDragging, duration, trimStart, trimEnd]);

  const handleTimelineMouseUp = useCallback(() => setIsDragging(null), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTimelineMouseMove);
      window.addEventListener('mouseup', handleTimelineMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleTimelineMouseMove);
        window.removeEventListener('mouseup', handleTimelineMouseUp);
      };
    }
  }, [isDragging, handleTimelineMouseMove, handleTimelineMouseUp]);

  const addText = useCallback(() => {
    if (!newText.trim()) return;
    setTexts(prev => [...prev, { id: Date.now().toString(), text: newText, x: 50, y: 50, color: '#ffffff', fontSize: 24 }]);
    setNewText('');
    setShowTextInput(false);
  }, [newText]);

  const removeText = useCallback((id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleDone = useCallback(() => {
    sessionStorage.setItem('editSettings', JSON.stringify({
      trimStart, trimEnd, filter: EDITOR_FILTERS[selectedFilter].filter, volume, texts,
    }));
    router.push('/upload?from=edit');
  }, [trimStart, trimEnd, selectedFilter, volume, texts, router]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  }, []);

  const updateVolume = useCallback((val: number) => {
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
  }, []);

  return {
    videoUrl,
    editMode,
    setEditMode,
    videoLoaded,
    duration,
    currentTime,
    trimStart,
    trimEnd,
    selectedFilter,
    setSelectedFilter,
    isPlaying,
    setIsPlaying,
    volume,
    texts,
    showTextInput,
    setShowTextInput,
    newText,
    setNewText,
    videoRef,
    timelineRef,
    thumbnails: thumbnailsRef.current,
    handleVideoLoad,
    handleTimeUpdate,
    togglePlayPause,
    handleTimelineMouseDown,
    addText,
    removeText,
    handleDone,
    formatTime,
    updateVolume,
    goBack: () => router.back(),
  };
}
