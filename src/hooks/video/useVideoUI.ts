'use client';

import { useRef, useState, useEffect, useCallback, RefObject } from 'react';

interface UseVideoUIOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  onMiniPlayerToggle?: (isMini: boolean) => void;
}

export function useVideoUI({ videoRef, onMiniPlayerToggle }: UseVideoUIOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // UI visibility states
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);

  // Menu states
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // PiP event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [videoRef]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        onMiniPlayerToggle?.(false);
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        onMiniPlayerToggle?.(true);
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, [videoRef, onMiniPlayerToggle]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const closeMenus = useCallback(() => {
    setShowSpeedMenu(false);
    setShowQualityMenu(false);
    setShowChapterMenu(false);
    setShowSettingsMenu(false);
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControlsOverlay(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      setShowControlsOverlay(false);
      closeMenus();
    }, 3000);
  }, [closeMenus]);

  const handleMouseLeave = useCallback(() => {
    setShowControlsOverlay(false);
    closeMenus();
  }, [closeMenus]);

  return {
    containerRef,
    // UI State
    showControlsOverlay,
    showVolumeSlider,
    isFullscreen,
    isPiPActive,
    // Menu states
    showSpeedMenu,
    showQualityMenu,
    showChapterMenu,
    showSettingsMenu,
    // Setters
    setShowVolumeSlider,
    setShowSpeedMenu,
    setShowQualityMenu,
    setShowChapterMenu,
    setShowSettingsMenu,
    // Handlers
    togglePiP,
    toggleFullscreen,
    handleMouseMove,
    handleMouseLeave,
    closeMenus,
  };
}
