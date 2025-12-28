'use client';

import { forwardRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { WatchPartyChatMessage, WatchPartyParticipant } from '@/types/collaboration';

interface WatchPartyChatSidebarProps {
  messages: WatchPartyChatMessage[];
  participants: WatchPartyParticipant[];
  showParticipants: boolean;
  chatMessage: string;
  onToggleView: (showParticipants: boolean) => void;
  onChatMessageChange: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export const WatchPartyChatSidebar = forwardRef<HTMLDivElement, WatchPartyChatSidebarProps>(
  function WatchPartyChatSidebar(
    {
      messages,
      participants,
      showParticipants,
      chatMessage,
      onToggleView,
      onChatMessageChange,
      onSendMessage,
    },
    ref
  ) {
    return (
      <div className="w-80 border-l border-white/10 flex flex-col">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => onToggleView(false)}
            className={`flex-1 p-3 text-sm font-medium transition ${
              !showParticipants ? 'border-b-2 border-pink-500' : 'text-gray-400'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => onToggleView(true)}
            className={`flex-1 p-3 text-sm font-medium transition ${
              showParticipants ? 'border-b-2 border-pink-500' : 'text-gray-400'
            }`}
          >
            People ({participants.length})
          </button>
        </div>

        {showParticipants ? (
          <ParticipantsList participants={participants} />
        ) : (
          <ChatMessages
            ref={ref}
            messages={messages}
            chatMessage={chatMessage}
            onChatMessageChange={onChatMessageChange}
            onSendMessage={onSendMessage}
          />
        )}
      </div>
    );
  }
);

function ParticipantsList({ participants }: { participants: WatchPartyParticipant[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {participants.map((participant) => (
        <div key={participant.userId} className="flex items-center gap-3 p-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
              {participant.avatar ? (
                <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                  {participant.username[0].toUpperCase()}
                </div>
              )}
            </div>
            {participant.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
            )}
          </div>

          <div className="flex-1">
            <div className="font-medium flex items-center gap-2">
              {participant.username}
              {participant.isHost && (
                <span className="text-xs px-1.5 py-0.5 bg-pink-500/20 text-pink-400 rounded">
                  Host
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {participant.isOnline ? 'Watching' : 'Away'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ChatMessagesProps {
  messages: WatchPartyChatMessage[];
  chatMessage: string;
  onChatMessageChange: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  function ChatMessages({ messages, chatMessage, onChatMessageChange, onSendMessage }, ref) {
    return (
      <>
        <div ref={ref} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex-shrink-0 overflow-hidden">
                {msg.avatar ? (
                  <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                    {msg.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{msg.username}</div>
                {msg.type === 'system' ? (
                  <div className="text-sm text-gray-400 italic">{msg.content}</div>
                ) : (
                  <div className="text-sm text-gray-200 break-words">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSendMessage} className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => onChatMessageChange(e.target.value)}
              placeholder="Say something..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:border-pink-500 text-sm"
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
      </>
    );
  }
);
