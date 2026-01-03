'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import type { Call, CallType } from '@/types/call';

interface VideoCallModalProps {
  call: Call;
  isOutgoing: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  callDuration: string;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onSwitchCamera: () => void;
  onEndCall: () => void;
}

export function VideoCallModal({
  call,
  isOutgoing,
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isVideoOff,
  isSpeakerOn,
  callDuration,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onSwitchCamera,
  onEndCall,
}: VideoCallModalProps) {
  const isRinging = call.status === 'ringing';
  const isConnecting = call.status === 'connecting';
  const isActive = call.status === 'active';
  const isVideoCall = call.type === 'video';

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const remoteUser = isOutgoing
    ? { username: call.receiverUsername, avatar: call.receiverAvatar }
    : { username: call.callerUsername, avatar: call.callerAvatar };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Remote Video / Avatar Background */}
      <div className="flex-1 relative">
        {isVideoCall && isActive ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/50 to-black">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 mb-6">
              {remoteUser.avatar ? (
                <Image
                  src={remoteUser.avatar}
                  alt={remoteUser.username}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {remoteUser.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">{remoteUser.username}</h2>
            <p className="text-white/70">
              {isRinging && (isOutgoing ? 'Calling...' : 'Incoming call')}
              {isConnecting && 'Connecting...'}
              {isActive && callDuration}
            </p>
          </div>
        )}

        {/* Local Video PiP */}
        {isVideoCall && !isVideoOff && (
          <div className="absolute top-4 right-4 w-32 h-44 rounded-xl overflow-hidden bg-black/50 shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Status indicator */}
        {isActive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 glass-heavy px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">{callDuration}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="safe-area-bottom bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-8">
        {/* Secondary controls */}
        <div className="flex justify-center gap-6 mb-6">
          {isVideoCall && (
            <button
              onClick={onSwitchCamera}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              title="Switch Camera"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          <button
            onClick={onToggleSpeaker}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isSpeakerOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/30 text-white'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isSpeakerOn ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              )}
            </svg>
          </button>
        </div>

        {/* Primary controls */}
        <div className="flex justify-center gap-8">
          {/* Mute */}
          <button
            onClick={onToggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            title="End Call"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 01-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 00-2.67-1.85.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
            </svg>
          </button>

          {/* Video Toggle */}
          {isVideoCall && (
            <button
              onClick={onToggleVideo}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isVideoOff ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
