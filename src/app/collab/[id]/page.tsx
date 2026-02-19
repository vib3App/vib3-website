'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCollabRoom } from '@/hooks/useCollabRoom';
import { useCollabWebSocket } from '@/hooks/useCollabWebSocket';
import {
  CollabHeader,
  CollabStatusBanner,
  CollabVideoPreview,
  CollabRecordingControls,
  CollabParticipantsList,
  CollabShareModal,
} from '@/components/collab';

function LoadingState() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <UserGroupIcon className="w-16 h-16 text-gray-600 mb-4" />
      <h1 className="text-xl font-semibold mb-2">{error}</h1>
      <Link href="/collab" className="text-pink-400 hover:underline">
        Back to Collabs
      </Link>
    </div>
  );
}

const REACTION_EMOJIS = ['🔥', '❤️', '👏', '😂', '🎵', '💯'];

export default function CollabRoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const collab = useCollabRoom(roomId);
  const ws = useCollabWebSocket(roomId);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    ws.sendChat(chatInput);
    setChatInput('');
  }, [chatInput, ws]);

  if (collab.loading) return <LoadingState />;
  if (collab.error || !collab.room) return <ErrorState error={collab.error || 'Room not found'} />;

  const { room } = collab;

  return (
    <div className="min-h-screen bg-black text-white">
      <CollabHeader
        room={room}
        isCreator={collab.isCreator}
        onShare={() => collab.setShowShareModal(true)}
        onLeave={collab.handleLeave}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CollabStatusBanner status={room.status} />

            <CollabVideoPreview
              videoRef={collab.videoRef}
              recordedUrl={collab.recordedUrl}
              hasMediaStream={!!collab.mediaStream}
              isRecording={collab.isRecording}
              onStartPreview={collab.startPreview}
            />

            {collab.mediaStream && room.status === 'recording' && (
              <CollabRecordingControls
                isRecording={collab.isRecording}
                hasRecordedUrl={!!collab.recordedUrl}
                hasSubmitted={collab.hasSubmitted}
                uploadProgress={collab.uploadProgress}
                onStartRecording={collab.startRecording}
                onStopRecording={collab.stopRecording}
                onRetry={collab.retryRecording}
                onSubmit={collab.submitClip}
              />
            )}

            {room.status === 'waiting' && (
              <div className="flex items-center justify-center">
                <button
                  onClick={collab.toggleReady}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition ${
                    collab.isReady
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {collab.isReady ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Ready!
                    </>
                  ) : (
                    'Mark as Ready'
                  )}
                </button>
              </div>
            )}

            {collab.isCreator && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                {room.status === 'waiting' && collab.allReady && (
                  <button
                    onClick={collab.handleStartSession}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
                  >
                    Start Recording Session
                  </button>
                )}
                {room.status === 'recording' && collab.allSubmitted && (
                  <button
                    onClick={collab.handleFinalize}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
                  >
                    Finalize Collab
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <CollabParticipantsList
              participants={room.participants}
              description={room.description}
              inviteCode={room.inviteCode}
              copied={collab.copied}
              onCopyCode={collab.copyInviteCode}
            />

            {/* Gap #82: Real-time controls */}
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={ws.toggleMute}
                  className={`p-2 rounded-full transition ${ws.isMuted ? 'bg-red-500' : 'bg-white/10'}`}
                  title={ws.isMuted ? 'Unmute' : 'Mute'}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {ws.isMuted ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={ws.toggleCamera}
                  className={`p-2 rounded-full transition ${!ws.isCameraOn ? 'bg-red-500' : 'bg-white/10'}`}
                  title={ws.isCameraOn ? 'Camera Off' : 'Camera On'}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <span className={`text-xs ${ws.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {ws.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Reactions */}
              <div className="flex gap-1 mb-3">
                {REACTION_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => ws.sendReaction(emoji)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Floating reactions */}
              {ws.reactions.length > 0 && (
                <div className="flex gap-1 mb-2 flex-wrap">
                  {ws.reactions.map(r => (
                    <span key={r.id} className="text-xl animate-bounce">{r.emoji}</span>
                  ))}
                </div>
              )}

              {/* Chat */}
              <div className="border-t border-white/10 pt-3">
                <h4 className="text-white/50 text-xs font-medium mb-2">Chat</h4>
                <div className="max-h-32 overflow-y-auto space-y-1 mb-2 scrollbar-hide">
                  {ws.chatMessages.slice(-20).map(msg => (
                    <div key={msg.id} className="text-xs">
                      <span className="text-purple-400 font-medium">@{msg.username}: </span>
                      <span className="text-white/70">{msg.message}</span>
                    </div>
                  ))}
                  {ws.chatMessages.length === 0 && (
                    <p className="text-white/30 text-xs">No messages yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/10 text-white text-sm px-3 py-1.5 rounded-lg placeholder:text-white/30 outline-none focus:ring-1 focus:ring-pink-500"
                  />
                  <button
                    onClick={handleSendChat}
                    className="px-3 py-1.5 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {collab.showShareModal && (
        <CollabShareModal
          inviteCode={room.inviteCode}
          roomId={room.id}
          copied={collab.copied}
          onCopyCode={collab.copyInviteCode}
          onShareLink={collab.shareLink}
          onInviteUser={collab.inviteUser}
          onClose={() => collab.setShowShareModal(false)}
        />
      )}
    </div>
  );
}
