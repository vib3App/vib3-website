'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline';
import { collaborationApi, videoApi } from '@/services/api';
import type { RemixType } from '@/types/collaboration';
import type { Video } from '@/types';

const REMIX_TYPES: Record<RemixType, { label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  echo: { label: 'Echo', description: 'React to the video', icon: MicrophoneIcon },
  duet: { label: 'Duet', description: 'Side-by-side video', icon: ArrowsRightLeftIcon },
  stitch: { label: 'Stitch', description: 'Add to beginning', icon: ScissorsIcon },
  remix: { label: 'Remix', description: 'Create your version', icon: ArrowPathIcon },
};

export default function RemixPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const typeParam = searchParams.get('type') as RemixType | null;

  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Original video
  const [originalVideo, setOriginalVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    allowEcho: true,
    allowDuet: true,
    allowStitch: true,
    allowRemix: true,
  });

  // Remix settings
  const [remixType, setRemixType] = useState<RemixType>(typeParam || 'duet');
  const [splitPosition, setSplitPosition] = useState(50);

  // Recording state
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // Upload state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch original video and permissions
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

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      alert('Failed to access camera/microphone');
    }
  };

  // Start recording (synced with original video)
  const startRecording = () => {
    if (!mediaStream || !originalVideoRef.current) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm;codecs=vp9',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
    };

    // Start original video and recording together
    originalVideoRef.current.currentTime = 0;
    originalVideoRef.current.play();
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setIsPlaying(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (originalVideoRef.current) {
        originalVideoRef.current.pause();
      }
      setIsRecording(false);
      setIsPlaying(false);
    }
  };

  // Retry recording
  const retryRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    if (originalVideoRef.current) {
      originalVideoRef.current.currentTime = 0;
    }
  };

  // Toggle playback for preview
  const togglePlayback = () => {
    if (!originalVideoRef.current) return;

    if (isPlaying) {
      originalVideoRef.current.pause();
    } else {
      originalVideoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Submit remix
  const handleSubmit = async () => {
    if (!recordedBlob || !originalVideo) return;

    setUploading(true);
    try {
      // In production, upload video first
      const remix = await collaborationApi.createRemix(
        remixType,
        videoId,
        'uploaded-video-url',
        {
          title: title || undefined,
          description: description || undefined,
          splitPosition: remixType === 'duet' ? splitPosition : undefined,
        }
      );

      router.push(`/video/${remix.id}`);
    } catch (err) {
      console.error('Failed to create remix:', err);
      alert('Failed to create remix');
    } finally {
      setUploading(false);
    }
  };

  // Cleanup
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!originalVideo) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <VideoCameraIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Video not found</h1>
        <Link href="/" className="text-pink-400 hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const canRemix = permissions[`allow${remixType.charAt(0).toUpperCase() + remixType.slice(1)}` as keyof typeof permissions];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/video/${videoId}`} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold">Create {REMIX_TYPES[remixType].label}</h1>
          </div>

          {recordedBlob && (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              {uploading ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Remix Type Selector */}
        {!recordedBlob && (
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {(Object.entries(REMIX_TYPES) as [RemixType, typeof REMIX_TYPES[RemixType]][]).map(([type, config]) => {
              const isAllowed = permissions[`allow${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof permissions];
              const Icon = config.icon;

              return (
                <button
                  key={type}
                  onClick={() => setRemixType(type)}
                  disabled={!isAllowed}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                    remixType === type
                      ? 'bg-pink-500 text-white'
                      : isAllowed
                      ? 'bg-white/10 hover:bg-white/20'
                      : 'bg-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        )}

        {!canRemix ? (
          <div className="text-center py-20">
            <XMarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">
              {REMIX_TYPES[remixType].label} not allowed
            </h2>
            <p className="text-gray-400">
              The creator has disabled {REMIX_TYPES[remixType].label.toLowerCase()} for this video.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Preview Area */}
            <div className="lg:col-span-2">
              {/* Layout based on remix type */}
              <div className={`relative rounded-2xl overflow-hidden bg-gray-900 ${
                remixType === 'duet' ? 'aspect-video' : 'aspect-[9/16] max-w-sm mx-auto'
              }`}>
                {remixType === 'duet' ? (
                  // Side by side for duet
                  <div className="absolute inset-0 flex">
                    <div style={{ width: `${splitPosition}%` }} className="relative">
                      <video
                        ref={originalVideoRef}
                        src={originalVideo.videoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        loop={!isRecording}
                      />
                    </div>
                    <div style={{ width: `${100 - splitPosition}%` }} className="relative bg-gray-800">
                      {recordedUrl ? (
                        <video
                          src={recordedUrl}
                          className="absolute inset-0 w-full h-full object-cover"
                          playsInline
                        />
                      ) : (
                        <video
                          ref={cameraVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                        />
                      )}
                      {!mediaStream && !recordedUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <VideoCameraIcon className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : remixType === 'stitch' ? (
                  // Stacked for stitch
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 relative bg-gray-800">
                      {recordedUrl ? (
                        <video
                          src={recordedUrl}
                          className="absolute inset-0 w-full h-full object-cover"
                          playsInline
                        />
                      ) : (
                        <video
                          ref={cameraVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                        />
                      )}
                      {!mediaStream && !recordedUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <VideoCameraIcon className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <video
                        ref={originalVideoRef}
                        src={originalVideo.videoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        loop={!isRecording}
                      />
                    </div>
                  </div>
                ) : (
                  // Echo - overlay reaction
                  <div className="absolute inset-0">
                    <video
                      ref={originalVideoRef}
                      src={originalVideo.videoUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      playsInline
                      loop={!isRecording}
                    />
                    <div className="absolute bottom-4 right-4 w-32 aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      {recordedUrl ? (
                        <video
                          src={recordedUrl}
                          className="w-full h-full object-cover"
                          playsInline
                        />
                      ) : (
                        <video
                          ref={cameraVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    REC
                  </div>
                )}
              </div>

              {/* Split position slider for duet */}
              {remixType === 'duet' && !recordedBlob && (
                <div className="mt-4">
                  <label className="text-sm text-gray-400 mb-2 block">Split Position</label>
                  <input
                    type="range"
                    min={20}
                    max={80}
                    value={splitPosition}
                    onChange={(e) => setSplitPosition(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {!mediaStream && !recordedBlob && (
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                    Start Camera
                  </button>
                )}

                {mediaStream && !recordedBlob && (
                  <>
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full font-medium transition"
                      >
                        <PlayIcon className="w-5 h-5" />
                        Start Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium transition"
                      >
                        <PauseIcon className="w-5 h-5" />
                        Stop
                      </button>
                    )}
                  </>
                )}

                {recordedBlob && (
                  <>
                    <button
                      onClick={togglePlayback}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-6 h-6" />
                      ) : (
                        <PlayIcon className="w-6 h-6" />
                      )}
                    </button>
                    <button
                      onClick={retryRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                      Retry
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar - Details */}
            <div className="space-y-6">
              {/* Original Video Info */}
              <div className="bg-white/5 rounded-2xl p-4">
                <h2 className="font-semibold mb-3">Original Video</h2>
                <div className="flex gap-3">
                  <div className="w-20 aspect-[9/16] rounded-lg overflow-hidden bg-gray-800">
                    {originalVideo.thumbnailUrl && (
                      <img
                        src={originalVideo.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-2">{originalVideo.title}</div>
                    <div className="text-sm text-gray-400 mt-1">@{originalVideo.username}</div>
                  </div>
                </div>
              </div>

              {/* Remix Details Form */}
              {recordedBlob && (
                <div className="bg-white/5 rounded-2xl p-4 space-y-4">
                  <h2 className="font-semibold">{REMIX_TYPES[remixType].label} Details</h2>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Title (optional)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Add a title..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-white/5 rounded-2xl p-4">
                <h2 className="font-semibold mb-3">Tips</h2>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>• Recording starts when you click &quot;Start Recording&quot;</li>
                  <li>• The original video plays alongside your recording</li>
                  <li>• You can retry as many times as you want</li>
                  <li>• Make sure you have good lighting</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
