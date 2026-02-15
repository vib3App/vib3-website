'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';
import type { Call, CallType, IncomingCall, CallEndedEvent } from '@/types/call';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

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

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const callIdRef = useRef<string | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

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
  }, []);

  const createPeerConnection = useCallback((callId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate && user?.id) {
        websocketService.send('call:signal', {
          callId,
          type: 'iceCandidate',
          iceCandidate: e.candidate.toJSON(),
          fromUserId: user.id,
          toUserId: '', // backend relays to the other party
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
        setActiveCall(prev => prev ? { ...prev, status: 'active' } : prev);
        setCallDuration(0);
        durationIntervalRef.current = setInterval(() => {
          setCallDuration(d => d + 1);
        }, 1000);
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        handleCallEnded('failed');
      }
    };

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pcRef.current = pc;
    return pc;
  }, [user?.id]);

  const handleCallEnded = useCallback((reason: string, duration?: number) => {
    cleanupMedia();
    setActiveCall(null);
    setCallDuration(duration || 0);
    setIsConnecting(false);
  }, [cleanupMedia]);

  // --- Socket event listeners ---
  useEffect(() => {
    const unsubIncoming = websocketService.onIncomingCall((call: IncomingCall) => {
      setIncomingCall(call);
    });

    const unsubEnded = websocketService.onCallEnded((event: CallEndedEvent) => {
      if (callIdRef.current === event.callId || activeCall?.id === event.callId) {
        handleCallEnded(event.reason, event.duration);
      }
      if (incomingCall?.callId === event.callId) {
        setIncomingCall(null);
      }
    });

    const unsubAccepted = websocketService.onCallAccepted(async ({ callId }) => {
      if (callIdRef.current !== callId) return;
      // Callee accepted - create offer
      setActiveCall(prev => prev ? { ...prev, status: 'connecting' } : prev);
      try {
        const pc = createPeerConnection(callId);
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
        console.error('Failed to create offer:', err);
        handleCallEnded('failed');
      }
    });

    const unsubRejected = websocketService.onCallRejected(({ callId }) => {
      if (callIdRef.current === callId) {
        handleCallEnded('declined');
      }
    });

    const unsubSignal = websocketService.onCallSignal(async (data) => {
      const { callId, type: sigType, sdp, iceCandidate } = data;
      if (callIdRef.current !== callId) return;
      const pc = pcRef.current;

      if (sigType === 'offer' && pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: sdp! }));
          // Flush any ICE candidates that arrived before the offer
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
            fromUserId: user?.id || '',
            toUserId: '',
          });
        } catch (err) {
          console.error('Failed to handle offer:', err);
        }
      } else if (sigType === 'answer' && pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: sdp! }));
          for (const c of pendingCandidatesRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidatesRef.current = [];
        } catch (err) {
          console.error('Failed to handle answer:', err);
        }
      } else if (sigType === 'iceCandidate' && iceCandidate) {
        if (pc?.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
          } catch (err) {
            console.error('Failed to add ICE candidate:', err);
          }
        } else {
          pendingCandidatesRef.current.push(iceCandidate);
        }
      }
    });

    return () => {
      unsubIncoming();
      unsubEnded();
      unsubAccepted();
      unsubRejected();
      unsubSignal();
    };
  }, [activeCall?.id, incomingCall?.callId, user?.id, createPeerConnection, handleCallEnded]);

  // --- Actions ---
  const startCall = useCallback(async (
    receiverId: string,
    type: CallType = 'video',
    conversationId?: string
  ) => {
    setIsConnecting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Wait for callId from backend via call:registered
      const callIdPromise = new Promise<string>((resolve) => {
        const unsub = websocketService.onCallRegistered(({ callId }) => {
          unsub();
          resolve(callId);
        });
      });

      websocketService.send('call:initiate', {
        chatId: conversationId,
        calleeId: receiverId,
        callerName: user?.username || '',
        callerAvatar: user?.profilePicture || '',
      });

      const callId = await callIdPromise;
      callIdRef.current = callId;

      setActiveCall({
        id: callId,
        type,
        callerId: user?.id || '',
        callerUsername: user?.username || '',
        callerAvatar: user?.profilePicture,
        receiverId,
        receiverUsername: '',
        conversationId,
        status: 'ringing',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      cleanupMedia();
    } finally {
      setIsConnecting(false);
    }
  }, [user, cleanupMedia]);

  const answerCall = useCallback(async () => {
    if (!incomingCall) return;
    setIsConnecting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === 'video',
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && incomingCall.type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const callId = incomingCall.callId;
      callIdRef.current = callId;

      // Create peer connection (will receive offer via signal)
      createPeerConnection(callId);

      // Tell backend we accept
      websocketService.send('call:accept', { callId });

      setActiveCall({
        id: callId,
        type: incomingCall.type,
        callerId: incomingCall.callerId,
        callerUsername: incomingCall.callerUsername,
        callerAvatar: incomingCall.callerAvatar,
        receiverId: user?.id || '',
        receiverUsername: user?.username || '',
        conversationId: incomingCall.conversationId,
        status: 'connecting',
        createdAt: new Date().toISOString(),
      });
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to answer call:', err);
      setError(err instanceof Error ? err.message : 'Failed to answer call');
      cleanupMedia();
    } finally {
      setIsConnecting(false);
    }
  }, [incomingCall, user, createPeerConnection, cleanupMedia]);

  const declineCall = useCallback(() => {
    if (!incomingCall) return;
    websocketService.send('call:reject', { callId: incomingCall.callId });
    setIncomingCall(null);
  }, [incomingCall]);

  const endCall = useCallback(() => {
    if (callIdRef.current) {
      websocketService.send('call:end', { callId: callIdRef.current });
    }
    handleCallEnded('ended');
  }, [handleCallEnded]);

  const toggleMute = useCallback(() => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  }, [isVideoOff]);

  const toggleSpeaker = useCallback(() => setIsSpeakerOn(v => !v), []);

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
      // Replace track in peer connection
      const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
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
    activeCall,
    incomingCall,
    liveKitCredentials: null,
    isConnecting,
    error,
    callDuration,
    formattedDuration: formatDuration(callDuration),
    isMuted,
    isVideoOff,
    isSpeakerOn,
    localVideoRef,
    remoteVideoRef,
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
