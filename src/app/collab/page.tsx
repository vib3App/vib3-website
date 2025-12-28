'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  VideoCameraIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { collaborationApi } from '@/services/api';
import type { CollabRoom, CollabRoomStatus } from '@/types/collaboration';

const STATUS_CONFIG: Record<CollabRoomStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  waiting: { label: 'Waiting', color: 'bg-yellow-500', icon: ClockIcon },
  recording: { label: 'Recording', color: 'bg-red-500', icon: VideoCameraIcon },
  editing: { label: 'Editing', color: 'bg-blue-500', icon: SparklesIcon },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: XCircleIcon },
};

export default function CollabRoomsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<'discover' | 'my'>('discover');
  const [rooms, setRooms] = useState<CollabRoom[]>([]);
  const [myRooms, setMyRooms] = useState<CollabRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Create room modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createMaxParticipants, setCreateMaxParticipants] = useState(4);
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Join by code modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (tab === 'discover') {
          const data = await collaborationApi.getCollabRooms(page);
          setRooms(prev => page === 1 ? data.rooms : [...prev, ...data.rooms]);
          setHasMore(data.hasMore);
        } else {
          const data = await collaborationApi.getMyCollabRooms();
          setMyRooms(data);
        }
      } catch (err) {
        console.error('Failed to fetch collab rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [tab, page]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    setCreating(true);
    try {
      const room = await collaborationApi.createCollabRoom({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        maxParticipants: createMaxParticipants,
        isPrivate: createIsPrivate,
      });

      router.push(`/collab/${room.id}`);
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create collab room');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    try {
      const room = await collaborationApi.joinByInviteCode(inviteCode.trim());
      router.push(`/collab/${room.id}`);
    } catch (err) {
      console.error('Failed to join room:', err);
      alert('Invalid invite code');
    } finally {
      setJoining(false);
    }
  };

  const displayRooms = tab === 'discover' ? rooms : myRooms;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold">Collab Rooms</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-full transition"
            >
              Join by Code
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
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
            onClick={() => { setTab('discover'); setPage(1); }}
            className={`px-4 py-2 rounded-full font-medium transition ${
              tab === 'discover'
                ? 'bg-white text-black'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-full font-medium transition ${
              tab === 'my'
                ? 'bg-white text-black'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            My Collabs
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayRooms.length === 0 ? (
          <div className="text-center py-20">
            <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">
              {tab === 'discover' ? 'No collab rooms found' : 'No collabs yet'}
            </h2>
            <p className="text-gray-400 mb-6">
              {tab === 'discover'
                ? 'Be the first to create a collab room!'
                : 'Create or join a collab to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
            >
              Create Collab Room
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayRooms.map(room => {
              const statusConfig = STATUS_CONFIG[room.status];
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={room.id}
                  href={`/collab/${room.id}`}
                  className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${statusConfig.color} flex items-center justify-center`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-400">{statusConfig.label}</span>
                    </div>
                    {room.isPrivate && (
                      <LockClosedIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2 group-hover:text-pink-400 transition">
                    {room.title}
                  </h3>

                  {room.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                      {room.creatorAvatar ? (
                        <img src={room.creatorAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                          {room.creatorUsername[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm">{room.creatorUsername}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-4 h-4" />
                      {room.participants.length}/{room.maxParticipants}
                    </div>
                    <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Participant avatars */}
                  <div className="flex -space-x-2 mt-3">
                    {room.participants.slice(0, 5).map((p, i) => (
                      <div
                        key={p.userId}
                        className="w-6 h-6 rounded-full border-2 border-black bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden"
                        style={{ zIndex: 5 - i }}
                      >
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                            {p.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    {room.participants.length > 5 && (
                      <div className="w-6 h-6 rounded-full border-2 border-black bg-gray-700 flex items-center justify-center text-[10px]">
                        +{room.participants.length - 5}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {hasMore && tab === 'discover' && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition"
            >
              Load More
            </button>
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Collab Room</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title *</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="What's this collab about?"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Tell collaborators what to expect..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Participants</label>
                <select
                  value={createMaxParticipants}
                  onChange={(e) => setCreateMaxParticipants(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                >
                  {[2, 3, 4, 5, 6, 8, 10].map(n => (
                    <option key={n} value={n}>{n} participants</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Private Room</div>
                  <div className="text-sm text-gray-400">Only people with the code can join</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateIsPrivate(!createIsPrivate)}
                  className={`w-12 h-6 rounded-full transition ${
                    createIsPrivate ? 'bg-pink-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      createIsPrivate ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={!createTitle.trim() || creating}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
              >
                {creating ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join by Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Join by Invite Code</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinByCode} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter code..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 text-center text-xl tracking-widest font-mono"
                  maxLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={!inviteCode.trim() || joining}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
              >
                {joining ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
