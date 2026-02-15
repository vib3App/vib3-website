'use client';

import Image from 'next/image';
import { forwardRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { LiveChatMessage } from '@/types';

interface LiveStreamChatProps {
  messages: LiveChatMessage[];
  chatMessage: string;
  onChatMessageChange: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export const LiveStreamChat = forwardRef<HTMLDivElement, LiveStreamChatProps>(
  function LiveStreamChat({ messages, chatMessage, onChatMessageChange, onSendMessage }, ref) {
    return (
      <div className="w-full lg:w-96 h-80 lg:h-full flex flex-col bg-gray-900/50 border-l border-white/10">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Live Chat</h3>
            <span className="text-sm text-gray-400">{messages.length} messages</span>
          </div>
        </div>

        <div ref={ref} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>

        <form onSubmit={onSendMessage} className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => onChatMessageChange(e.target.value)}
              placeholder="Say something..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim()}
              className="p-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    );
  }
);

function ChatMessage({ message }: { message: LiveChatMessage }) {
  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex-shrink-0 overflow-hidden">
        {message.avatar ? (
          <Image src={message.avatar} alt="" width={32} height={32} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold">
            {message.username[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{message.username}</span>
          {message.type === 'gift' && (
            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
              Gift
            </span>
          )}
        </div>
        <MessageContent message={message} />
      </div>
    </div>
  );
}

function MessageContent({ message }: { message: LiveChatMessage }) {
  if (message.type === 'gift') {
    return (
      <div className="text-sm text-yellow-400">
        Sent {message.giftName} ×{message.giftValue}
      </div>
    );
  }
  if (message.type === 'join') {
    return <div className="text-sm text-gray-400">joined the stream</div>;
  }
  if (message.type === 'system') {
    return <div className="text-sm text-gray-400 italic">{message.content}</div>;
  }
  return <div className="text-sm text-gray-200 break-words">{message.content}</div>;
}
