'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ShareIcon,
  ClipboardIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { collaborationApi } from '@/services/api';
import type { CollabRoom, CollabParticipant } from '@/types/collaboration';

export default function CollabRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Room data
  const [room, setRoom] = useState<CollabRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recording state
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // UI state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if current user is the creator
  const isCreator = room?.creatorId === 'current-user-id'; // Replace with actual auth

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await collaborationApi.getCollabRoom(roomId);
        setRoom(data);

        // Find current user's participant status
        const currentParticipant = data.participants.find(
          p => p.userId === 'current-user-id'
        );
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

    // Poll for updates
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Start camera preview
  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to get media:', err);
      alert('Failed to access camera/microphone');
    }
  };

  // Start recording
  const startRecording = () => {
    if (!mediaStream) return;

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

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Retry recording
  const retryRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
  };

  // Submit clip
  const submitClip = async () => {
    if (!recordedBlob) return;

    try {
      // In production, upload to storage and get URL
      // For now, simulate upload progress
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
  };

  // Toggle ready status
  const toggleReady = async () => {
    try {
      await collaborationApi.setReady(roomId, !isReady);
      setIsReady(!isReady);
    } catch (err) {
      console.error('Failed to set ready:', err);
    }
  };

  // Start the collab session (creator only)
  const handleStartSession = async () => {
    try {
      await collaborationApi.startRecording(roomId);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  // Finalize the collab (creator only)
  const handleFinalize = async () => {
    try {
      const result = await collaborationApi.finalizeCollab(roomId);
      router.push(`/video/${result.videoId}`);
    } catch (err) {
      console.error('Failed to finalize:', err);
      alert('Failed to finalize collab');
    }
  };

  // Leave room
  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this collab?')) return;

    try {
      await collaborationApi.leaveCollabRoom(roomId);
      router.push('/collab');
    } catch (err) {
      console.error('Failed to leave:', err);
    }
  };

  // Copy invite code
  const copyInviteCode = () => {
    if (room?.inviteCode) {
      navigator.clipboard.writeText(room.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share link
  const shareLink = () => {
    const url = `${window.location.origin}/collab/${roomId}`;
    if (room?.inviteCode) {
      navigator.clipboard.writeText(`${url}?code=${room.inviteCode}`);
    } else {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  if (error || !room) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <UserGroupIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">{error || 'Room not found'}</h1>
        <Link href="/collab" className="text-pink-400 hover:underline">
          Back to Collabs
        </Link>
      </div>
    );
  }

  const allReady = room.participants.every(p => p.isReady);
  const allSubmitted = room.participants.every(p => p.hasRecorded);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/collab" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">{room.title}</h1>
              <div className="text-xs text-gray-400">
                {room.participants.length}/{room.maxParticipants} participants
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ShareIcon className="w-5 h-5" />
            </button>

            {!isCreator && (
              <button
                onClick={handleLeave}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-full text-sm font-medium transition"
              >
                Leave
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Recording Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-xl ${
              room.status === 'waiting' ? 'bg-yellow-500/20 border border-yellow-500/50' :
              room.status === 'recording' ? 'bg-red-500/20 border border-red-500/50' :
              room.status === 'editing' ? 'bg-blue-500/20 border border-blue-500/50' :
              'bg-green-500/20 border border-green-500/50'
            }`}>
              <div className="flex items-center gap-3">
                {room.status === 'waiting' && <ClockIcon className="w-5 h-5 text-yellow-400" />}
                {room.status === 'recording' && <VideoCameraIcon className="w-5 h-5 text-red-400" />}
                {room.status === 'editing' && <ArrowPathIcon className="w-5 h-5 text-blue-400" />}
                {room.status === 'completed' && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                <span className="font-medium">
                  {room.status === 'waiting' && 'Waiting for participants to get ready'}
                  {room.status === 'recording' && 'Recording in progress'}
                  {room.status === 'editing' && 'Editing and finalizing'}
                  {room.status === 'completed' && 'Collab completed!'}
                </span>
              </div>
            </div>

            {/* Video Preview / Recording */}
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative">
              {recordedUrl ? (
                <video
                  src={recordedUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {!mediaStream && !recordedUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <VideoCameraIcon className="w-16 h-16 text-gray-600 mb-4" />
                  <button
                    onClick={startPreview}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
                  >
                    Start Camera
                  </button>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  REC
                </div>
              )}
            </div>

            {/* Recording Controls */}
            {mediaStream && room.status === 'recording' && (
              <div className="flex items-center justify-center gap-4">
                {!recordedUrl ? (
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
                        <StopIcon className="w-5 h-5" />
                        Stop Recording
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={retryRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                      Retry
                    </button>

                    {!hasSubmitted && (
                      <button
                        onClick={submitClip}
                        disabled={uploadProgress > 0}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-full font-medium transition"
                      >
                        {uploadProgress > 0 ? (
                          `Uploading ${uploadProgress}%`
                        ) : (
                          <>
                            <CheckIcon className="w-5 h-5" />
                            Submit Clip
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Ready Toggle (waiting state) */}
            {room.status === 'waiting' && (
              <div className="flex items-center justify-center">
                <button
                  onClick={toggleReady}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition ${
                    isReady
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isReady ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Ready!
                    </>
                  ) : (
                    'Mark as Ready'
                  )}
                </button>
              </div>
            )}

            {/* Creator Controls */}
            {isCreator && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                {room.status === 'waiting' && allReady && (
                  <button
                    onClick={handleStartSession}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
                  >
                    Start Recording Session
                  </button>
                )}

                {room.status === 'recording' && allSubmitted && (
                  <button
                    onClick={handleFinalize}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
                  >
                    Finalize Collab
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Participants */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5" />
                Participants ({room.participants.length})
              </h2>

              <div className="space-y-3">
                {room.participants.map((participant: CollabParticipant) => (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                        {participant.avatar ? (
                          <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                            {participant.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      {participant.isReady && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {participant.username}
                        {participant.role === 'creator' && (
                          <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded-full">
                            Host
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {participant.hasRecorded ? 'Submitted' : participant.isReady ? 'Ready' : 'Waiting'}
                      </div>
                    </div>

                    {participant.hasRecorded && (
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {room.description && (
              <div className="bg-white/5 rounded-2xl p-4">
                <h2 className="font-semibold mb-2">About</h2>
                <p className="text-sm text-gray-400">{room.description}</p>
              </div>
            )}

            {room.inviteCode && (
              <div className="bg-white/5 rounded-2xl p-4">
                <h2 className="font-semibold mb-2">Invite Code</h2>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-black/50 rounded-lg text-lg tracking-widest font-mono text-center">
                    {room.inviteCode}
                  </code>
                  <button
                    onClick={copyInviteCode}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    {copied ? (
                      <CheckIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <ClipboardIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Share Collab</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {room.inviteCode && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Invite Code</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-black/50 rounded-lg text-xl tracking-widest font-mono text-center">
                      {room.inviteCode}
                    </code>
                    <button
                      onClick={copyInviteCode}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                    >
                      <ClipboardIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={shareLink}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition"
              >
                {copied ? 'Link Copied!' : 'Copy Share Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
