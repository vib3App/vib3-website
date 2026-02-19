'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import type { Message } from '@/types';
import { ReactionPicker } from './ReactionPicker';
import { ReactionsDisplay } from './ReactionsDisplay';
import { QuotedMessage } from './ReplyPreview';
import { VoiceMessageBubble } from './VoiceMessageBubble';
import { MediaMessageBubble } from './MediaMessageBubble';
import { LocationMessageBubble } from './LocationMessageBubble';
import { LiveLocationMessage } from './LiveLocationMessage';
import { MessageContextMenu } from './MessageContextMenu';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  currentUserId?: string;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onDeleteForMe?: (messageId: string) => void;
}

export function MessageBubble({
  message, isOwn, showAvatar, currentUserId, onReact, onReply, onDelete, onDeleteForMe,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowActions(false), 300);
  };

  const handleReact = (emoji: string) => {
    onReact?.(message.id, emoji);
    setShowActions(false);
  };

  const handleReply = () => {
    onReply?.(message);
    setShowActions(false);
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    setShowActions(false);
  };

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Deleted message placeholder
  if (message.content === '__deleted__' || message.type === 'text' && message.content === '') {
    return (
      <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
        {!isOwn && showAvatar && <AvatarSlot message={message} />}
        {!isOwn && !showAvatar && <div className="w-8" />}
        <div className={`max-w-[70%] px-4 py-2 rounded-2xl glass opacity-50`}>
          <p className="text-white/40 text-sm italic">This message was deleted</p>
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
            <span className="text-white/20 text-xs">{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && showAvatar && <AvatarSlot message={message} />}
      {!isOwn && !showAvatar && <div className="w-8" />}

      <div
        className={`relative max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {/* Reaction picker on hover */}
        {showActions && (
          <ReactionPicker
            onReact={handleReact}
            onReply={handleReply}
            onDelete={isOwn ? handleDelete : undefined}
            position={isOwn ? 'right' : 'left'}
            onClose={() => setShowActions(false)}
          />
        )}

        {/* Context menu on right-click */}
        {contextMenu && (
          <MessageContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            isOwn={isOwn}
            onReply={handleReply}
            onDeleteForMe={() => onDeleteForMe?.(message.id) || onDelete?.(message.id)}
            onDeleteForEveryone={() => onDelete?.(message.id)}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Message content */}
        <MessageContent message={message} isOwn={isOwn} />

        {/* Reactions display */}
        {message.reactions && message.reactions.length > 0 && (
          <ReactionsDisplay
            reactions={message.reactions}
            currentUserId={currentUserId || ''}
            onToggleReaction={(emoji) => handleReact(emoji)}
          />
        )}

        {/* Timestamp + status */}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-white/30 text-xs">{formatTime(message.createdAt)}</span>
          {isOwn && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function AvatarSlot({ message }: { message: Message }) {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden glass flex-shrink-0">
      {message.senderAvatar ? (
        <Image src={message.senderAvatar} alt={message.senderUsername} width={32} height={32} className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
          {message.senderUsername.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function MessageContent({ message, isOwn }: { message: Message; isOwn: boolean }) {
  // Voice message
  if (message.type === 'voice' && message.mediaUrl) {
    return <VoiceMessageBubble audioUrl={message.mediaUrl} duration={message.mediaDuration} isOwn={isOwn} />;
  }

  // Image message
  if (message.type === 'image' && message.mediaUrl) {
    return <MediaMessageBubble type="image" mediaUrl={message.mediaUrl} isOwn={isOwn} />;
  }

  // Video message
  if (message.type === 'video' && message.mediaUrl) {
    return (
      <MediaMessageBubble
        type="video"
        mediaUrl={message.mediaUrl}
        mediaThumbnail={message.mediaThumbnail}
        mediaDuration={message.mediaDuration}
        isOwn={isOwn}
      />
    );
  }

  // Location message
  if (message.type === 'location' && message.location) {
    return (
      <LocationMessageBubble
        lat={message.location.lat}
        lng={message.location.lng}
        address={message.location.address}
        isOwn={isOwn}
      />
    );
  }

  // Live location message (Gap #53)
  if (message.type === 'liveLoc' && message.location) {
    return (
      <LiveLocationMessage
        lat={message.location.lat}
        lng={message.location.lng}
        duration={message.location.duration || 60}
        startedAt={message.createdAt}
        senderUsername={message.senderUsername}
        senderId={message.senderId}
        conversationId={message.conversationId || ''}
        isOwn={isOwn}
      />
    );
  }

  // GIF message
  if (message.type === 'gif' && message.mediaUrl) {
    return (
      <div className="rounded-2xl overflow-hidden max-w-[250px]">
        <img src={message.mediaUrl} alt="GIF" className="w-full object-cover" loading="lazy" />
      </div>
    );
  }

  // Sticker message (large emoji)
  if (message.type === 'sticker') {
    return <span className="text-5xl">{message.content}</span>;
  }

  // Text message (default)
  return (
    <div className={`px-4 py-2.5 rounded-2xl ${isOwn ? 'bg-purple-500 text-white rounded-br-md' : 'glass text-white rounded-bl-md'}`}>
      {message.replyTo && (
        <QuotedMessage senderUsername={message.replyTo.senderUsername} content={message.replyTo.content} />
      )}
      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: Message['status'] }) {
  return (
    <span className="text-white/30 text-xs">
      {status === 'read' ? (
        <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
        </svg>
      ) : status === 'delivered' ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      )}
    </span>
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
