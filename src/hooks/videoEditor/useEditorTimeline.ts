'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useEditorTimeline(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<string[]>([]);

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
  }, [videoRef]);

  const handleVideoLoad = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrimEnd(videoRef.current.duration);
      generateThumbnails();
      return true;
    }
    return false;
  }, [videoRef, generateThumbnails]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  }, [videoRef, isDragging, trimEnd, trimStart]);

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
  }, [videoRef, isPlaying, trimStart, trimEnd]);

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
  }, [videoRef, isDragging, duration, trimStart, trimEnd]);

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

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  }, []);

  return {
    duration, currentTime, trimStart, trimEnd, isPlaying, setIsPlaying,
    timelineRef, thumbnails: thumbnailsRef.current,
    handleVideoLoad, handleTimeUpdate, togglePlayPause,
    handleTimelineMouseDown, formatTime,
  };
}
