'use client';

import Image from 'next/image';
import type { Conversation } from '@/types';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface ConversationHeaderProps {
  conversation: Conversation | null;
  participant?: { userId: string; username: string; avatar?: string; isOnline?: boolean; lastSeen?: string };
  typingUsers: string[];
  isConnecting: boolean;
  onBack: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
}

export function ConversationHeader({
  conversation, participant, typingUsers, isConnecting,
  onBack, onAudioCall, onVideoCall,
}: ConversationHeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10">
      <div className="flex items-center gap-3 px-4 h-14">
        <button onClick={onBack} className="text-white/70 hover:text-white" aria-label="Go back">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {conversation && (
          <>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden glass">
                {(conversation.avatar || participant?.avatar) ? (
                  <Image
                    src={conversation.avatar || participant?.avatar || ''}
                    alt={participant?.username || ''}
                    width={40} height={40} className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    {participant?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              {participant?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-transparent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-medium truncate">
                {conversation.name || participant?.username}
              </h1>
              <p className="text-white/50 text-xs">
                {typingUsers.length > 0
                  ? `${typingUsers.join(', ')} typing...`
                  : participant?.isOnline ? 'Online'
                  : participant?.lastSeen ? `Last seen ${formatTime(participant.lastSeen)}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onAudioCall} disabled={isConnecting}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Audio Call">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button onClick={onVideoCall} disabled={isConnecting}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Video Call">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
