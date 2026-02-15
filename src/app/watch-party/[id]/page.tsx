'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { useWatchParty } from '@/hooks/useWatchParty';
import {
  WatchPartyHeader,
  WatchPartyPlayer,
  WatchPartyPlaylist,
  WatchPartyChatSidebar,
  ShareModal,
  AddVideoModal,
} from '@/components/watch-party';

export default function WatchPartyRoom() {
  const router = useRouter();
  const params = useParams();
  const partyId = params.id as string;
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const {
    // Refs
    videoRef,
    chatContainerRef,
    // Data
    party,
    messages,
    loading,
    error,
    isHost,
    // UI State
    chatMessage,
    setChatMessage,
    showPlaylist,
    setShowPlaylist,
    showParticipants,
    setShowParticipants,
    showShareModal,
    setShowShareModal,
    showAddVideoModal,
    setShowAddVideoModal,
    copied,
    // Search
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    // Actions
    handleSendMessage,
    handlePlayPause,
    handleSkipNext,
    handleSkipToVideo,
    handleRemoveFromPlaylist,
    handleAddVideo,
    handleSearch,
    handleLeave,
    handleEndParty,
    copyShareLink,
    copyInviteCode,
  } = useWatchParty(partyId);

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/watch-party/' + partyId);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <UserGroupIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">{error || 'Party not found'}</h1>
        <Link href="/watch-party" className="text-pink-400 hover:underline">
          Back to Watch Parties
        </Link>
      </div>
    );
  }

  const currentVideo = party.playlist[party.currentVideoIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <WatchPartyHeader
        title={party.title}
        participantCount={party.participants.length}
        isHost={isHost}
        onShare={() => setShowShareModal(true)}
        onEndParty={handleEndParty}
        onLeave={handleLeave}
      />

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <WatchPartyPlayer
            ref={videoRef}
            currentVideo={currentVideo}
            isPlaying={party.status === 'playing'}
            isHost={isHost}
            currentVideoIndex={party.currentVideoIndex}
            playlistLength={party.playlist.length}
            onPlayPause={handlePlayPause}
            onSkipNext={handleSkipNext}
            onSkipPrevious={() => handleSkipToVideo(Math.max(0, party!.currentVideoIndex - 1))}
            onAddVideo={() => setShowAddVideoModal(true)}
          />

          <WatchPartyPlaylist
            playlist={party.playlist}
            currentVideoIndex={party.currentVideoIndex}
            isHost={isHost}
            isOpen={showPlaylist}
            onToggle={() => setShowPlaylist(!showPlaylist)}
            onSkipToVideo={handleSkipToVideo}
            onRemoveVideo={handleRemoveFromPlaylist}
            onAddVideo={() => setShowAddVideoModal(true)}
          />
        </div>

        <WatchPartyChatSidebar
          ref={chatContainerRef}
          messages={messages}
          participants={party.participants}
          showParticipants={showParticipants}
          chatMessage={chatMessage}
          onToggleView={setShowParticipants}
          onChatMessageChange={setChatMessage}
          onSendMessage={handleSendMessage}
        />
      </div>

      <ShareModal
        isOpen={showShareModal}
        inviteCode={party.inviteCode}
        copied={copied}
        onClose={() => setShowShareModal(false)}
        onCopyCode={copyInviteCode}
        onCopyLink={copyShareLink}
      />

      <AddVideoModal
        isOpen={showAddVideoModal}
        searchQuery={searchQuery}
        searchResults={searchResults}
        searching={searching}
        onClose={() => {
          setShowAddVideoModal(false);
          setSearchQuery('');
        }}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onAddVideo={handleAddVideo}
      />
    </div>
  );
}
