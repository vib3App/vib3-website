'use client';

import Image from 'next/image';
import { useConversation } from '@/hooks/useConversation';
import { MessageBubble, formatDateHeader } from '@/components/messages';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ConversationPage() {
  const conv = useConversation();

  if (!conv.isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={conv.goBack} className="text-white/70 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {conv.conversation && (
            <>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden glass">
                  {(conv.conversation.avatar || conv.participant?.avatar) ? (
                    <Image
                      src={conv.conversation.avatar || conv.participant?.avatar || ''}
                      alt={conv.participant?.username || ''}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                      {conv.participant?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                {conv.participant?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-transparent" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-white font-medium truncate">
                  {conv.conversation.name || conv.participant?.username}
                </h1>
                <p className="text-white/50 text-xs">
                  {conv.typingUsers.length > 0
                    ? `${conv.typingUsers.join(', ')} typing...`
                    : conv.participant?.isOnline
                    ? 'Online'
                    : conv.participant?.lastSeen
                    ? `Last seen ${formatTime(conv.participant.lastSeen)}`
                    : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conv.isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {conv.messages.map((message, index) => {
              const prevMessage = conv.messages[index - 1];
              const showDateHeader = !prevMessage || formatDateHeader(message.createdAt) !== formatDateHeader(prevMessage.createdAt);
              const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
              const isOwn = message.senderId === conv.user?.id;

              return (
                <div key={message.id}>
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <span className="text-white/30 text-xs glass px-3 py-1 rounded-full">
                        {formatDateHeader(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble message={message} isOwn={isOwn} showAvatar={showAvatar} />
                </div>
              );
            })}
            <div ref={conv.messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 glass-heavy border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => conv.setShowEmojiPicker(!conv.showEmojiPicker)} className="text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <div className="flex-1 glass rounded-full px-4 py-2">
            <input
              ref={conv.inputRef}
              type="text"
              value={conv.newMessage}
              onChange={(e) => { conv.setNewMessage(e.target.value); conv.handleTyping(); }}
              onKeyDown={conv.handleKeyDown}
              placeholder="Message..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
            />
          </div>

          {conv.newMessage.trim() ? (
            <button
              onClick={conv.handleSend}
              disabled={conv.isSending}
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-teal-600 disabled:opacity-50"
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
