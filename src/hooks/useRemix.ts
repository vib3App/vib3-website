'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { collaborationApi, videoApi } from '@/services/api';
import { useToastStore } from '@/stores/toastStore';
import type { RemixType } from '@/types/collaboration';
import type { Video } from '@/types';

interface RemixPermissions {
  allowEcho: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  allowRemix: boolean;
}

export function useRemix() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const addToast = useToastStore(s => s.addToast);
  const videoId = params.videoId as string;
  const typeParam = searchParams.get('type') as RemixType | null;

  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [originalVideo, setOriginalVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<RemixPermissions>({
    allowEcho: true,
    allowDuet: true,
    allowStitch: true,
    allowRemix: true,
  });

  const [remixType, setRemixType] = useState<RemixType>(typeParam || 'duet');
  const [splitPosition, setSplitPosition] = useState(50);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [video, perms] = await Promise.all([
          videoApi.getVideo(videoId),
          collaborationApi.checkRemixPermission(videoId),
        ]);
        setOriginalVideo(video);
        setPermissions(perms);
      } catch (err) {
        console.error('Failed to fetch video:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [videoId]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      addToast('Failed to access camera/microphone');
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaStream || !originalVideoRef.current) return;

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

    originalVideoRef.current.currentTime = 0;
    originalVideoRef.current.play();
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setIsPlaying(true);
  }, [mediaStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      originalVideoRef.current?.pause();
      setIsRecording(false);
      setIsPlaying(false);
    }
  }, [isRecording]);

  const retryRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    if (originalVideoRef.current) originalVideoRef.current.currentTime = 0;
  }, [recordedUrl]);

  const togglePlayback = useCallback(() => {
    if (!originalVideoRef.current) return;
    if (isPlaying) {
      originalVideoRef.current.pause();
    } else {
      originalVideoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSubmit = useCallback(async () => {
    if (!recordedBlob || !originalVideo) return;

    setUploading(true);
    try {
      const remix = await collaborationApi.createRemix(remixType, videoId, 'uploaded-video-url', {
        title: title || undefined,
        description: description || undefined,
        splitPosition: remixType === 'duet' ? splitPosition : undefined,
      });
      router.push(`/video/${remix.id}`);
    } catch (err) {
      console.error('Failed to create remix:', err);
      addToast('Failed to create remix');
    } finally {
      setUploading(false);
    }
  }, [recordedBlob, originalVideo, remixType, videoId, title, description, splitPosition, router]);

  useEffect(() => {
    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [mediaStream, recordedUrl]);

  const canRemix = permissions[`allow${remixType.charAt(0).toUpperCase() + remixType.slice(1)}` as keyof RemixPermissions];

  return {
    videoId,
    originalVideo,
    loading,
    permissions,
    remixType,
    setRemixType,
    splitPosition,
    setSplitPosition,
    mediaStream,
    isRecording,
    isPlaying,
    recordedBlob,
    recordedUrl,
    title,
    setTitle,
    description,
    setDescription,
    uploading,
    canRemix,
    originalVideoRef,
    cameraVideoRef,
    startCamera,
    startRecording,
    stopRecording,
    retryRecording,
    togglePlayback,
    handleSubmit,
  };
}
