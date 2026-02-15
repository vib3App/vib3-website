'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  ClipboardIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { userApi } from '@/services/api';

interface ShareUser {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
}

interface CollabShareModalProps {
  inviteCode?: string;
  roomId: string;
  copied: boolean;
  onCopyCode: () => void;
  onShareLink: () => void;
  onInviteUser?: (userId: string) => Promise<void>;
  onClose: () => void;
}

export function CollabShareModal({
  inviteCode,
  roomId: _roomId,
  copied,
  onCopyCode,
  onShareLink,
  onInviteUser,
  onClose,
}: CollabShareModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<ShareUser[]>([]);
  const [searchResults, setSearchResults] = useState<ShareUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());
  const [invitingUser, setInvitingUser] = useState<string | null>(null);

  // Load friends on mount
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsList = await userApi.getFriends();
        setFriends(friendsList);
      } catch (err) {
        console.error('Failed to load friends:', err);
      }
    };
    loadFriends();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await userApi.searchUsers(searchQuery, 10);
        // Transform to ShareUser format and filter out already shown friends
        const friendIds = new Set(friends.map(f => f.id));
        const results: ShareUser[] = users
          .filter(u => !friendIds.has(u._id))
          .map(u => ({
            id: u._id,
            username: u.username,
            displayName: u.displayName,
            avatar: u.profilePicture,
            bio: u.bio,
          }));
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, friends]);

  const handleInvite = useCallback(async (user: ShareUser) => {
    if (!onInviteUser || invitedUsers.has(user.id)) return;

    setInvitingUser(user.id);
    try {
      await onInviteUser(user.id);
      setInvitedUsers(prev => new Set([...prev, user.id]));
    } catch (err) {
      console.error('Failed to invite user:', err);
    } finally {
      setInvitingUser(null);
    }
  }, [onInviteUser, invitedUsers]);

  const renderUser = (user: ShareUser, isFriend: boolean = false) => {
    const isInvited = invitedUsers.has(user.id);
    const isInviting = invitingUser === user.id;

    return (
      <div
        key={user.id}
        className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden flex-shrink-0">
            {user.avatar ? (
              <Image src={user.avatar} alt="" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                {(user.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{user.username}</div>
            {user.displayName && user.displayName !== user.username && (
              <div className="text-sm text-gray-400 truncate">{user.displayName}</div>
            )}
            {isFriend && (
              <div className="text-xs text-teal-400">Friend</div>
            )}
          </div>
        </div>

        <button
          onClick={() => handleInvite(user)}
          disabled={isInvited || isInviting || !onInviteUser}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
            isInvited
              ? 'bg-green-500/20 text-green-400'
              : 'bg-pink-500 hover:bg-pink-600 text-white'
          } disabled:opacity-50`}
        >
          {isInvited ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Invited
            </>
          ) : isInviting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlusIcon className="w-4 h-4" />
              Invite
            </>
          )}
        </button>
      </div>
    );
  };

  // Filter friends by search query if searching
  const filteredFriends = searchQuery.trim()
    ? friends.filter(f =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold">Share Collab</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users to invite..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* User Lists */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Friends Section */}
          {filteredFriends.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                {searchQuery ? 'Friends matching search' : 'Friends'}
              </h3>
              <div className="space-y-1">
                {filteredFriends.map(friend => renderUser(friend, true))}
              </div>
            </div>
          )}

          {/* Search Results Section */}
          {searchResults.length > 0 && (
            <div className="p-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Other Users</h3>
              <div className="space-y-1">
                {searchResults.map(user => renderUser(user))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {searchQuery && !loading && filteredFriends.length === 0 && searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No users found for &quot;{searchQuery}&quot;
            </div>
          )}

          {/* No Friends Yet */}
          {!searchQuery && friends.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p className="mb-2">No friends yet</p>
              <p className="text-sm">Follow people who follow you back to see them here</p>
            </div>
          )}
        </div>

        {/* Share Options */}
        <div className="p-4 border-t border-white/10 space-y-3 flex-shrink-0">
          {inviteCode && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Invite Code</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2.5 bg-black/50 rounded-lg text-lg tracking-widest font-mono text-center">
                  {inviteCode}
                </code>
                <button
                  onClick={onCopyCode}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  <ClipboardIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onShareLink}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition"
          >
            {copied ? 'Link Copied!' : 'Copy Share Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
