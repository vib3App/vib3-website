'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collaborationApi } from '@/services/api';
import type { CollabRoom } from '@/types/collaboration';

interface UseCollabRoomReturn {
  room: CollabRoom | null;
  loading: boolean;
  error: string | null;
  isCreator: boolean;
  isReady: boolean;
  hasSubmitted: boolean;
  allReady: boolean;
  allSubmitted: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  mediaStream: MediaStream | null;
  isRecording: boolean;
  recordedUrl: string | null;
  uploadProgress: number;
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  copied: boolean;
  startPreview: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  retryRecording: () => void;
  submitClip: () => Promise<void>;
  toggleReady: () => Promise<void>;
  handleStartSession: () => Promise<void>;
  handleFinalize: () => Promise<void>;
  handleLeave: () => Promise<void>;
  copyInviteCode: () => void;
  shareLink: () => void;
  inviteUser: (userId: string) => Promise<void>;
}

export function useCollabRoom(roomId: string): UseCollabRoomReturn {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [room, setRoom] = useState<CollabRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isCreator = room?.creatorId === 'current-user-id';

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await collaborationApi.getCollabRoom(roomId);
        setRoom(data);
        const currentParticipant = data.participants.find(p => p.userId === 'current-user-id');
        if (currentParticipant) {
          setIsReady(currentParticipant.isReady);
          setHasSubmitted(currentParticipant.hasRecorded);
        }
      } catch (err) {
        console.error('Failed to fetch room:', err);
        setError('Room not found');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [mediaStream, recordedUrl]);

  const startPreview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to get media:', err);
      alert('Failed to access camera/microphone');
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaStream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp9' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  }, [mediaStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const retryRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
  }, [recordedUrl]);

  const submitClip = useCallback(async () => {
    if (!recordedBlob) return;
    try {
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }
      await collaborationApi.submitClip(roomId, 'uploaded-clip-url');
      setHasSubmitted(true);
      setUploadProgress(0);
    } catch (err) {
      console.error('Failed to submit clip:', err);
      alert('Failed to submit clip');
      setUploadProgress(0);
    }
  }, [recordedBlob, roomId]);

  const toggleReady = useCallback(async () => {
    try {
      await collaborationApi.setReady(roomId, !isReady);
      setIsReady(!isReady);
    } catch (err) {
      console.error('Failed to set ready:', err);
    }
  }, [roomId, isReady]);

  const handleStartSession = useCallback(async () => {
    try {
      await collaborationApi.startRecording(roomId);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }, [roomId]);

  const handleFinalize = useCallback(async () => {
    try {
      const result = await collaborationApi.finalizeCollab(roomId);
      router.push(`/video/${result.videoId}`);
    } catch (err) {
      console.error('Failed to finalize:', err);
      alert('Failed to finalize collab');
    }
  }, [roomId, router]);

  const handleLeave = useCallback(async () => {
    if (!confirm('Are you sure you want to leave this collab?')) return;
    try {
      await collaborationApi.leaveCollabRoom(roomId);
      router.push('/collab');
    } catch (err) {
      console.error('Failed to leave:', err);
    }
  }, [roomId, router]);

  const copyInviteCode = useCallback(() => {
    if (room?.inviteCode) {
      navigator.clipboard.writeText(room.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [room?.inviteCode]);

  const shareLink = useCallback(() => {
    const url = `${window.location.origin}/collab/${roomId}`;
    if (room?.inviteCode) {
      navigator.clipboard.writeText(`${url}?code=${room.inviteCode}`);
    } else {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId, room?.inviteCode]);

  const inviteUser = useCallback(async (userId: string) => {
    try {
      await collaborationApi.inviteUser(roomId, userId);
    } catch (err: any) {
      console.error('Failed to invite user:', err);
      const message = err?.message || 'Failed to send invite';
      throw new Error(message);
    }
  }, [roomId]);

  const allReady = room?.participants.every(p => p.isReady) ?? false;
  const allSubmitted = room?.participants.every(p => p.hasRecorded) ?? false;

  return {
    room,
    loading,
    error,
    isCreator,
    isReady,
    hasSubmitted,
    allReady,
    allSubmitted,
    videoRef,
    mediaStream,
    isRecording,
    recordedUrl,
    uploadProgress,
    showShareModal,
    setShowShareModal,
    copied,
    startPreview,
    startRecording,
    stopRecording,
    retryRecording,
    submitClip,
    toggleReady,
    handleStartSession,
    handleFinalize,
    handleLeave,
    copyInviteCode,
    shareLink,
    inviteUser,
  };
}
