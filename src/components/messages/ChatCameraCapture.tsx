'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ChatCameraCaptureProps {
  onCapture: (file: File, type: 'image' | 'video') => void;
  onClose: () => void;
}

/** Quick capture modal for taking photo/video in chat */
export function ChatCameraCapture({ onCapture, onClose }: ChatCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        onCapture(file, 'image');
      }
    }, 'image/jpeg', 0.85);
  }, [onCapture]); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
      stopCamera();
      onCapture(file, 'video');
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  }, [onCapture]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handlePickFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      stopCamera();
      onCapture(file, type);
    };
    input.click();
  }, [onCapture]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="w-full max-w-md mx-4 glass-heavy rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-medium text-sm">Quick Capture</h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Camera preview */}
        <div className="relative aspect-[4/3] bg-black">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm text-center px-4">
              {error}
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
          {isRecording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500/80 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-mono">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 py-4">
          <button onClick={handlePickFile} className="w-10 h-10 glass rounded-full flex items-center justify-center text-white/60 hover:text-white" title="Pick file">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {!isRecording ? (
            <button onClick={takePhoto} className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/10 transition" title="Take photo">
              <div className="w-10 h-10 bg-white rounded-full" />
            </button>
          ) : (
            <button onClick={stopRecording} className="w-14 h-14 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-500/20" title="Stop recording">
              <div className="w-5 h-5 bg-red-500 rounded-sm" />
            </button>
          )}

          {!isRecording ? (
            <button onClick={startRecording} className="w-10 h-10 glass rounded-full flex items-center justify-center text-red-400 hover:text-red-300" title="Record video">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>
    </div>
  );
}
