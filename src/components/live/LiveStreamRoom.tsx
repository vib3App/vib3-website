'use client';

import { useCallback, useRef, useState } from 'react';
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
import { AgoraProvider, useAgoraContext } from './AgoraProvider';
import { logger } from '@/utils/logger';

interface LiveStreamRoomProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  isHost: boolean;
  streamTitle: string;
  onEnd: () => void;
}

function HostControls({ onEnd }: { onEnd: () => void }) {
  const { toggleAudio, toggleVideo, audioEnabled, videoEnabled, localAudioTrack } = useAgoraContext();
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleToggleAudio = useCallback(async () => {
    await toggleAudio();
  }, [toggleAudio]);

  const handleToggleVideo = useCallback(async () => {
    await toggleVideo();
  }, [toggleVideo]);

  const toggleRecording = useCallback(() => {
    if (isRecording && recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    // Get the local audio track's media stream track for recording
    const tracks: MediaStreamTrack[] = [];
    if (localAudioTrack) {
      const audioMST = localAudioTrack.getMediaStreamTrack();
      if (audioMST) tracks.push(audioMST);
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
  }, [isRecording, localAudioTrack]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-lg px-6 py-3 rounded-full">
      <button
        onClick={handleToggleAudio}
        className={`p-3 rounded-full transition ${audioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500'}`}
      >
        {audioEnabled ? <MicrophoneIcon className="w-6 h-6 text-white" /> : <MicOffIcon className="w-6 h-6 text-white" />}
      </button>
      <button
        onClick={handleToggleVideo}
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
  const { remoteUsers } = useAgoraContext();
  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
      <UserGroupIcon className="w-4 h-4 text-white" />
      <span className="text-white text-sm font-medium">{remoteUsers.length}</span>
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
  const { localVideoRef, localVideoTrack, videoEnabled } = useAgoraContext();

  return (
    <div className="relative w-full h-full bg-black">
      {localVideoTrack && videoEnabled ? (
        <div ref={localVideoRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white/50">
            <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Camera is off</p>
          </div>
        </div>
      )}
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
  const { connectionState } = useAgoraContext();

  return (
    <div className="relative w-full h-full">
      <HostVideoDisplay />

      {/* Reconnecting overlay */}
      {connectionState === 'reconnecting' && <ReconnectingOverlay />}

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
  appId,
  channelName,
  token,
  uid,
  isHost,
  streamTitle,
  onEnd,
}: LiveStreamRoomProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleError = useCallback((error: Error) => {
    logger.error(`Agora error in channel ${channelName}:`, error);
    setConnectionError(error.message);
  }, [channelName]);

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
    <AgoraProvider
      appId={appId}
      channelName={channelName}
      token={token}
      uid={uid}
      role={isHost ? 'host' : 'viewer'}
      onError={handleError}
      onDisconnected={handleDisconnected}
    >
      <RoomContent isHost={isHost} streamTitle={streamTitle} onEnd={onEnd} />
    </AgoraProvider>
  );
}
