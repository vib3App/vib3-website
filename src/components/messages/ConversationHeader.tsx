'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Conversation } from '@/types';
import { messagesApi } from '@/services/api';
import { logger } from '@/utils/logger';

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
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(conversation?.isMuted || false);
  const [isPinned, setIsPinned] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const handleToggleMute = async () => {
    if (!conversation) return;
    try {
      const result = await messagesApi.toggleMute(conversation.id);
      setIsMuted(result.muted);
    } catch (err) {
      logger.error('Failed to toggle mute:', err);
    }
    setShowMenu(false);
  };

  const handleTogglePin = async () => {
    if (!conversation) return;
    try {
      const result = await messagesApi.togglePin(conversation.id);
      setIsPinned(result.pinned);
    } catch (err) {
      logger.error('Failed to toggle pin:', err);
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!conversation) return;
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await messagesApi.deleteConversation(conversation.id);
      onBack();
    } catch (err) {
      logger.error('Failed to delete conversation:', err);
    }
    setShowMenu(false);
  };

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

              {/* Settings menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="More options"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                    <button
                      onClick={handleToggleMute}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMuted ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        )}
                      </svg>
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button
                      onClick={handleTogglePin}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      {isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <div className="border-t border-white/10" />
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Conversation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
