'use client';

import { useCallback, useState, useEffect } from 'react';
import {
  LiveKitRoom,
  VideoTrack,
  AudioTrack,
  useTracks,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import { Track, RemoteParticipant } from 'livekit-client';
import {
  XMarkIcon,
  SignalIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  GiftIcon,
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface LiveViewerRoomProps {
  token: string;
  wsUrl: string;
  roomName: string;
  streamTitle: string;
  hostName: string;
  hostAvatar?: string;
  onLeave: () => void;
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
    <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full">
      <SignalIcon className="w-4 h-4 text-white" />
      <span className="text-white text-sm font-bold">LIVE</span>
    </div>
  );
}

function HostVideo() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
  const room = useRoomContext();

  // Find host's tracks (the participant who is publishing)
  const hostVideoTrack = tracks.find(
    t => t.source === Track.Source.Camera && t.participant instanceof RemoteParticipant
  );
  const hostAudioTrack = tracks.find(
    t => t.source === Track.Source.Microphone && t.participant instanceof RemoteParticipant
  );

  if (!hostVideoTrack) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="text-center text-white/70">
          <SignalIcon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Waiting for host...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black">
      <VideoTrack
        trackRef={hostVideoTrack}
        className="w-full h-full object-contain"
      />
      {hostAudioTrack && <AudioTrack trackRef={hostAudioTrack} />}
    </div>
  );
}

function ViewerActions({
  onLike,
  onOpenChat,
  onOpenGifts,
}: {
  onLike: () => void;
  onOpenChat: () => void;
  onOpenGifts: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      onLike();
    }
  };

  return (
    <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4">
      <button
        onClick={handleLike}
        className={`p-3 rounded-full transition ${
          liked ? 'bg-pink-500 scale-110' : 'bg-white/20 hover:bg-white/30'
        }`}
      >
        <HeartIcon className={`w-7 h-7 ${liked ? 'text-white' : 'text-white'}`} />
      </button>

      <button
        onClick={onOpenChat}
        className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition"
      >
        <ChatBubbleLeftIcon className="w-7 h-7 text-white" />
      </button>

      <button
        onClick={onOpenGifts}
        className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition"
      >
        <GiftIcon className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}

function RoomContent({
  streamTitle,
  hostName,
  hostAvatar,
  onLeave,
}: {
  streamTitle: string;
  hostName: string;
  hostAvatar?: string;
  onLeave: () => void;
}) {
  const handleLike = useCallback(() => {
    // TODO: Send like via API
    console.log('Liked stream');
  }, []);

  const handleOpenChat = useCallback(() => {
    // TODO: Open chat panel
    console.log('Open chat');
  }, []);

  const handleOpenGifts = useCallback(() => {
    // TODO: Open gifts panel
    console.log('Open gifts');
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Video Display */}
      <HostVideo />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <Link
                href="/live"
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <LiveIndicator />
              <ViewerCount />
            </div>
          </div>

          {/* Host Info */}
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
              {hostAvatar ? (
                <img src={hostAvatar} alt={hostName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold">{hostName[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold">{hostName}</h2>
              <p className="text-white/70 text-sm">{streamTitle}</p>
            </div>
          </div>
        </div>

        {/* Viewer Actions */}
        <div className="pointer-events-auto">
          <ViewerActions
            onLike={handleLike}
            onOpenChat={handleOpenChat}
            onOpenGifts={handleOpenGifts}
          />
        </div>

        {/* Leave Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-6 py-3 bg-black/60 backdrop-blur hover:bg-black/80 rounded-full transition"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function LiveViewerRoom({
  token,
  wsUrl,
  roomName,
  streamTitle,
  hostName,
  hostAvatar,
  onLeave,
}: LiveViewerRoomProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [streamEnded, setStreamEnded] = useState(false);

  const handleError = useCallback((error: Error) => {
    console.error('LiveKit error:', error);
    setConnectionError(error.message);
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('Disconnected from room');
    setStreamEnded(true);
  }, []);

  if (connectionError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <XMarkIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-white/70 mb-4">{connectionError}</p>
          <button
            onClick={onLeave}
            className="px-6 py-2 bg-red-500 rounded-full hover:bg-red-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (streamEnded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <SignalIcon className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h2 className="text-xl font-bold mb-2">Stream Ended</h2>
          <p className="text-white/70 mb-4">This live stream has ended.</p>
          <Link
            href="/live"
            className="inline-block px-6 py-2 bg-pink-500 rounded-full hover:bg-pink-600 transition"
          >
            Browse Live Streams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      video={false}
      audio={false}
      onError={handleError}
      onDisconnected={handleDisconnected}
      className="w-full h-full"
    >
      <RoomContent
        streamTitle={streamTitle}
        hostName={hostName}
        hostAvatar={hostAvatar}
        onLeave={onLeave}
      />
    </LiveKitRoom>
  );
}
