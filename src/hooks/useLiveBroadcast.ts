'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { liveApi } from '@/services/api';
import type { CreateLiveStreamInput, LiveKitCredentials, LiveStream } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Gap #36: Go Live Broadcast Hook
 *
 * Manages the full lifecycle of going live:
 *  1. Get camera/mic via getUserMedia
 *  2. Call POST /api/live/start with title, description, tags
 *  3. Receive LiveKit credentials (token, wsUrl, roomName)
 *  4. Provide controls: mute/unmute, toggle video, flip camera, end stream
 */

interface UseLiveBroadcastOptions {
  onStreamEnded?: () => void;
}

export function useLiveBroadcast(options?: UseLiveBroadcastOptions) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [liveKitCredentials, setLiveKitCredentials] = useState<LiveKitCredentials | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamIdRef = useRef<string | null>(null);

  // Start camera preview
  const startPreview = useCallback(async (cameraId?: string, micId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: cameraId ? { deviceId: { exact: cameraId } } : true,
        audio: micId ? { deviceId: { exact: micId } } : true,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
      return mediaStream;
    } catch (err) {
      logger.error('Failed to start preview:', err);
      setError('Camera/mic access denied.');
      return null;
    }
  }, []);

  // Go live
  const goLive = useCallback(async (input: CreateLiveStreamInput) => {
    setIsStarting(true);
    setError(null);
    try {
      const response = await liveApi.startStream(input);
      const newStream = response.stream;
      const id = (newStream as unknown as { _id?: string })._id || newStream.id;
      streamIdRef.current = id;
      setStream(newStream);

      if (response.liveKit) {
        setLiveKitCredentials(response.liveKit);
        setIsLive(true);
      } else {
        setError('LiveKit credentials not available. Stream may not be properly configured.');
      }
    } catch (err) {
      logger.error('Failed to start broadcast:', err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr?.response?.data?.error || 'Failed to start stream.');
    } finally {
      setIsStarting(false);
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !audioEnabled;
      });
    }
    setAudioEnabled((v) => !v);
  }, [localStream, audioEnabled]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = !videoEnabled;
      });
    }
    setVideoEnabled((v) => !v);
  }, [localStream, videoEnabled]);

  // Flip camera
  const flipCamera = useCallback(async () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;
    const facing = videoTrack.getSettings().facingMode || 'user';
    videoTrack.stop();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing === 'user' ? 'environment' : 'user' },
        audio: false,
      });
      const newTrack = newStream.getVideoTracks()[0];
      localStream.removeTrack(videoTrack);
      localStream.addTrack(newTrack);
      if (videoRef.current) videoRef.current.srcObject = localStream;
    } catch (err) {
      logger.error('Failed to flip camera:', err);
    }
  }, [localStream]);

  // End stream
  const endStream = useCallback(async () => {
    const id = streamIdRef.current;
    if (id) {
      try {
        await liveApi.endStream(id);
      } catch (err) {
        logger.error('Failed to end stream:', err);
      }
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    setLocalStream(null);
    setIsLive(false);
    setStream(null);
    setLiveKitCredentials(null);
    streamIdRef.current = null;
    options?.onStreamEnded?.();
  }, [localStream, options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [localStream]);

  return {
    // State
    stream,
    liveKitCredentials,
    localStream,
    isLive,
    isStarting,
    error,
    audioEnabled,
    videoEnabled,
    videoRef,
    // Actions
    startPreview,
    goLive,
    toggleAudio,
    toggleVideo,
    flipCamera,
    endStream,
  };
}
