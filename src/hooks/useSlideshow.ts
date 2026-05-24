'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { videoProcessor, type ProcessingProgress, type SlideshowTransition } from '@/services/videoProcessor';
import { logger } from '@/utils/logger';

export interface SlideshowSlide {
  id: string;
  file: File;
  previewUrl: string;
}

export interface UseSlideshowResult {
  slides: SlideshowSlide[];
  durationPerSlide: number;
  transition: SlideshowTransition;
  music: File | null;
  musicVolume: number;
  rendering: boolean;
  progress: ProcessingProgress | null;
  outputUrl: string | null;
  errorMessage: string | null;
  addSlides: (files: FileList | File[]) => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, direction: -1 | 1) => void;
  clear: () => void;
  setDurationPerSlide: (s: number) => void;
  setTransition: (t: SlideshowTransition) => void;
  setMusic: (f: File | null) => void;
  setMusicVolume: (v: number) => void;
  render: () => Promise<void>;
  sendToUpload: () => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SLIDES = 30;

export function useSlideshow(): UseSlideshowResult {
  const router = useRouter();
  const [slides, setSlides] = useState<SlideshowSlide[]>([]);
  const [durationPerSlide, setDurationPerSlide] = useState(3);
  const [transition, setTransition] = useState<SlideshowTransition>('fade');
  const [music, setMusic] = useState<File | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addSlides = useCallback((files: FileList | File[]) => {
    setErrorMessage(null);
    const incoming = Array.from(files).filter(f => ACCEPTED_IMAGE_TYPES.includes(f.type));
    if (incoming.length === 0) {
      setErrorMessage('No supported images selected (jpg, png, webp, gif).');
      return;
    }
    setSlides(prev => {
      const room = Math.max(0, MAX_SLIDES - prev.length);
      const accepted = incoming.slice(0, room);
      const next: SlideshowSlide[] = accepted.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      if (accepted.length < incoming.length) {
        setErrorMessage(`Only the first ${MAX_SLIDES} slides are kept.`);
      }
      return [...prev, ...next];
    });
  }, []);

  const removeSlide = useCallback((id: string) => {
    setSlides(prev => {
      const target = prev.find(s => s.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(s => s.id !== id);
    });
  }, []);

  const moveSlide = useCallback((id: string, direction: -1 | 1) => {
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    slides.forEach(s => URL.revokeObjectURL(s.previewUrl));
    setSlides([]);
    setMusic(null);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    setErrorMessage(null);
  }, [slides, outputUrl]);

  const render = useCallback(async () => {
    if (slides.length === 0) {
      setErrorMessage('Add at least one photo.');
      return;
    }
    setRendering(true);
    setProgress({ stage: 'loading', percent: 0, message: 'Loading video processor...' });
    setErrorMessage(null);
    try {
      const blob = await videoProcessor.buildSlideshow({
        images: slides.map(s => s.file),
        durationPerSlide,
        transition,
        music: music ?? undefined,
        musicVolume,
      }, setProgress);
      if (!blob) {
        setErrorMessage('Slideshow render failed. Try fewer photos or remove music.');
        return;
      }
      const url = URL.createObjectURL(blob);
      setOutputUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      logger.error('Slideshow render error:', err);
      setErrorMessage('Slideshow render failed.');
    } finally {
      setRendering(false);
    }
  }, [slides, durationPerSlide, transition, music, musicVolume]);

  const sendToUpload = useCallback(() => {
    if (!outputUrl) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('processedVideoUrl', outputUrl);
      sessionStorage.setItem('processedVideoBlob', 'true');
      sessionStorage.setItem('editVideoUrl', outputUrl);
    }
    router.push('/upload?from=slideshow&processed=true');
  }, [outputUrl, router]);

  return {
    slides,
    durationPerSlide,
    transition,
    music,
    musicVolume,
    rendering,
    progress,
    outputUrl,
    errorMessage,
    addSlides,
    removeSlide,
    moveSlide,
    clear,
    setDurationPerSlide,
    setTransition,
    setMusic,
    setMusicVolume,
    render,
    sendToUpload,
  };
}
