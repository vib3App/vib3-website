'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, MicrophoneIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useLiveStream } from '@/hooks/useLiveStream';
import {
  LiveStreamHeader,
  HostControls,
  ViewerControls,
  ActionButtons,
  LiveStreamChat,
  GiftsModal,
  GuestRequestsModal,
  LiveFloatingReactions,
  GiftAnimationOverlay,
  LiveBattleOverlay,
  ModerationPanel,
  GuestRequestPanel,
} from '@/components/live';
import { LiveViewerRoom } from '@/components/live/LiveViewerRoom';
import type { LiveGuest } from '@/types';

function LiveStreamContent() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;

  const {
    // Refs
    videoRef,
    chatContainerRef,
    // Data
    stream,
    messages,
    gifts,
    viewerCount,
    loading,
    error,
    isHost,
    // LiveKit
    liveKitCredentials,
    // UI State
    chatMessage,
    setChatMessage,
    showGifts,
    setShowGifts,
    showReactions,
    setShowReactions,
    showGuestRequests,
    setShowGuestRequests,
    floatingReactions,
    isLiked,
    // Host State
    guestRequests,
    audioEnabled,
    setAudioEnabled,
    videoEnabled,
    setVideoEnabled,
    // Actions
    handleSendMessage,
    handleReaction,
    handleSendGift,
    handleLike,
    handleRequestToJoin,
    handleAcceptGuest,
    handleRejectGuest,
    handleEndStream,
  } = useLiveStream(streamId);

  const [showModeration, setShowModeration] = useState(false);
  const [showGuestPanel, setShowGuestPanel] = useState(false);

  const handleLeaveStream = () => {
    router.push('/live');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">{error || 'Stream not found'}</h1>
        <Link href="/live" className="text-pink-400 hover:underline">
          Back to Live
        </Link>
      </div>
    );
  }

  // Use LiveKit for video streaming if credentials are available
  if (liveKitCredentials && !isHost) {
    return (
      <div className="fixed inset-0 bg-black">
        <LiveViewerRoom
          token={liveKitCredentials.token}
          wsUrl={liveKitCredentials.wsUrl}
          roomName={liveKitCredentials.roomName}
          streamTitle={stream.title}
          hostName={stream.hostUsername || 'Host'}
          hostAvatar={stream.hostAvatar}
          onLeave={handleLeaveStream}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          />

          <LiveFloatingReactions reactions={floatingReactions} />
          <LiveStreamHeader stream={stream} viewerCount={viewerCount} />
          {/* Gap #39: Gift animation overlay */}
          <GiftAnimationOverlay streamId={streamId} />
          {/* Gap #40: Battle overlay */}
          <LiveBattleOverlay streamId={streamId} onSendGift={(pid) => handleSendGift(pid)} />

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              {isHost ? (
                <div className="flex items-center gap-2">
                  <HostControls
                    audioEnabled={audioEnabled}
                    videoEnabled={videoEnabled}
                    guestRequestCount={guestRequests.length}
                    onToggleAudio={() => setAudioEnabled(!audioEnabled)}
                    onToggleVideo={() => setVideoEnabled(!videoEnabled)}
                    onShowGuestRequests={() => setShowGuestRequests(true)}
                    onEndStream={handleEndStream}
                  />
                  {/* Gap #43: Moderation button */}
                  <button
                    onClick={() => setShowModeration(true)}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                    title="Moderation"
                  >
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <ViewerControls
                  allowGuests={stream.allowGuests}
                  onRequestToJoin={handleRequestToJoin}
                />
              )}

              <ActionButtons
                isLiked={isLiked}
                showReactions={showReactions}
                onLike={handleLike}
                onToggleReactions={() => setShowReactions(!showReactions)}
                onShowGifts={() => setShowGifts(true)}
                onReaction={handleReaction}
              />
            </div>
          </div>

          {stream.guests.length > 0 && (
            <div className="absolute top-20 right-4 space-y-2">
              {stream.guests.map((guest: LiveGuest) => (
                <div
                  key={guest.userId}
                  className="w-24 aspect-video bg-gray-800 rounded-lg overflow-hidden relative"
                >
                  {guest.avatar ? (
                    <Image src={guest.avatar} alt={guest.username + "'s avatar"} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      {guest.username}
                    </div>
                  )}
                  {guest.isMuted && (
                    <div className="absolute bottom-1 right-1 p-1 bg-red-500 rounded-full">
                      <MicrophoneIcon className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <LiveStreamChat
          ref={chatContainerRef}
          messages={messages}
          chatMessage={chatMessage}
          onChatMessageChange={setChatMessage}
          onSendMessage={handleSendMessage}
        />
      </div>

      <GiftsModal
        isOpen={showGifts}
        gifts={gifts}
        onClose={() => setShowGifts(false)}
        onSendGift={handleSendGift}
      />

      {isHost && (
        <GuestRequestsModal
          isOpen={showGuestRequests}
          requests={guestRequests}
          onClose={() => setShowGuestRequests(false)}
          onAccept={handleAcceptGuest}
          onReject={handleRejectGuest}
        />
      )}

      {/* Gap #42: Guest request panel */}
      {isHost && (
        <GuestRequestPanel
          streamId={streamId}
          isOpen={showGuestPanel}
          onClose={() => setShowGuestPanel(false)}
        />
      )}

      {/* Gap #43: Moderation panel */}
      {isHost && (
        <ModerationPanel
          streamId={streamId}
          isOpen={showModeration}
          onClose={() => setShowModeration(false)}
        />
      )}

      <style jsx global>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-200px) scale(1.5); }
        }
        .animate-float-up { animation: float-up 2s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default function LiveStreamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <LiveStreamContent />
    </Suspense>
  );
}
