'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useConversation } from '@/hooks/useConversation';
import { useVideoCall } from '@/hooks/useVideoCall';
import { useVoIPPush } from '@/hooks/useVoIPPush';
import {
  MessageBubble, formatDateHeader, EmojiPicker, ReplyPreview,
  ChatCameraCapture, AISuggestions, LiveLocationShare, ForwardModal,
} from '@/components/messages';
import type { Message } from '@/types';
import { ConversationHeader } from '@/components/messages/ConversationHeader';
import { VoiceRecorder } from '@/components/messages/VoiceRecorder';
import { MediaUploader } from '@/components/messages/MediaUploader';
import { LocationPicker } from '@/components/messages/LocationPicker';
import { GifPicker } from '@/components/messages/GifPicker';
import { VideoCallModal, IncomingCallModal } from '@/components/call';

export default function ConversationPage() {
  const { isAuthVerified } = useAuthStore();
  const {
    conversation, messages, newMessage, setNewMessage,
    isLoading, isSending, typingUsers,
    showEmojiPicker, setShowEmojiPicker, replyingTo,
    messagesEndRef, inputRef, participant, user, isAuthenticated,
    handleTyping, handleSend, handleKeyDown,
    handleReaction, handleReply, cancelReply, handleDelete,
    handleEmojiSelect, handleSendMedia, handleSendLocation,
    handleSendVoice, handleSendGif, handleDeleteForMe, goBack,
  } = useConversation();

  const {
    activeCall, incomingCall, isConnecting, formattedDuration,
    isMuted, isVideoOff, isSpeakerOn, localVideoRef, remoteVideoRef,
    startCall, answerCall, declineCall, endCall,
    toggleMute, toggleVideo, toggleSpeaker, switchCamera,
  } = useVideoCall();

  const voipPush = useVoIPPush();
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (isAuthenticated && !voipPush.isRegistered) voipPush.register();
    return () => { voipPush.unregister(); };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVideoCall = () => {
    if (participant?.userId && conversation?.id) startCall(participant.userId, 'video', conversation.id);
  };
  const handleAudioCall = () => {
    if (participant?.userId && conversation?.id) startCall(participant.userId, 'audio', conversation.id);
  };
  const handleStartLocationShare = useCallback((min: number) => {
    setIsSharingLocation(true);
    setTimeout(() => setIsSharingLocation(false), min * 60000);
  }, []);
  const handleStopLocationShare = useCallback(() => setIsSharingLocation(false), []);
  const handleCameraCapture = useCallback((file: File, type: 'image' | 'video') => {
    handleSendMedia(file, type);
    setShowCamera(false);
  }, [handleSendMedia]);

  const handleMediaUpload = useCallback((file: File, type: 'image' | 'video') => {
    handleSendMedia(file, type);
    setShowMediaUploader(false);
  }, [handleSendMedia]);

  const handleLocationSend = useCallback((lat: number, lng: number, address?: string) => {
    handleSendLocation(lat, lng, address);
    setShowLocationPicker(false);
  }, [handleSendLocation]);

  const handleGifSelect = useCallback((gifUrl: string) => {
    handleSendGif(gifUrl);
    setShowGifPicker(false);
  }, [handleSendGif]);

  const handleVoiceSend = useCallback((blob: Blob, duration: number) => {
    handleSendVoice(blob, duration);
    setShowVoiceRecorder(false);
  }, [handleSendVoice]);

  const lastOtherMessage = [...messages].reverse().find(m => m.senderId !== user?.id);

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg flex flex-col">
      {incomingCall && <IncomingCallModal call={incomingCall} onAnswer={answerCall} onDecline={declineCall} />}
      {activeCall && (
        <VideoCallModal
          call={activeCall} isOutgoing={activeCall.callerId === user?.id}
          localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef}
          isMuted={isMuted} isVideoOff={isVideoOff} isSpeakerOn={isSpeakerOn}
          callDuration={formattedDuration}
          onToggleMute={toggleMute} onToggleVideo={toggleVideo}
          onToggleSpeaker={toggleSpeaker} onSwitchCamera={switchCamera} onEndCall={endCall}
        />
      )}
      {forwardingMessage && (
        <ForwardModal
          message={forwardingMessage}
          onClose={() => setForwardingMessage(null)}
          onForwarded={() => setForwardingMessage(null)}
        />
      )}
      {showCamera && <ChatCameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
      {showMediaUploader && <MediaUploader onSend={handleMediaUpload} onClose={() => setShowMediaUploader(false)} />}
      {showLocationPicker && <LocationPicker onSend={handleLocationSend} onClose={() => setShowLocationPicker(false)} />}

      <ConversationHeader
        conversation={conversation} participant={participant}
        typingUsers={typingUsers} isConnecting={isConnecting}
        onBack={goBack} onAudioCall={handleAudioCall} onVideoCall={handleVideoCall}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const prev = messages[index - 1];
              const showDate = !prev || formatDateHeader(message.createdAt) !== formatDateHeader(prev.createdAt);
              const showAvatar = !prev || prev.senderId !== message.senderId;
              const isOwn = message.senderId === user?.id;
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-white/30 text-xs glass px-3 py-1 rounded-full">{formatDateHeader(message.createdAt)}</span>
                    </div>
                  )}
                  <MessageBubble
                    message={message} isOwn={isOwn} showAvatar={showAvatar}
                    currentUserId={user?.id}
                    onReact={handleReaction} onReply={handleReply}
                    onDelete={handleDelete} onDeleteForMe={handleDeleteForMe}
                    onForward={setForwardingMessage}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 glass-heavy border-t border-white/10 p-4 space-y-2">
        <LiveLocationShare
          isSharing={isSharingLocation} onStartSharing={handleStartLocationShare}
          onStopSharing={handleStopLocationShare} conversationId={conversation?.id}
          peerUsername={participant?.username}
        />
        {lastOtherMessage && (
          <AISuggestions
            lastMessageContent={lastOtherMessage.content}
            lastMessageSenderId={lastOtherMessage.senderId}
            currentUserId={user?.id || ''}
            onSelectSuggestion={(text) => { setNewMessage(text); inputRef.current?.focus(); }}
          />
        )}
        {replyingTo && (
          <ReplyPreview senderUsername={replyingTo.senderUsername} content={replyingTo.content} onDismiss={cancelReply} />
        )}

        {/* Voice recorder replaces input when active */}
        {showVoiceRecorder ? (
          <VoiceRecorder onSend={handleVoiceSend} />
        ) : (
          <>
            <div className="relative">
              {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
              {showGifPicker && <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />}
            </div>
            <div className="flex items-center gap-3">
              {/* Emoji button */}
              <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }} className="text-white/50 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* GIF button */}
              <button
                onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}
                className="text-white/50 hover:text-white text-xs font-bold border border-white/30 rounded px-1 py-0.5"
                title="GIFs & Stickers"
              >
                GIF
              </button>

              {/* Camera button */}
              <button onClick={() => setShowCamera(true)} className="text-white/50 hover:text-white" title="Camera">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Media upload button (image/video file picker) */}
              <button onClick={() => setShowMediaUploader(true)} className="text-white/50 hover:text-white" title="Send image or video">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Location button */}
              <button onClick={() => setShowLocationPicker(true)} className="text-white/50 hover:text-white" title="Send location">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Text input */}
              <div className="flex-1 glass rounded-full px-4 py-2">
                <input
                  ref={inputRef} type="text" value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder={replyingTo ? 'Type a reply...' : 'Message...'}
                  className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
                />
              </div>

              {/* Send or Voice toggle */}
              {newMessage.trim() ? (
                <button onClick={handleSend} disabled={isSending}
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-teal-600 disabled:opacity-50">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
              ) : (
                <button
                  onClick={() => setShowVoiceRecorder(true)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Record voice message"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
