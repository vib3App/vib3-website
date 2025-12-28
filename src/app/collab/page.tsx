'use client';

import { PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useCollabRooms } from '@/hooks/useCollabRooms';
import { CollabRoomCard, CreateRoomModal, JoinByCodeModal } from '@/components/collab-rooms';

export default function CollabRoomsPage() {
  const c = useCollabRooms();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold">Collab Rooms</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => c.setShowJoinModal(true)}
              className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-full transition"
            >
              Join by Code
            </button>
            <button
              onClick={() => c.setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium text-sm hover:opacity-90 transition"
            >
              <PlusIcon className="w-4 h-4" />
              Create Room
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => c.switchTab('discover')}
            className={`px-4 py-2 rounded-full font-medium transition ${
              c.tab === 'discover' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => c.switchTab('my')}
            className={`px-4 py-2 rounded-full font-medium transition ${
              c.tab === 'my' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            My Collabs
          </button>
        </div>

        {c.loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : c.displayRooms.length === 0 ? (
          <div className="text-center py-20">
            <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">
              {c.tab === 'discover' ? 'No collab rooms found' : 'No collabs yet'}
            </h2>
            <p className="text-gray-400 mb-6">
              {c.tab === 'discover'
                ? 'Be the first to create a collab room!'
                : 'Create or join a collab to get started'}
            </p>
            <button
              onClick={() => c.setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
            >
              Create Collab Room
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.displayRooms.map(room => (
              <CollabRoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {c.hasMore && c.tab === 'discover' && (
          <div className="mt-8 text-center">
            <button
              onClick={c.loadMore}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition"
            >
              Load More
            </button>
          </div>
        )}
      </main>

      <CreateRoomModal
        isOpen={c.showCreateModal}
        onClose={() => c.setShowCreateModal(false)}
        title={c.createTitle}
        setTitle={c.setCreateTitle}
        description={c.createDescription}
        setDescription={c.setCreateDescription}
        maxParticipants={c.createMaxParticipants}
        setMaxParticipants={c.setCreateMaxParticipants}
        isPrivate={c.createIsPrivate}
        setIsPrivate={c.setCreateIsPrivate}
        creating={c.creating}
        onSubmit={c.handleCreateRoom}
      />

      <JoinByCodeModal
        isOpen={c.showJoinModal}
        onClose={() => c.setShowJoinModal(false)}
        inviteCode={c.inviteCode}
        setInviteCode={c.setInviteCode}
        joining={c.joining}
        onSubmit={c.handleJoinByCode}
      />
    </div>
  );
}
