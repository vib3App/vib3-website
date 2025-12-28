'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { messagesApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import type { Message, Conversation, TypingIndicator } from '@/types';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1A1F2E] flex-shrink-0">
          {message.senderAvatar ? (
            <Image
              src={message.senderAvatar}
              alt={message.senderUsername}
              width={32}
              height={32}
              className="object-cover"
            />
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
            <Image
              src={message.mediaUrl}
              alt="Image"
              width={250}
              height={250}
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isOwn
                ? 'bg-[#6366F1] text-white rounded-br-md'
                : 'bg-[#1A1F2E] text-white rounded-bl-md'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-white/30 text-xs">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="text-white/30 text-xs">
              {message.status === 'read' ? (
                <svg className="w-3.5 h-3.5 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
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

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${isOwn ? 'bg-[#6366F1]' : 'bg-[#1A1F2E]'}`}>
      <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center">
        {isPlaying ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
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

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { user, isAuthenticated } = useAuthStore();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const [convData, messagesData] = await Promise.all([
        messagesApi.getConversation(conversationId),
        messagesApi.getMessages(conversationId),
      ]);
      setConversation(convData);
      setMessages(messagesData.items.reverse());
      await messagesApi.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/messages');
      return;
    }

    loadMessages();

    if (user?.token) {
      websocketService.connect(user.token);

      const unsubMessage = websocketService.onMessage((message) => {
        if (message.conversationId === conversationId) {
          setMessages(prev => [...prev, message]);
          websocketService.sendRead(conversationId, message.id);
        }
      });

      const unsubTyping = websocketService.onTyping((indicator: TypingIndicator) => {
        if (indicator.conversationId === conversationId) {
          setTypingUsers(prev => {
            if (indicator.isTyping) {
              return prev.includes(indicator.username) ? prev : [...prev, indicator.username];
            }
            return prev.filter(u => u !== indicator.username);
          });
        }
      });

      return () => {
        unsubMessage();
        unsubTyping();
      };
    }
  }, [isAuthenticated, user?.token, conversationId, router, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleTyping = () => {
    websocketService.sendTyping(conversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTyping(conversationId, false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user?.id || '',
      senderUsername: user?.username || '',
      senderAvatar: user?.profilePicture,
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const sent = await messagesApi.sendMessage(conversationId, { content, type: 'text' });
      setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? sent : m));
      websocketService.sendTyping(conversationId, false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(m =>
        m.id === optimisticMessage.id ? { ...m, status: 'failed' as const } : m
      ));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const participant = conversation?.participants[0];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.push('/messages')} className="text-white/70 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {conversation && (
            <>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1A1F2E]">
                  {(conversation.avatar || participant?.avatar) ? (
                    <Image
                      src={conversation.avatar || participant?.avatar || ''}
                      alt={participant?.username || ''}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                      {participant?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                {participant?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0E1A]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-white font-medium truncate">
                  {conversation.name || participant?.username}
                </h1>
                <p className="text-white/50 text-xs">
                  {typingUsers.length > 0
                    ? `${typingUsers.join(', ')} typing...`
                    : participant?.isOnline
                    ? 'Online'
                    : participant?.lastSeen
                    ? `Last seen ${formatTime(participant.lastSeen)}`
                    : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showDateHeader =
                !prevMessage ||
                formatDateHeader(message.createdAt) !== formatDateHeader(prevMessage.createdAt);
              const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
              const isOwn = message.senderId === user?.id;

              return (
                <div key={message.id}>
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <span className="text-white/30 text-xs bg-[#1A1F2E] px-3 py-1 rounded-full">
                        {formatDateHeader(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble message={message} isOwn={isOwn} showAvatar={showAvatar} />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-[#0A0E1A] border-t border-white/5 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-white/50 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <div className="flex-1 bg-[#1A1F2E] rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
            />
          </div>

          {newMessage.trim() ? (
            <button
              onClick={handleSend}
              disabled={isSending}
              className="w-10 h-10 bg-[#6366F1] rounded-full flex items-center justify-center hover:bg-[#5558E3] disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          ) : (
            <button className="text-white/50 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
