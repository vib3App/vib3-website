'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collaborationApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
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
  const { user } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const confirmDialog = useConfirmStore(s => s.show);
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

  const userId = user?.id;
  const isCreator = room?.creatorId === userId;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await collaborationApi.getCollabRoom(roomId);
        setRoom(data);
        if (userId) {
          const currentParticipant = data.participants.find(p => p.userId === userId);
          if (currentParticipant) {
            setIsReady(currentParticipant.isReady);
            setHasSubmitted(currentParticipant.hasRecorded);
          }
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
  }, [roomId, userId]);

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
      addToast('Failed to access camera/microphone');
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
      setUploadProgress(10);
      // Upload the recorded blob as a file
      const formData = new FormData();
      formData.append('clip', recordedBlob, `clip-${Date.now()}.webm`);

      const xhr = new XMLHttpRequest();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vib3app.net';

      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 90) + 10);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', `${apiUrl}/api/collab/rooms/${roomId}/submit`);
        const token = localStorage.getItem('auth_token');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      setHasSubmitted(true);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      console.error('Failed to submit clip:', err);
      addToast('Failed to submit clip');
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
      addToast('Failed to finalize collab');
    }
  }, [roomId, router]);

  const handleLeave = useCallback(async () => {
    const ok = await confirmDialog({ title: 'Leave Collab', message: 'Are you sure you want to leave this collab?' });
    if (!ok) return;
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

  const inviteUser = useCallback(async (inviteUserId: string) => {
    try {
      await collaborationApi.inviteUser(roomId, inviteUserId);
    } catch (err: unknown) {
      console.error('Failed to invite user:', err);
      const message = (err as Error)?.message || 'Failed to send invite';
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
