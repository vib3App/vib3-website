'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LiveKitRoom,
  VideoTrack,
  AudioTrack,
  useLocalParticipant,
  useRoomContext,
  useTracks,
  useParticipants,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';
import {
  MicrophoneIcon,
  VideoCameraIcon,
  XMarkIcon,
  SignalIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';
import {
  MicrophoneIcon as MicOffIcon,
  VideoCameraIcon as VideoOffIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@/utils/logger';

interface LiveStreamRoomProps {
  token: string;
  wsUrl: string;
  roomName: string;
  isHost: boolean;
  streamTitle: string;
  onEnd: () => void;
}

function HostControls({ onEnd }: { onEnd: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleAudio = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(!audioEnabled);
    setAudioEnabled(!audioEnabled);
  }, [localParticipant, audioEnabled]);

  const toggleVideo = useCallback(async () => {
    await localParticipant.setCameraEnabled(!videoEnabled);
    setVideoEnabled(!videoEnabled);
  }, [localParticipant, videoEnabled]);

  const toggleRecording = useCallback(() => {
    if (isRecording && recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    const tracks: MediaStreamTrack[] = [];
    for (const pub of localParticipant.trackPublications.values()) {
      if (pub.track?.mediaStreamTrack) tracks.push(pub.track.mediaStreamTrack);
    }
    if (tracks.length === 0) return;

    const stream = new MediaStream(tracks);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `live-recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };

    recorder.start(1000);
    recorderRef.current = recorder;
    setIsRecording(true);
  }, [isRecording, localParticipant]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-lg px-6 py-3 rounded-full">
      <button
        onClick={toggleAudio}
        className={`p-3 rounded-full transition ${audioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500'}`}
      >
        {audioEnabled ? <MicrophoneIcon className="w-6 h-6 text-white" /> : <MicOffIcon className="w-6 h-6 text-white" />}
      </button>
      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full transition ${videoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500'}`}
      >
        {videoEnabled ? <VideoCameraIcon className="w-6 h-6 text-white" /> : <VideoOffIcon className="w-6 h-6 text-white" />}
      </button>
      <button
        onClick={toggleRecording}
        className={`p-3 rounded-full transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/30'}`}
        title={isRecording ? 'Stop Recording' : 'Record Stream'}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          {isRecording ? <div className="w-4 h-4 bg-white rounded-sm" /> : <div className="w-4 h-4 bg-red-500 rounded-full" />}
        </div>
      </button>
      <button onClick={onEnd} className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition">
        <XMarkIcon className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}

function ViewerCount() {
  const participants = useParticipants();
  const viewerCount = Math.max(0, participants.length - 1);
  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
      <UserGroupIcon className="w-4 h-4 text-white" />
      <span className="text-white text-sm font-medium">{viewerCount}</span>
    </div>
  );
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full animate-pulse">
      <SignalIcon className="w-4 h-4 text-white" />
      <span className="text-white text-sm font-bold">LIVE</span>
    </div>
  );
}

function ReconnectingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-medium">Reconnecting...</p>
        <p className="text-white/50 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
}

function HostVideoDisplay() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
  const videoTrack = tracks.find(t => t.source === Track.Source.Camera);
  const audioTrack = tracks.find(t => t.source === Track.Source.Microphone);

  return (
    <div className="relative w-full h-full bg-black">
      {videoTrack ? (
        <VideoTrack trackRef={videoTrack} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white/50">
            <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Camera is off</p>
          </div>
        </div>
      )}
      {audioTrack && <AudioTrack trackRef={audioTrack} />}
    </div>
  );
}

function RoomContent({
  isHost,
  streamTitle,
  onEnd,
}: {
  isHost: boolean;
  streamTitle: string;
  onEnd: () => void;
}) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();

  useEffect(() => {
    if (isHost && room && localParticipant) {
      localParticipant.setCameraEnabled(true);
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [isHost, room, localParticipant]);

  return (
    <div className="relative w-full h-full">
      <HostVideoDisplay />

      {/* Reconnecting overlay */}
      {connectionState === ConnectionState.Reconnecting && <ReconnectingOverlay />}

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <LiveIndicator />
            <ViewerCount />
          </div>
          <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-lg max-w-xs truncate">
            <span className="text-white font-medium">{streamTitle}</span>
          </div>
        </div>

        {isHost && (
          <div className="pointer-events-auto">
            <HostControls onEnd={onEnd} />
          </div>
        )}
      </div>
    </div>
  );
}

export function LiveStreamRoom({
  token,
  wsUrl,
  roomName,
  isHost,
  streamTitle,
  onEnd,
}: LiveStreamRoomProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleError = useCallback((error: Error) => {
    logger.error(`LiveKit error in room ${roomName}:`, error);
    setConnectionError(error.message);
  }, [roomName]);

  const handleDisconnected = useCallback(() => {
    if (!isHost) {
      onEnd();
    }
  }, [isHost, onEnd]);

  if (connectionError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <XMarkIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-white/70 mb-4">{connectionError}</p>
          <button onClick={onEnd} className="px-6 py-2 bg-red-500 rounded-full hover:bg-red-600 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      video={isHost}
      audio={isHost}
      onError={handleError}
      onDisconnected={handleDisconnected}
      className="w-full h-full"
    >
      <RoomContent isHost={isHost} streamTitle={streamTitle} onEnd={onEnd} />
    </LiveKitRoom>
  );
}
