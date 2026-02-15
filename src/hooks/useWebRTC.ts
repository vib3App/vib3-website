'use client';

import { useCallback, useRef } from 'react';
import { websocketService } from '@/services/websocket';
import { logger } from '@/utils/logger';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export interface WebRTCRefs {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  pcRef: React.MutableRefObject<RTCPeerConnection | null>;
  callIdRef: React.MutableRefObject<string | null>;
  pendingCandidatesRef: React.MutableRefObject<RTCIceCandidateInit[]>;
  durationIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function useWebRTCRefs(): WebRTCRefs {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const callIdRef = useRef<string | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  return {
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    pcRef,
    callIdRef,
    pendingCandidatesRef,
    durationIntervalRef,
  };
}

export function useWebRTCConnection(
  refs: WebRTCRefs,
  userId: string | undefined,
  onConnected: () => void,
  onFailed: () => void,
) {
  const {
    localVideoRef, remoteVideoRef, localStreamRef,
    pcRef, callIdRef, pendingCandidatesRef, durationIntervalRef,
  } = refs;

  const cleanupMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    callIdRef.current = null;
    pendingCandidatesRef.current = [];
  }, [localVideoRef, remoteVideoRef, localStreamRef, pcRef, callIdRef, pendingCandidatesRef, durationIntervalRef]);

  const createPeerConnection = useCallback((callId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

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

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        onConnected();
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        onFailed();
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pcRef.current = pc;
    return pc;
  }, [userId, localStreamRef, pcRef, remoteVideoRef, onConnected, onFailed]);

  const handleSignal = useCallback(async (data: {
    callId: string;
    type: string;
    sdp?: string;
    iceCandidate?: RTCIceCandidateInit;
  }) => {
    const { callId, type: sigType, sdp, iceCandidate } = data;
    if (callIdRef.current !== callId) return;
    const pc = pcRef.current;

    if (sigType === 'offer' && pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: sdp! }));
        for (const c of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        websocketService.send('call:signal', {
          callId,
          type: 'answer',
          sdp: answer.sdp,
          fromUserId: userId || '',
          toUserId: '',
        });
      } catch (err) {
        logger.error('Failed to handle offer:', err);
      }
    } else if (sigType === 'answer' && pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: sdp! }));
        for (const c of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidatesRef.current = [];
      } catch (err) {
        logger.error('Failed to handle answer:', err);
      }
    } else if (sigType === 'iceCandidate' && iceCandidate) {
      if (pc?.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
        } catch (err) {
          logger.error('Failed to add ICE candidate:', err);
        }
      } else {
        pendingCandidatesRef.current.push(iceCandidate);
      }
    }
  }, [callIdRef, pcRef, pendingCandidatesRef, userId]);

  return { cleanupMedia, createPeerConnection, handleSignal };
}
