'use client';

import { useCallback } from 'react';
import { websocketService } from '@/services/websocket';
import { logger } from '@/utils/logger';
import type { WebRTCRefs } from './useWebRTC';

/**
 * Media control actions for an active call (mute, video toggle, camera switch)
 */
export function useCallMediaControls(refs: WebRTCRefs) {
  const { localStreamRef, pcRef, localVideoRef } = refs;

  const toggleMute = useCallback((isMuted: boolean) => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = isMuted; // if currently muted, enable it
    }
    return !isMuted;
  }, [localStreamRef]);

  const toggleVideo = useCallback((isVideoOff: boolean) => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = isVideoOff; // if currently off, enable it
    }
    return !isVideoOff;
  }, [localStreamRef]);

  const switchCamera = useCallback(async () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;
    const facing = videoTrack.getSettings().facingMode || 'user';
    videoTrack.stop();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing === 'user' ? 'environment' : 'user' },
        audio: false,
      });
      const newTrack = newStream.getVideoTracks()[0];
      localStreamRef.current?.removeTrack(videoTrack);
      localStreamRef.current?.addTrack(newTrack);
      const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    } catch (err) {
      logger.error('Failed to switch camera:', err);
    }
  }, [localStreamRef, pcRef, localVideoRef]);

  return { toggleMute, toggleVideo, switchCamera };
}

/**
 * Acquire user media for a call
 */
export async function acquireCallMedia(
  type: 'video' | 'audio',
  localStreamRef: React.MutableRefObject<MediaStream | null>,
  localVideoRef: React.RefObject<HTMLVideoElement | null>,
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: type === 'video',
    audio: true,
  });
  localStreamRef.current = stream;
  if (localVideoRef.current && type === 'video') {
    localVideoRef.current.srcObject = stream;
  }
  return stream;
}

/**
 * Wait for a callId from the backend after initiating
 */
export function waitForCallRegistered(): Promise<string> {
  return new Promise<string>((resolve) => {
    const unsub = websocketService.onCallRegistered(({ callId }) => {
      unsub();
      resolve(callId);
    });
  });
}

export function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
