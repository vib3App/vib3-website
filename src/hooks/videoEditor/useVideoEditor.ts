'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { videoProcessor, type ProcessingProgress } from '@/services/videoProcessor';
import { EDITOR_FILTERS, type EditMode, type TextOverlay } from './types';
import { useEditorTimeline } from './useEditorTimeline';
import { useEditorOverlays } from './useEditorOverlays';

export function useVideoEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('video') || (typeof window !== 'undefined' ? sessionStorage.getItem('editVideoUrl') : null);

  const [editMode, setEditMode] = useState<EditMode>('trim');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const originalFileRef = useRef<File | null>(null);

  // Timeline management
  const timeline = useEditorTimeline(videoRef);
  const { duration, trimStart, trimEnd, handleVideoLoad: onVideoLoad } = timeline;

  // Overlays management
  const overlays = useEditorOverlays();

  useEffect(() => {
    if (!videoUrl) router.push('/upload');
  }, [videoUrl, router]);

  useEffect(() => {
    const storedFile = sessionStorage.getItem('editVideoFile');
    if (storedFile) {
      fetch(storedFile)
        .then(res => res.blob())
        .then(blob => {
          originalFileRef.current = new File([blob], 'video.mp4', { type: 'video/mp4' });
        })
        .catch(console.error);
    }
  }, []);

  const handleVideoLoad = useCallback(() => {
    if (onVideoLoad()) {
      setVideoLoaded(true);
    }
  }, [onVideoLoad]);

  const updateVolume = useCallback((val: number) => {
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
  }, []);

  const handleDone = useCallback(async () => {
    const hasEdits = trimStart > 0 || trimEnd < duration || selectedFilter !== 0 || volume !== 1;

    const saveSettings = (texts: TextOverlay[]) => {
      sessionStorage.setItem('editSettings', JSON.stringify({
        trimStart, trimEnd, filter: EDITOR_FILTERS[selectedFilter].filter, volume, texts,
      }));
    };

    if (!hasEdits) {
      saveSettings(overlays.texts);
      router.push('/upload?from=edit');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress({ stage: 'loading', percent: 0, message: 'Initializing...' });

    try {
      await videoProcessor.load(setProcessingProgress);

      let source: File | Blob | string = videoUrl || '';
      if (originalFileRef.current) source = originalFileRef.current;

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
        const processedUrl = URL.createObjectURL(processedBlob);
        sessionStorage.setItem('processedVideoUrl', processedUrl);
        sessionStorage.setItem('processedVideoBlob', 'true');
        sessionStorage.setItem('editSettings', JSON.stringify({
          trimStart: 0, trimEnd: undefined, filter: 'none', volume: 1, texts: overlays.texts,
        }));
        router.push('/upload?from=edit&processed=true');
      } else {
        saveSettings(overlays.texts);
        router.push('/upload?from=edit');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingProgress({ stage: 'error', percent: 0, message: 'Processing failed' });
      setTimeout(() => {
        saveSettings(overlays.texts);
        router.push('/upload?from=edit');
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  }, [trimStart, trimEnd, duration, selectedFilter, volume, overlays.texts, videoUrl, router]);

  return {
    videoUrl, editMode, setEditMode, videoLoaded, selectedFilter, setSelectedFilter,
    volume, isProcessing, processingProgress, videoRef,
    ...timeline, ...overlays,
    handleVideoLoad, handleDone, updateVolume, goBack: () => router.back(),
  };
}
