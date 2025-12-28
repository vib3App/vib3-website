'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Message } from '@/types';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full overflow-hidden glass flex-shrink-0">
          {message.senderAvatar ? (
            <Image src={message.senderAvatar} alt={message.senderUsername} width={32} height={32} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
              {message.senderUsername.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {message.type === 'voice' && message.mediaUrl ? (
          <VoiceMessage url={message.mediaUrl} duration={message.mediaDuration} isOwn={isOwn} />
        ) : message.type === 'image' && message.mediaUrl ? (
          <div className="relative rounded-2xl overflow-hidden">
            <Image src={message.mediaUrl} alt="Image" width={250} height={250} className="object-cover" />
          </div>
        ) : (
          <div className={`px-4 py-2.5 rounded-2xl ${isOwn ? 'bg-purple-500 text-white rounded-br-md' : 'glass text-white rounded-bl-md'}`}>
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-white/30 text-xs">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="text-white/30 text-xs">
              {message.status === 'read' ? (
                <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                </svg>
              ) : message.status === 'delivered' ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function VoiceMessage({ url, duration, isOwn }: { url: string; duration?: number; isOwn: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.onended = () => { setIsPlaying(false); setProgress(0); };
    audio.ontimeupdate = () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${isOwn ? 'bg-purple-500' : 'glass'}`}>
      <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center">
        {isPlaying ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
        ) : (
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-white/70 text-xs">{duration ? `${Math.round(duration)}s` : ''}</span>
      <audio ref={audioRef} src={url} className="hidden" />
    </div>
  );
}

export function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
