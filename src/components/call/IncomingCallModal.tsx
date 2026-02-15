'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { IncomingCall } from '@/types/call';

interface IncomingCallModalProps {
  call: IncomingCall;
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({ call, onAnswer, onDecline }: IncomingCallModalProps) {
  const _audioRef = useRef<HTMLAudioElement>(null);
  const isVideoCall = call.type === 'video';

  // Play ringtone
  useEffect(() => {
    // Create audio element for ringtone
    const audio = new Audio('/sounds/ringtone.mp3');
    audio.loop = true;
    audio.play().catch(() => {
      // Autoplay blocked, that's ok
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Prevent scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center">
      {/* Ripple animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full border-2 border-white/10 animate-ping" />
        <div className="absolute w-64 h-64 rounded-full border-2 border-white/5 animate-ping animation-delay-200" />
        <div className="absolute w-80 h-80 rounded-full border-2 border-white/3 animate-ping animation-delay-400" />
      </div>

      {/* Caller info */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Avatar with ring animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-teal-500 animate-pulse scale-110" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
            {call.callerAvatar ? (
              <Image
                src={call.callerAvatar}
                alt={call.callerUsername}
                width={128}
                height={128}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white text-4xl font-bold">
                {call.callerUsername.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-white text-3xl font-bold mb-2">{call.callerUsername}</h2>
        <p className="text-white/70 text-lg mb-2">
          Incoming {isVideoCall ? 'Video' : 'Audio'} Call
        </p>

        {/* Call type icon */}
        <div className="flex items-center gap-2 text-white/50">
          {isVideoCall ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          )}
          <span>{isVideoCall ? 'VIB3 Video' : 'VIB3 Audio'}</span>
        </div>
      </div>

      {/* Answer/Decline buttons */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-16">
        {/* Decline */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDecline}
            className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 01-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 00-2.67-1.85.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
            </svg>
          </button>
          <span className="text-white/70 text-sm">Decline</span>
        </div>

        {/* Answer */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAnswer}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 animate-bounce"
          >
            {isVideoCall ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            )}
          </button>
          <span className="text-white/70 text-sm">Answer</span>
        </div>
      </div>
    </div>
  );
}
