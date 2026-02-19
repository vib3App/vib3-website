'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '@/services/websocket';
import { logger } from '@/utils/logger';

export type FallbackState = 'p2p' | 'reconnecting' | 'turn-relay' | 'livekit-fallback' | 'failed';

const ICE_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

const TURN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:turn.vib3app.net:3478',
    username: 'vib3',
    credential: 'vib3turn',
  },
];

interface UseCallFallbackOptions {
  callId: string | null;
  pcRef: React.MutableRefObject<RTCPeerConnection | null>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  userId?: string;
  onReconnected?: () => void;
  onFailed?: () => void;
}

export function useCallFallback({
  callId,
  pcRef,
  localStreamRef,
  remoteVideoRef,
  userId,
  onReconnected,
  onFailed,
}: UseCallFallbackOptions) {
  const [state, setState] = useState<FallbackState>('p2p');
  const [retryCount, setRetryCount] = useState(0);
  const iceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringRef = useRef(false);

  const clearIceTimer = useCallback(() => {
    if (iceTimerRef.current) {
      clearTimeout(iceTimerRef.current);
      iceTimerRef.current = null;
    }
  }, []);

  // Request LiveKit fallback from server
  const requestLiveKitFallback = useCallback(() => {
    if (!callId) return;
    setState('livekit-fallback');
    logger.info('Requesting LiveKit fallback for call:', callId);
    websocketService.send('call:request-fallback', { callId, type: 'livekit' });
  }, [callId]);

  // Use a ref for handleConnectionFailure to break the circular dependency
  const handleConnectionFailureRef = useRef<() => void>(() => {});

  // Attempt reconnection via TURN relay
  const attemptTurnReconnect = useCallback(async () => {
    if (!callId || !localStreamRef.current) return false;
    setState('turn-relay');
    logger.info('Attempting TURN relay reconnect for call:', callId);

    try {
      pcRef.current?.close();

      const pc = new RTCPeerConnection({ iceServers: TURN_SERVERS, iceTransportPolicy: 'relay' });

      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && userId) {
          websocketService.send('call:signal', {
            callId,
            type: 'iceCandidate',
            iceCandidate: e.candidate.toJSON(),
            fromUserId: userId,
            toUserId: '',
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setState('turn-relay');
          onReconnected?.();
        }
        if (pc.connectionState === 'failed') {
          handleConnectionFailureRef.current();
        }
      };

      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pcRef.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      websocketService.send('call:signal', {
        callId,
        type: 'offer',
        sdp: offer.sdp,
        fromUserId: userId || '',
        toUserId: '',
      });

      return true;
    } catch (err) {
      logger.error('TURN reconnect failed:', err);
      return false;
    }
  }, [callId, localStreamRef, pcRef, remoteVideoRef, userId, onReconnected]);

  const handleConnectionFailure = useCallback(() => {
    setRetryCount((prev) => {
      const next = prev + 1;
      if (next <= MAX_RETRIES) {
        setState('reconnecting');
        attemptTurnReconnect();
      } else {
        requestLiveKitFallback();
      }
      return next;
    });
  }, [attemptTurnReconnect, requestLiveKitFallback]);

  // Keep ref in sync
  handleConnectionFailureRef.current = handleConnectionFailure;

  // Monitor ICE connection state
  const startMonitoring = useCallback(() => {
    if (monitoringRef.current) return;
    monitoringRef.current = true;

    const pc = pcRef.current;
    if (!pc) return;

    const checkIce = () => {
      const iceState = pc.iceConnectionState;
      if (iceState === 'connected' || iceState === 'completed') {
        clearIceTimer();
        setState('p2p');
      } else if (iceState === 'failed' || iceState === 'disconnected') {
        clearIceTimer();
        handleConnectionFailure();
      }
    };

    pc.addEventListener('iceconnectionstatechange', checkIce);

    // Start ICE timeout
    iceTimerRef.current = setTimeout(() => {
      const iceState = pc.iceConnectionState;
      if (iceState !== 'connected' && iceState !== 'completed') {
        logger.warn('ICE connection timed out after', ICE_TIMEOUT_MS, 'ms');
        handleConnectionFailure();
      }
    }, ICE_TIMEOUT_MS);
  }, [pcRef, clearIceTimer, handleConnectionFailure]);

  // Listen for LiveKit fallback credentials from server
  useEffect(() => {
    const unsub = websocketService.onCallAccepted((data) => {
      if (state === 'livekit-fallback') {
        // Server responded with LiveKit credentials
        logger.info('LiveKit fallback credentials received');
        onReconnected?.();
      }
    });
    return unsub;
  }, [state, onReconnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearIceTimer();
      monitoringRef.current = false;
    };
  }, [clearIceTimer]);

  // If all retries fail and LiveKit also fails, call onFailed
  useEffect(() => {
    if (retryCount > MAX_RETRIES + 1) {
      setState('failed');
      onFailed?.();
    }
  }, [retryCount, onFailed]);

  return {
    fallbackState: state,
    retryCount,
    startMonitoring,
    attemptTurnReconnect,
    requestLiveKitFallback,
  };
}
