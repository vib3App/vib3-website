'use client';

import { useState, useEffect, useCallback } from 'react';
import { websocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';
import type { Call, CallType, IncomingCall, CallEndedEvent } from '@/types/call';
import { logger } from '@/utils/logger';
import { useWebRTCRefs, useWebRTCConnection } from './useWebRTC';
import {
  useCallMediaControls,
  acquireCallMedia,
  waitForCallRegistered,
  formatCallDuration,
} from './useCallActions';
import { useCallFallback } from './useCallFallback';

export function useVideoCall() {
  const user = useAuthStore((s) => s.user);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const refs = useWebRTCRefs();

  const onConnected = useCallback(() => {
    setActiveCall(prev => prev ? { ...prev, status: 'active' } : prev);
    setCallDuration(0);
    refs.durationIntervalRef.current = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
  }, [refs.durationIntervalRef]);

  const handleCallEnded = useCallback((reason: string, duration?: number) => {
    rtc.cleanupMedia();
    setActiveCall(null);
    setCallDuration(duration || 0);
    setIsConnecting(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- rtc is stable

  const onFailed = useCallback(() => {
    handleCallEnded('failed');
  }, [handleCallEnded]);

  const rtc = useWebRTCConnection(refs, user?.id, onConnected, onFailed);
  const mediaControls = useCallMediaControls(refs);

  // Gap #59: Call fallback with TURN relay / LiveKit
  const callFallback = useCallFallback({
    callId: refs.callIdRef.current,
    pcRef: refs.pcRef,
    localStreamRef: refs.localStreamRef,
    remoteVideoRef: refs.remoteVideoRef,
    userId: user?.id,
    onReconnected: onConnected,
    onFailed,
  });

  // --- Socket event listeners ---
  useEffect(() => {
    const unsubIncoming = websocketService.onIncomingCall((call: IncomingCall) => {
      setIncomingCall(call);
    });

    const unsubEnded = websocketService.onCallEnded((event: CallEndedEvent) => {
      if (refs.callIdRef.current === event.callId || activeCall?.id === event.callId) {
        handleCallEnded(event.reason, event.duration);
      }
      if (incomingCall?.callId === event.callId) {
        setIncomingCall(null);
      }
    });

    const unsubAccepted = websocketService.onCallAccepted(async ({ callId }) => {
      if (refs.callIdRef.current !== callId) return;
      setActiveCall(prev => prev ? { ...prev, status: 'connecting' } : prev);
      try {
        const pc = rtc.createPeerConnection(callId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        websocketService.send('call:signal', {
          callId,
          type: 'offer',
          sdp: offer.sdp,
          fromUserId: user?.id || '',
          toUserId: '',
        });
      } catch (err) {
        logger.error('Failed to create offer:', err);
        handleCallEnded('failed');
      }
    });

    const unsubRejected = websocketService.onCallRejected(({ callId }) => {
      if (refs.callIdRef.current === callId) {
        handleCallEnded('declined');
      }
    });

    const unsubSignal = websocketService.onCallSignal(rtc.handleSignal);

    return () => {
      unsubIncoming();
      unsubEnded();
      unsubAccepted();
      unsubRejected();
      unsubSignal();
    };
  }, [activeCall?.id, incomingCall?.callId, user?.id, rtc, refs.callIdRef, handleCallEnded]);

  // --- Actions ---
  const startCall = useCallback(async (
    receiverId: string,
    type: CallType = 'video',
    conversationId?: string,
  ) => {
    setIsConnecting(true);
    setError(null);
    try {
      await acquireCallMedia(type, refs.localStreamRef, refs.localVideoRef);
      websocketService.send('call:initiate', {
        chatId: conversationId,
        calleeId: receiverId,
        callerName: user?.username || '',
        callerAvatar: user?.profilePicture || '',
      });
      const callId = await waitForCallRegistered();
      refs.callIdRef.current = callId;

      setActiveCall({
        id: callId, type, callerId: user?.id || '',
        callerUsername: user?.username || '', callerAvatar: user?.profilePicture,
        receiverId, receiverUsername: '', conversationId,
        status: 'ringing', createdAt: new Date().toISOString(),
      });
    } catch (err) {
      logger.error('Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      rtc.cleanupMedia();
    } finally {
      setIsConnecting(false);
    }
  }, [user, rtc, refs]);

  const answerCall = useCallback(async () => {
    if (!incomingCall) return;
    setIsConnecting(true);
    setError(null);
    try {
      await acquireCallMedia(incomingCall.type, refs.localStreamRef, refs.localVideoRef);
      const callId = incomingCall.callId;
      refs.callIdRef.current = callId;
      rtc.createPeerConnection(callId);
      websocketService.send('call:accept', { callId });

      setActiveCall({
        id: callId, type: incomingCall.type,
        callerId: incomingCall.callerId, callerUsername: incomingCall.callerUsername,
        callerAvatar: incomingCall.callerAvatar,
        receiverId: user?.id || '', receiverUsername: user?.username || '',
        conversationId: incomingCall.conversationId,
        status: 'connecting', createdAt: new Date().toISOString(),
      });
      setIncomingCall(null);
    } catch (err) {
      logger.error('Failed to answer call:', err);
      setError(err instanceof Error ? err.message : 'Failed to answer call');
      rtc.cleanupMedia();
    } finally {
      setIsConnecting(false);
    }
  }, [incomingCall, user, rtc, refs]);

  const declineCall = useCallback(() => {
    if (!incomingCall) return;
    websocketService.send('call:reject', { callId: incomingCall.callId });
    setIncomingCall(null);
  }, [incomingCall]);

  const endCall = useCallback(() => {
    if (refs.callIdRef.current) {
      websocketService.send('call:end', { callId: refs.callIdRef.current });
    }
    handleCallEnded('ended');
  }, [handleCallEnded, refs.callIdRef]);

  const toggleMute = useCallback(() => {
    const newVal = mediaControls.toggleMute(isMuted);
    setIsMuted(newVal);
  }, [isMuted, mediaControls]);

  const toggleVideo = useCallback(() => {
    const newVal = mediaControls.toggleVideo(isVideoOff);
    setIsVideoOff(newVal);
  }, [isVideoOff, mediaControls]);

  const toggleSpeaker = useCallback(() => setIsSpeakerOn(v => !v), []);

  return {
    activeCall, incomingCall, liveKitCredentials: null,
    isConnecting, error, callDuration,
    formattedDuration: formatCallDuration(callDuration),
    isMuted, isVideoOff, isSpeakerOn,
    localVideoRef: refs.localVideoRef, remoteVideoRef: refs.remoteVideoRef,
    startCall, answerCall, declineCall, endCall,
    toggleMute, toggleVideo, toggleSpeaker,
    switchCamera: mediaControls.switchCamera,
    // Gap #58: Speaker device selection
    selectSpeaker: mediaControls.selectSpeaker,
    getAudioOutputDevices: mediaControls.getAudioOutputDevices,
    // Gap #59: Call fallback state
    fallbackState: callFallback.fallbackState,
    startFallbackMonitoring: callFallback.startMonitoring,
  };
}
