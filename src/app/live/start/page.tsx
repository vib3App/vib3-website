'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  PhotoIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CalendarIcon,
  SparklesIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  Cog6ToothIcon,
  SignalIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { liveApi } from '@/services/api';
import type { CreateLiveStreamInput } from '@/types';

type StreamMode = 'camera' | 'screen' | 'both';

export default function StartLivePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stream config
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowGuests, setAllowGuests] = useState(true);
  const [maxGuests, setMaxGuests] = useState(4);
  const [scheduledFor, setScheduledFor] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Camera/Audio
  const [streamMode, setStreamMode] = useState<StreamMode>('camera');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  // UI state
  const [step, setStep] = useState<'setup' | 'preview' | 'starting'>('setup');
  const [error, setError] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first
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

  // Start camera preview
  const startPreview = useCallback(async () => {
    try {
      // Stop existing stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }

      let stream: MediaStream;

      if (streamMode === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } else if (streamMode === 'both') {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: selectedCamera ? { deviceId: selectedCamera } : true,
          audio: selectedMic ? { deviceId: selectedMic } : true,
        });
        // Combine streams (screen video + camera audio)
        stream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...cameraStream.getAudioTracks(),
        ]);
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCamera ? { deviceId: selectedCamera } : true,
          audio: selectedMic ? { deviceId: selectedMic } : true,
        });
      }

      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStep('preview');
      setError(null);
    } catch (err) {
      console.error('Failed to start preview:', err);
      setError('Failed to access camera/screen. Please try again.');
    }
  }, [streamMode, selectedCamera, selectedMic, mediaStream]);

  // Capture thumbnail from video
  const captureThumbnail = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.8));
  };

  // Toggle audio/video
  const toggleAudio = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  // Go live
  const handleGoLive = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your stream');
      return;
    }

    setStep('starting');
    setError(null);

    try {
      const input: CreateLiveStreamInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        isPrivate,
        allowGuests,
        maxGuests,
        scheduledFor: isScheduling && scheduledFor ? scheduledFor : undefined,
      };

      const stream = await liveApi.createLiveStream(input);

      if (isScheduling) {
        // Just schedule, don't start
        router.push('/live');
      } else {
        // Start the stream
        await liveApi.startStream(stream.id);
        router.push(`/live/${stream.id}?host=true`);
      }
    } catch (err) {
      console.error('Failed to create stream:', err);
      setError('Failed to create stream. Please try again.');
      setStep('preview');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/live" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Go Live</h1>
          </div>

          {step === 'preview' && (
            <button
              onClick={handleGoLive}
              disabled={!title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-medium transition"
            >
              <SignalIcon className="w-5 h-5" />
              {isScheduling ? 'Schedule' : 'Go Live'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {step === 'setup' && (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Stream Mode */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Stream Source</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setStreamMode('camera')}
                  className={`p-4 rounded-xl border-2 transition ${
                    streamMode === 'camera'
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <VideoCameraIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Camera</div>
                  <div className="text-xs text-gray-400 mt-1">Stream from webcam</div>
                </button>

                <button
                  onClick={() => setStreamMode('screen')}
                  className={`p-4 rounded-xl border-2 transition ${
                    streamMode === 'screen'
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <SparklesIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Screen</div>
                  <div className="text-xs text-gray-400 mt-1">Share your screen</div>
                </button>

                <button
                  onClick={() => setStreamMode('both')}
                  className={`p-4 rounded-xl border-2 transition ${
                    streamMode === 'both'
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <UserGroupIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Both</div>
                  <div className="text-xs text-gray-400 mt-1">Screen + camera overlay</div>
                </button>
              </div>
            </section>

            {/* Device Selection */}
            {streamMode !== 'screen' && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Devices</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Camera</label>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                    >
                      <option value="">Default Camera</option>
                      {cameras.map(cam => (
                        <option key={cam.deviceId} value={cam.deviceId}>
                          {cam.label || `Camera ${cameras.indexOf(cam) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Microphone</label>
                    <select
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                    >
                      <option value="">Default Microphone</option>
                      {mics.map(mic => (
                        <option key={mic.deviceId} value={mic.deviceId}>
                          {mic.label || `Microphone ${mics.indexOf(mic) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            )}

            {/* Start Preview Button */}
            <button
              onClick={startPreview}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-semibold text-lg hover:opacity-90 transition"
            >
              Start Preview
            </button>
          </div>
        )}

        {step === 'preview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Video Preview */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!videoEnabled ? 'opacity-0' : ''}`}
                />

                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoCameraIcon className="w-16 h-16 text-gray-600" />
                  </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    className={`p-3 rounded-full transition ${
                      audioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500'
                    }`}
                  >
                    {audioEnabled ? (
                      <MicrophoneIcon className="w-5 h-5" />
                    ) : (
                      <MicrophoneIcon className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition ${
                      videoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500'
                    }`}
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={captureThumbnail}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                    title="Capture thumbnail"
                  >
                    <PhotoIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setStep('setup')}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Preview */}
              {thumbnailUrl && (
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="w-24 aspect-video object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Custom Thumbnail</div>
                    <div className="text-xs text-gray-400">Captured from preview</div>
                  </div>
                  <button
                    onClick={() => setThumbnailUrl(null)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Stream Settings */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Stream Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your stream about?"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers what to expect..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Privacy</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                      !isPrivate
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <GlobeAltIcon className="w-5 h-5" />
                    Public
                  </button>
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                      isPrivate
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <LockClosedIcon className="w-5 h-5" />
                    Private
                  </button>
                </div>
              </div>

              {/* Guest Settings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">Allow Guests</div>
                    <div className="text-sm text-gray-400">Let viewers join your stream</div>
                  </div>
                  <button
                    onClick={() => setAllowGuests(!allowGuests)}
                    className={`w-12 h-6 rounded-full transition ${
                      allowGuests ? 'bg-pink-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        allowGuests ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {allowGuests && (
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-400">Max guests:</label>
                    <select
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(Number(e.target.value))}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Schedule Toggle */}
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Schedule for later</div>
                    <div className="text-sm text-gray-400">Set a time to go live</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduling(!isScheduling)}
                  className={`w-12 h-6 rounded-full transition ${
                    isScheduling ? 'bg-pink-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      isScheduling ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {isScheduling && (
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                />
              )}
            </div>
          </div>
        )}

        {step === 'starting' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-semibold mb-2">
              {isScheduling ? 'Scheduling your stream...' : 'Starting your stream...'}
            </h2>
            <p className="text-gray-400">Please wait...</p>
          </div>
        )}
      </main>
    </div>
  );
}
