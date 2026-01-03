'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { callsApi } from '@/services/api/calls';
import { websocketService } from '@/services/websocket';
import type { Call, CallType, IncomingCall, CallEndedEvent } from '@/types/call';

interface LiveKitCredentials {
  url: string;
  token: string;
  roomName: string;
}

export function useVideoCall() {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [liveKitCredentials, setLiveKitCredentials] = useState<LiveKitCredentials | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Media controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Call duration
  const [callDuration, setCallDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Media streams
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Listen for incoming calls via WebSocket
  useEffect(() => {
    const unsubIncoming = websocketService.onIncomingCall?.((call: IncomingCall) => {
      setIncomingCall(call);
    });

    const unsubEnded = websocketService.onCallEnded?.((event: CallEndedEvent) => {
      if (activeCall?.id === event.callId) {
        handleCallEnded(event.reason, event.duration);
      }
      if (incomingCall?.callId === event.callId) {
        setIncomingCall(null);
      }
    });

    return () => {
      unsubIncoming?.();
      unsubEnded?.();
    };
  }, [activeCall?.id, incomingCall?.callId]);

  // Start call duration timer
  useEffect(() => {
    if (activeCall?.status === 'active' && !durationIntervalRef.current) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [activeCall?.status]);

  const startCall = useCallback(async (
    receiverId: string,
    type: CallType = 'video',
    conversationId?: string
  ) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Get user media first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Start call on server
      const response = await callsApi.startCall({
        receiverId,
        type,
        conversationId,
      });

      setActiveCall(response.call);
      setLiveKitCredentials(response.liveKit);
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      cleanupMedia();
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const answerCall = useCallback(async () => {
    if (!incomingCall) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === 'video',
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current && incomingCall.type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Answer on server
      const response = await callsApi.answerCall(incomingCall.callId);
      setActiveCall(response.call);
      setLiveKitCredentials(response.liveKit);
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to answer call:', err);
      setError(err instanceof Error ? err.message : 'Failed to answer call');
      cleanupMedia();
    } finally {
      setIsConnecting(false);
    }
  }, [incomingCall]);

  const declineCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      await callsApi.declineCall(incomingCall.callId);
    } catch (err) {
      console.error('Failed to decline call:', err);
    } finally {
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      await callsApi.endCall(activeCall.id);
    } catch (err) {
      console.error('Failed to end call:', err);
    } finally {
      handleCallEnded('ended');
    }
  }, [activeCall]);

  const handleCallEnded = useCallback((reason: string, duration?: number) => {
    cleanupMedia();
    setActiveCall(null);
    setLiveKitCredentials(null);
    setCallDuration(duration || 0);

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const toggleMute = useCallback(async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
        if (activeCall) {
          await callsApi.toggleMute(activeCall.id, !isMuted);
        }
      }
    }
  }, [isMuted, activeCall]);

  const toggleVideo = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
        if (activeCall) {
          await callsApi.toggleVideo(activeCall.id, !isVideoOff);
        }
      }
    }
  }, [isVideoOff, activeCall]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(!isSpeakerOn);
    // In web, speaker toggle is handled differently
    // This is mainly for mobile where you switch between earpiece and speaker
  }, [isSpeakerOn]);

  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      // Get current facing mode
      const settings = videoTrack.getSettings();
      const currentFacing = settings.facingMode || 'user';
      const newFacing = currentFacing === 'user' ? 'environment' : 'user';

      // Stop current track
      videoTrack.stop();

      // Get new stream with opposite camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace track in stream
      localStreamRef.current.removeTrack(videoTrack);
      localStreamRef.current.addTrack(newVideoTrack);

      // Update video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    activeCall,
    incomingCall,
    liveKitCredentials,
    isConnecting,
    error,
    callDuration,
    formattedDuration: formatDuration(callDuration),
    // Media controls
    isMuted,
    isVideoOff,
    isSpeakerOn,
    // Refs
    localVideoRef,
    remoteVideoRef,
    // Actions
    startCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
  };
}
