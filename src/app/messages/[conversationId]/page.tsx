'use client';

import Image from 'next/image';
import { useConversation } from '@/hooks/useConversation';
import { useVideoCall } from '@/hooks/useVideoCall';
import { MessageBubble, formatDateHeader } from '@/components/messages';
import { VideoCallModal, IncomingCallModal } from '@/components/call';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ConversationPage() {
  const {
    conversation,
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isSending,
    typingUsers,
    showEmojiPicker,
    setShowEmojiPicker,
    messagesEndRef,
    inputRef,
    participant,
    user,
    isAuthenticated,
    handleTyping,
    handleSend,
    handleKeyDown,
    goBack,
  } = useConversation();

  const {
    activeCall,
    incomingCall,
    isConnecting,
    formattedDuration,
    isMuted,
    isVideoOff,
    isSpeakerOn,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
  } = useVideoCall();

  const handleVideoCall = () => {
    if (participant?.userId && conversation?.id) {
      startCall(participant.userId, 'video', conversation.id);
    }
  };

  const handleAudioCall = () => {
    if (participant?.userId && conversation?.id) {
      startCall(participant.userId, 'audio', conversation.id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg flex flex-col">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAnswer={answerCall}
          onDecline={declineCall}
        />
      )}

      {/* Active Call Modal */}
      {activeCall && (
        <VideoCallModal
          call={activeCall}
          isOutgoing={activeCall.callerId === user?.id}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isSpeakerOn={isSpeakerOn}
          callDuration={formattedDuration}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleSpeaker={toggleSpeaker}
          onSwitchCamera={switchCamera}
          onEndCall={endCall}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={goBack} className="text-white/70 hover:text-white">
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
                    : participant?.isOnline
                    ? 'Online'
                    : participant?.lastSeen
                    ? `Last seen ${formatTime(participant.lastSeen)}`
                    : ''}
                </p>
              </div>

              {/* Call Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAudioCall}
                  disabled={isConnecting}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Audio Call"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button
                  onClick={handleVideoCall}
                  disabled={isConnecting}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Video Call"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
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
              const showDateHeader = !prevMessage || formatDateHeader(message.createdAt) !== formatDateHeader(prevMessage.createdAt);
              const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
              const isOwn = message.senderId === user?.id;

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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 glass-heavy border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <div className="flex-1 glass rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
            />
          </div>

          {newMessage.trim() ? (
            <button
              onClick={handleSend}
              disabled={isSending}
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
