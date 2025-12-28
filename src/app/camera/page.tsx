'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { BottomNav } from '@/components/ui/BottomNav';

type RecordingState = 'idle' | 'recording' | 'paused' | 'preview';
type CameraFacing = 'user' | 'environment';

const filters = [
  { name: 'Normal', filter: 'none' },
  { name: 'Vintage', filter: 'sepia(0.5) contrast(1.1)' },
  { name: 'B&W', filter: 'grayscale(1)' },
  { name: 'Warm', filter: 'sepia(0.3) saturate(1.4)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.7)' },
  { name: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
  { name: 'Fade', filter: 'contrast(0.9) brightness(1.1) saturate(0.8)' },
  { name: 'Drama', filter: 'contrast(1.3) brightness(0.9)' },
];

const effects = [
  { name: 'None', icon: '✨' },
  { name: 'Sparkle', icon: '⭐' },
  { name: 'Hearts', icon: '💕' },
  { name: 'Confetti', icon: '🎉' },
  { name: 'Snow', icon: '❄️' },
  { name: 'Fire', icon: '🔥' },
];

const speeds = [
  { label: '0.3x', value: 0.3 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '3x', value: 3 },
];

export default function CameraPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>('user');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState(2); // 1x default
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [maxDuration] = useState(180); // 3 minutes max
  const [flashOn, setFlashOn] = useState(false);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setError(null);
    } catch (err) {
      console.error('Failed to access camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [cameraFacing]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/camera');
      return;
    }

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isAuthenticated, router, initCamera]);

  const flipCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    try {
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
    } catch {
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
    }

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setRecordingState('preview');
    };

    mediaRecorderRef.current.start(100);
    setRecordingState('recording');
    setRecordingDuration(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= maxDuration) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  }, []);

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleRecordButton = () => {
    if (recordingState === 'idle') {
      if (timerMode > 0) {
        setCountdown(timerMode);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              setCountdown(null);
              startRecording();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        startRecording();
      }
    } else if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'paused') {
      resumeRecording();
    }
  };

  const discardRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setRecordedBlob(null);
    setPreviewUrl(null);
    setRecordingState('idle');
    setRecordingDuration(0);
  };

  const handleNext = () => {
    if (recordedBlob) {
      // Store blob in sessionStorage as base64 or use a different method
      // For now, we'll navigate to upload with the blob URL
      sessionStorage.setItem('recordedVideoUrl', previewUrl || '');
      router.push('/upload?from=camera');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera/Preview View */}
      <div className="absolute inset-0">
        {recordingState === 'preview' && previewUrl ? (
          <video
            ref={previewVideoRef}
            src={previewUrl}
            className="w-full h-full object-cover"
            style={{ filter: filters[selectedFilter].filter }}
            autoPlay
            loop
            playsInline
            muted
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{
              filter: filters[selectedFilter].filter,
              transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
            }}
            autoPlay
            playsInline
            muted
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-8xl font-bold text-white animate-pulse">{countdown}</span>
        </div>
      )}

      {/* Top Controls */}
      {recordingState !== 'preview' && (
        <div className="absolute top-4 left-0 right-0 z-10 px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              {/* Flash */}
              <button
                onClick={() => setFlashOn(!flashOn)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  flashOn ? 'bg-yellow-500' : 'bg-black/30'
                }`}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                </svg>
              </button>

              {/* Timer */}
              <button
                onClick={() => setTimerMode(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  timerMode > 0 ? 'bg-[#6366F1]' : 'bg-black/30'
                }`}
              >
                <span className="text-white text-xs font-medium">
                  {timerMode > 0 ? `${timerMode}s` : 'Off'}
                </span>
              </button>

              {/* Flip Camera */}
              <button
                onClick={flipCamera}
                className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recording Duration */}
          {(recordingState === 'recording' || recordingState === 'paused') && (
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                <div className={`w-3 h-3 rounded-full ${
                  recordingState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                }`} />
                <span className="text-white font-mono">{formatTime(recordingDuration)}</span>
                <span className="text-white/50 text-sm">/ {formatTime(maxDuration)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right Side Controls */}
      {recordingState !== 'preview' && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4">
          <button
            onClick={() => { setShowFilters(!showFilters); setShowEffects(false); setShowSpeed(false); }}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
              showFilters ? 'bg-[#6366F1]' : 'bg-black/30'
            }`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span className="text-white text-[10px] mt-0.5">Filters</span>
          </button>

          <button
            onClick={() => { setShowEffects(!showEffects); setShowFilters(false); setShowSpeed(false); }}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
              showEffects ? 'bg-[#6366F1]' : 'bg-black/30'
            }`}
          >
            <span className="text-lg">✨</span>
            <span className="text-white text-[10px] mt-0.5">Effects</span>
          </button>

          <button
            onClick={() => { setShowSpeed(!showSpeed); setShowFilters(false); setShowEffects(false); }}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
              showSpeed ? 'bg-[#6366F1]' : 'bg-black/30'
            }`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-white text-[10px] mt-0.5">Speed</span>
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && recordingState !== 'preview' && (
        <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter, index) => (
              <button
                key={filter.name}
                onClick={() => setSelectedFilter(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden ${
                  selectedFilter === index ? 'ring-2 ring-[#6366F1]' : ''
                }`}
              >
                <div
                  className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500"
                  style={{ filter: filter.filter }}
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-0.5 text-center">
                  {filter.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Effects Panel */}
      {showEffects && recordingState !== 'preview' && (
        <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {effects.map((effect, index) => (
              <button
                key={effect.name}
                onClick={() => setSelectedEffect(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl bg-black/30 flex flex-col items-center justify-center ${
                  selectedEffect === index ? 'ring-2 ring-[#6366F1]' : ''
                }`}
              >
                <span className="text-2xl">{effect.icon}</span>
                <span className="text-white text-[10px] mt-1">{effect.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Speed Panel */}
      {showSpeed && recordingState !== 'preview' && (
        <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
          <div className="flex gap-3 justify-center">
            {speeds.map((speed, index) => (
              <button
                key={speed.label}
                onClick={() => setSelectedSpeed(index)}
                className={`px-4 py-2 rounded-full ${
                  selectedSpeed === index
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-black/30 text-white/70'
                }`}
              >
                {speed.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
        {recordingState === 'preview' ? (
          <div className="flex items-center justify-between">
            <button
              onClick={discardRecording}
              className="w-14 h-14 rounded-full bg-black/30 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full"
            >
              Next
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-8">
            {/* Upload from gallery */}
            <button
              onClick={() => router.push('/upload')}
              className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Record Button */}
            <button
              onClick={handleRecordButton}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                recordingState === 'recording'
                  ? 'border-red-500 bg-transparent'
                  : 'border-white bg-transparent'
              }`}
            >
              {recordingState === 'recording' ? (
                <div className="w-8 h-8 bg-red-500 rounded-md" />
              ) : recordingState === 'paused' ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <div className="w-16 h-16 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Pause Button (when recording) */}
            {recordingState === 'recording' && (
              <button
                onClick={pauseRecording}
                className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
            )}

            {/* Placeholder for symmetry */}
            {recordingState !== 'recording' && (
              <div className="w-12 h-12" />
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
