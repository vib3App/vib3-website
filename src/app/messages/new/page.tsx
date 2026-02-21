'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { userApi, messagesApi } from '@/services/api';
import { logger } from '@/utils/logger';

interface UserResult {
  _id: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  isVerified?: boolean;
}

export default function NewMessagePage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/messages/new');
    }
  }, [isAuthenticated, isAuthVerified, router]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await userApi.searchUsers(searchQuery, 20);
        setSearchResults(results.map(u => ({
          _id: u._id,
          username: u.username,
          displayName: u.displayName,
          profilePicture: u.profilePicture,
          isVerified: u.isVerified,
        })));
      } catch (error) {
        logger.error('Failed to search users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectUser = async (user: UserResult) => {
    if (isCreating) return;

    if (isGroupMode) {
      setSelectedUsers(prev => {
        const exists = prev.find(u => u._id === user._id);
        if (exists) return prev.filter(u => u._id !== user._id);
        return [...prev, user];
      });
      return;
    }

    // Direct message - create/find conversation
    setIsCreating(true);
    try {
      const conversation = await messagesApi.getOrCreateConversation(user._id);
      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      logger.error('Failed to create conversation:', error);
      setIsCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (isCreating || selectedUsers.length < 2) return;
    setIsCreating(true);
    try {
      const name = groupName.trim() || selectedUsers.map(u => u.username).join(', ');
      const conversation = await messagesApi.createGroupConversation(
        name,
        selectedUsers.map(u => u._id)
      );
      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      logger.error('Failed to create group:', error);
      setIsCreating(false);
    }
  };

  const toggleGroupMode = () => {
    setIsGroupMode(prev => !prev);
    setSelectedUsers([]);
    setGroupName('');
  };

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="text-white/70 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white flex-1">
            {isGroupMode ? 'New Group' : 'New Message'}
          </h1>
          <button
            onClick={toggleGroupMode}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              isGroupMode
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {isGroupMode ? 'Cancel Group' : 'Group Chat'}
          </button>
        </div>

        {/* Group name input */}
        {isGroupMode && selectedUsers.length >= 2 && (
          <div className="px-4 pb-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name (optional)"
              className="w-full glass text-white px-4 py-2 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
        )}

        {/* Selected users chips */}
        {isGroupMode && selectedUsers.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {selectedUsers.map(user => (
              <button
                key={user._id}
                onClick={() => setSelectedUsers(prev => prev.filter(u => u._id !== user._id))}
                className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden">
                  {user.profilePicture ? (
                    <Image src={user.profilePicture} alt={user.username} width={20} height={20} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-500/30 flex items-center justify-center text-[10px] text-white">
                      {user.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-white/80">{user.username}</span>
                <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">To:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for people..."
              autoFocus
              className="w-full glass text-white pl-12 pr-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="p-4">
        {isSearching ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            <p className="text-white/50 text-sm mb-4">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </p>
            {searchResults.map(user => {
              const isSelected = selectedUsers.some(u => u._id === user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  disabled={isCreating}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors disabled:opacity-50 ${
                    isSelected ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden glass flex-shrink-0">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.username}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 text-lg font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium">
                        {user.displayName || user.username}
                      </span>
                      {user.isVerified && (
                        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white/50 text-sm">@{user.username}</span>
                  </div>

                  {isGroupMode && (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : searchQuery.length >= 2 ? (
          <div className="text-center py-8">
            <p className="text-white/50">No users found</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-white/50">Search for someone to message</p>
            <p className="text-white/30 text-sm mt-1">
              Type at least 2 characters to search
            </p>
          </div>
        )}
      </div>

      {/* Create Group Button */}
      {isGroupMode && selectedUsers.length >= 2 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button
            onClick={handleCreateGroup}
            disabled={isCreating}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Group ({selectedUsers.length} members)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
