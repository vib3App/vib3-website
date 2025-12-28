'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExclamationTriangleIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
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
} from '@/components/live';
import type { LiveGuest } from '@/types';

function LiveStreamContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const streamId = params.id as string;
  const isHost = searchParams.get('host') === 'true';

  const ls = useLiveStream(streamId, isHost);

  if (ls.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (ls.error || !ls.stream) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">{ls.error || 'Stream not found'}</h1>
        <Link href="/live" className="text-pink-400 hover:underline">
          Back to Live
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="flex-1 relative">
          <video
            ref={ls.videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          />

          <LiveFloatingReactions reactions={ls.floatingReactions} />
          <LiveStreamHeader stream={ls.stream} viewerCount={ls.viewerCount} />

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              {isHost ? (
                <HostControls
                  audioEnabled={ls.audioEnabled}
                  videoEnabled={ls.videoEnabled}
                  guestRequestCount={ls.guestRequests.length}
                  onToggleAudio={() => ls.setAudioEnabled(!ls.audioEnabled)}
                  onToggleVideo={() => ls.setVideoEnabled(!ls.videoEnabled)}
                  onShowGuestRequests={() => ls.setShowGuestRequests(true)}
                  onEndStream={ls.handleEndStream}
                />
              ) : (
                <ViewerControls
                  allowGuests={ls.stream.allowGuests}
                  onRequestToJoin={ls.handleRequestToJoin}
                />
              )}

              <ActionButtons
                isLiked={ls.isLiked}
                showReactions={ls.showReactions}
                onLike={ls.handleLike}
                onToggleReactions={() => ls.setShowReactions(!ls.showReactions)}
                onShowGifts={() => ls.setShowGifts(true)}
                onReaction={ls.handleReaction}
              />
            </div>
          </div>

          {ls.stream.guests.length > 0 && (
            <div className="absolute top-20 right-4 space-y-2">
              {ls.stream.guests.map((guest: LiveGuest) => (
                <div
                  key={guest.userId}
                  className="w-24 aspect-video bg-gray-800 rounded-lg overflow-hidden relative"
                >
                  {guest.avatar ? (
                    <img src={guest.avatar} alt="" className="w-full h-full object-cover" />
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
          ref={ls.chatContainerRef}
          messages={ls.messages}
          chatMessage={ls.chatMessage}
          onChatMessageChange={ls.setChatMessage}
          onSendMessage={ls.handleSendMessage}
        />
      </div>

      <GiftsModal
        isOpen={ls.showGifts}
        gifts={ls.gifts}
        onClose={() => ls.setShowGifts(false)}
        onSendGift={ls.handleSendGift}
      />

      {isHost && (
        <GuestRequestsModal
          isOpen={ls.showGuestRequests}
          requests={ls.guestRequests}
          onClose={() => ls.setShowGuestRequests(false)}
          onAccept={ls.handleAcceptGuest}
          onReject={ls.handleRejectGuest}
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
