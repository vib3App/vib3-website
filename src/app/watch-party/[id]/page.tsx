'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserGroupIcon } from '@heroicons/react/24/outline';
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
  const params = useParams();
  const partyId = params.id as string;
  const wp = useWatchParty(partyId);

  if (wp.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (wp.error || !wp.party) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <UserGroupIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">{wp.error || 'Party not found'}</h1>
        <Link href="/watch-party" className="text-pink-400 hover:underline">
          Back to Watch Parties
        </Link>
      </div>
    );
  }

  const currentVideo = wp.party.playlist[wp.party.currentVideoIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <WatchPartyHeader
        title={wp.party.title}
        participantCount={wp.party.participants.length}
        isHost={wp.isHost}
        onShare={() => wp.setShowShareModal(true)}
        onEndParty={wp.handleEndParty}
        onLeave={wp.handleLeave}
      />

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <WatchPartyPlayer
            ref={wp.videoRef}
            currentVideo={currentVideo}
            isPlaying={wp.party.status === 'playing'}
            isHost={wp.isHost}
            currentVideoIndex={wp.party.currentVideoIndex}
            playlistLength={wp.party.playlist.length}
            onPlayPause={wp.handlePlayPause}
            onSkipNext={wp.handleSkipNext}
            onSkipPrevious={() => wp.handleSkipToVideo(Math.max(0, wp.party!.currentVideoIndex - 1))}
            onAddVideo={() => wp.setShowAddVideoModal(true)}
          />

          <WatchPartyPlaylist
            playlist={wp.party.playlist}
            currentVideoIndex={wp.party.currentVideoIndex}
            isHost={wp.isHost}
            isOpen={wp.showPlaylist}
            onToggle={() => wp.setShowPlaylist(!wp.showPlaylist)}
            onSkipToVideo={wp.handleSkipToVideo}
            onRemoveVideo={wp.handleRemoveFromPlaylist}
            onAddVideo={() => wp.setShowAddVideoModal(true)}
          />
        </div>

        <WatchPartyChatSidebar
          ref={wp.chatContainerRef}
          messages={wp.messages}
          participants={wp.party.participants}
          showParticipants={wp.showParticipants}
          chatMessage={wp.chatMessage}
          onToggleView={wp.setShowParticipants}
          onChatMessageChange={wp.setChatMessage}
          onSendMessage={wp.handleSendMessage}
        />
      </div>

      <ShareModal
        isOpen={wp.showShareModal}
        inviteCode={wp.party.inviteCode}
        copied={wp.copied}
        onClose={() => wp.setShowShareModal(false)}
        onCopyCode={wp.copyInviteCode}
        onCopyLink={wp.copyShareLink}
      />

      <AddVideoModal
        isOpen={wp.showAddVideoModal}
        searchQuery={wp.searchQuery}
        searchResults={wp.searchResults}
        searching={wp.searching}
        onClose={() => {
          wp.setShowAddVideoModal(false);
          wp.setSearchQuery('');
        }}
        onSearchChange={wp.setSearchQuery}
        onSearch={wp.handleSearch}
        onAddVideo={wp.handleAddVideo}
      />
    </div>
  );
}
