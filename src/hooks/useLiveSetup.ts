'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { liveApi } from '@/services/api';
import type { CreateLiveStreamInput, LiveKitCredentials } from '@/types';

export type StreamMode = 'camera' | 'screen' | 'both';
export type SetupStep = 'setup' | 'preview' | 'starting' | 'live';

export function useLiveSetup() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowGuests, setAllowGuests] = useState(true);
  const [maxGuests, setMaxGuests] = useState(4);
  const [scheduledFor, setScheduledFor] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const [streamMode, setStreamMode] = useState<StreamMode>('camera');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  const [step, setStep] = useState<SetupStep>('setup');
  const [error, setError] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [liveKitCredentials, setLiveKitCredentials] = useState<LiveKitCredentials | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter(d => d.kind === 'videoinput'));
        setMics(devices.filter(d => d.kind === 'audioinput'));
      } catch (err) {
        console.error('Failed to get devices:', err);
        setError('Camera/microphone access denied. Please grant permissions.');
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const startPreview = useCallback(async () => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      let stream: MediaStream;
      if (streamMode === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else if (streamMode === 'both') {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: selectedCamera ? { deviceId: selectedCamera } : true,
          audio: selectedMic ? { deviceId: selectedMic } : true,
        });
        stream = new MediaStream([...screenStream.getVideoTracks(), ...cameraStream.getAudioTracks()]);
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCamera ? { deviceId: selectedCamera } : true,
          audio: selectedMic ? { deviceId: selectedMic } : true,
        });
      }
      setMediaStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStep('preview');
      setError(null);
    } catch (err) {
      console.error('Failed to start preview:', err);
      setError('Failed to access camera/screen. Please try again.');
    }
  }, [streamMode, selectedCamera, selectedMic, mediaStream]);

  const captureThumbnail = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.8));
  }, []);

  const toggleAudio = useCallback(() => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => { track.enabled = !audioEnabled; });
      setAudioEnabled(!audioEnabled);
    }
  }, [mediaStream, audioEnabled]);

  const toggleVideo = useCallback(() => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => { track.enabled = !videoEnabled; });
      setVideoEnabled(!videoEnabled);
    }
  }, [mediaStream, videoEnabled]);

  const handleGoLive = useCallback(async () => {
    setStep('starting');
    setError(null);
    try {
      // Use default title if none provided
      const streamTitle = title.trim() || `Live Stream`;
      const input: CreateLiveStreamInput = {
        title: streamTitle,
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        isPrivate,
        allowGuests,
        maxGuests,
        scheduledFor: isScheduling && scheduledFor ? scheduledFor : undefined,
      };

      if (isScheduling) {
        // Just create a scheduled stream
        await liveApi.createLiveStream(input);
        router.push('/live');
      } else {
        // Start the stream and get LiveKit credentials
        const response = await liveApi.startStream(input);
        const newStreamId = (response.stream as any)._id || response.stream.id;
        setStreamId(newStreamId);

        if (response.liveKit) {
          setLiveKitCredentials(response.liveKit);
          setStep('live');
          // Don't navigate - stay on page with LiveKit room
        } else {
          setError('Live streaming setup failed. Please try again or contact support.');
          setStep('preview');
        }
      }
    } catch (err: any) {
      console.error('Failed to create stream:', err);
      // Show specific error messages
      if (err?.response?.status === 401) {
        setError('Please login to start a live stream.');
      } else if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create stream. Please try again.');
      }
      setStep('preview');
    }
  }, [title, description, thumbnailUrl, isPrivate, allowGuests, maxGuests, isScheduling, scheduledFor, router]);

  const endStream = useCallback(async () => {
    if (streamId) {
      try {
        await liveApi.endStream(streamId);
      } catch (err) {
        console.error('Failed to end stream:', err);
      }
    }
    // Stop media tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setStep('setup');
    setStreamId(null);
    setLiveKitCredentials(null);
    router.push('/live');
  }, [streamId, mediaStream, router]);

  return {
    videoRef, canvasRef, title, setTitle, description, setDescription,
    isPrivate, setIsPrivate, allowGuests, setAllowGuests, maxGuests, setMaxGuests,
    scheduledFor, setScheduledFor, thumbnailUrl, setThumbnailUrl,
    streamMode, setStreamMode, audioEnabled, videoEnabled,
    selectedCamera, setSelectedCamera, selectedMic, setSelectedMic,
    cameras, mics, step, setStep, error, isScheduling, setIsScheduling,
    startPreview, captureThumbnail, toggleAudio, toggleVideo, handleGoLive,
    streamId, liveKitCredentials, mediaStream, endStream,
  };
}
