'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCollabRoom } from '@/hooks/useCollabRoom';
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

export default function CollabRoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const collab = useCollabRoom(roomId);

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

          <CollabParticipantsList
            participants={room.participants}
            description={room.description}
            inviteCode={room.inviteCode}
            copied={collab.copied}
            onCopyCode={collab.copyInviteCode}
          />
        </div>
      </main>

      {collab.showShareModal && (
        <CollabShareModal
          inviteCode={room.inviteCode}
          copied={collab.copied}
          onCopyCode={collab.copyInviteCode}
          onShareLink={collab.shareLink}
          onClose={() => collab.setShowShareModal(false)}
        />
      )}
    </div>
  );
}
