'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { videoProcessor, type ProcessingProgress } from '@/services/videoProcessor';

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
  const [stickers, setStickers] = useState<{ id: string; emoji: string; x: number; y: number; scale: number; rotation: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const originalFileRef = useRef<File | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!videoUrl) router.push('/upload');
  }, [videoUrl, router]);

  // Store original file reference from session storage
  useEffect(() => {
    const storedFile = sessionStorage.getItem('editVideoFile');
    if (storedFile) {
      // File was stored as data URL, convert back to blob
      fetch(storedFile)
        .then(res => res.blob())
        .then(blob => {
          originalFileRef.current = new File([blob], 'video.mp4', { type: 'video/mp4' });
        })
        .catch(console.error);
    }
  }, []);

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

  const addSticker = useCallback((emoji: string) => {
    setStickers(prev => [...prev, {
      id: Date.now().toString(),
      emoji,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    }]);
  }, []);

  const removeSticker = useCallback((id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleDone = useCallback(async () => {
    // Check if any edits were made
    const hasEdits = trimStart > 0 || trimEnd < duration || selectedFilter !== 0 || volume !== 1;

    if (!hasEdits) {
      // No edits, just pass through
      sessionStorage.setItem('editSettings', JSON.stringify({
        trimStart, trimEnd, filter: EDITOR_FILTERS[selectedFilter].filter, volume, texts,
      }));
      router.push('/upload?from=edit');
      return;
    }

    // Process video with FFmpeg
    setIsProcessing(true);
    setProcessingProgress({ stage: 'loading', percent: 0, message: 'Initializing...' });

    try {
      // Load FFmpeg if not loaded
      await videoProcessor.load(setProcessingProgress);

      // Get source - use original file or fetch from URL
      let source: File | Blob | string = videoUrl || '';
      if (originalFileRef.current) {
        source = originalFileRef.current;
      }

      // Process video
      const processedBlob = await videoProcessor.processVideo(
        source,
        {
          trimStart: trimStart > 0 ? trimStart : undefined,
          trimEnd: trimEnd < duration ? trimEnd : undefined,
          filter: selectedFilter !== 0 ? EDITOR_FILTERS[selectedFilter].filter : undefined,
          volume: volume !== 1 ? volume : undefined,
        },
        setProcessingProgress
      );

      if (processedBlob) {
        // Store processed video
        const processedUrl = URL.createObjectURL(processedBlob);
        sessionStorage.setItem('processedVideoUrl', processedUrl);
        sessionStorage.setItem('processedVideoBlob', 'true');
        sessionStorage.setItem('editSettings', JSON.stringify({
          trimStart: 0, // Already applied
          trimEnd: processedBlob ? undefined : trimEnd,
          filter: 'none', // Already applied
          volume: 1, // Already applied
          texts,
        }));
        router.push('/upload?from=edit&processed=true');
      } else {
        // Processing failed, fall back to original
        console.warn('Processing failed, using original video');
        sessionStorage.setItem('editSettings', JSON.stringify({
          trimStart, trimEnd, filter: EDITOR_FILTERS[selectedFilter].filter, volume, texts,
        }));
        router.push('/upload?from=edit');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingProgress({ stage: 'error', percent: 0, message: 'Processing failed' });
      // Fall back to original
      setTimeout(() => {
        sessionStorage.setItem('editSettings', JSON.stringify({
          trimStart, trimEnd, filter: EDITOR_FILTERS[selectedFilter].filter, volume, texts,
        }));
        router.push('/upload?from=edit');
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  }, [trimStart, trimEnd, duration, selectedFilter, volume, texts, videoUrl, router]);

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
    isProcessing,
    processingProgress,
    videoRef,
    timelineRef,
    thumbnails: thumbnailsRef.current,
    handleVideoLoad,
    handleTimeUpdate,
    togglePlayPause,
    handleTimelineMouseDown,
    addText,
    removeText,
    stickers,
    addSticker,
    removeSticker,
    handleDone,
    formatTime,
    updateVolume,
    goBack: () => router.back(),
  };
}
