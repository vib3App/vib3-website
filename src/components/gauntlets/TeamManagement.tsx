'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { searchApi } from '@/services/api';
import { logger } from '@/utils/logger';

export interface TeamMemberInfo {
  userId: string;
  username: string;
  avatar?: string;
  role: 'captain' | 'member';
  joinedAt: string;
}

interface TeamManagementProps {
  gauntletId: string;
  teamName: string;
  teamAvatar?: string;
  members: TeamMemberInfo[];
  isCaptain: boolean;
  onUpdateName: (name: string) => void;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateAvatar: (url: string) => void;
}

export function TeamManagement({
  gauntletId: _gauntletId,
  teamName,
  teamAvatar,
  members,
  isCaptain,
  onUpdateName,
  onAddMember,
  onRemoveMember,
  onUpdateAvatar,
}: TeamManagementProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(teamName);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSaveName = useCallback(() => {
    if (nameInput.trim() && nameInput !== teamName) {
      onUpdateName(nameInput.trim());
    }
    setEditingName(false);
  }, [nameInput, teamName, onUpdateName]);

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4">
          {/* Team Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-teal-500">
              {teamAvatar ? (
                <Image src={teamAvatar} alt={teamName} width={80} height={80} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {teamName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isCaptain && (
              <button
                onClick={() => {
                  const url = prompt('Enter avatar image URL:');
                  if (url) onUpdateAvatar(url);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-xl"
              >
                <PencilIcon className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Team Name */}
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white/5 border border-white/20 rounded-lg text-white text-lg font-bold focus:outline-none focus:border-purple-500"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                />
                <button onClick={handleSaveName} className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg">
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-white text-xl font-bold">{teamName}</h2>
                {isCaptain && (
                  <button onClick={() => setEditingName(true)} className="p-1 hover:bg-white/10 rounded transition">
                    <PencilIcon className="w-4 h-4 text-white/40" />
                  </button>
                )}
              </div>
            )}
            <p className="text-white/50 text-sm mt-1">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold">Roster</h3>
          {isCaptain && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full hover:bg-purple-500/30 transition"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>

        <div className="divide-y divide-white/5">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                {member.avatar ? (
                  <Image src={member.avatar} alt={member.username} width={40} height={40} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-bold">
                    {member.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">@{member.username}</p>
                <p className="text-white/40 text-xs capitalize">{member.role}</p>
              </div>
              {isCaptain && member.role !== 'captain' && (
                <button
                  onClick={() => onRemoveMember(member.userId)}
                  className="p-2 hover:bg-red-500/20 rounded-full transition"
                  title="Remove member"
                >
                  <TrashIcon className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={(userId) => {
            onAddMember(userId);
            setShowAddModal(false);
          }}
          existingIds={members.map((m) => m.userId)}
        />
      )}
    </div>
  );
}

function AddMemberModal({ onClose, onAdd, existingIds }: {
  onClose: () => void;
  onAdd: (userId: string) => void;
  existingIds: string[];
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; username: string; avatar?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setIsSearching(true);
    try {
      const data = await searchApi.search(q, { type: 'users' });
      const users = (data.users || [])
        .filter((u) => !existingIds.includes(u.id))
        .map((u) => ({
          id: u.id,
          username: u.username,
          avatar: u.avatar,
        }));
      setResults(users);
    } catch (err) {
      logger.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, [existingIds]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold">Add Member</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
            <XMarkIcon className="w-5 h-5 text-white/60" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {isSearching && <p className="text-white/30 text-sm text-center py-4">Searching...</p>}
            {results.map((u) => (
              <button
                key={u.id}
                onClick={() => onAdd(u.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition text-left"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10">
                  {u.avatar ? (
                    <Image src={u.avatar} alt={u.username} width={32} height={32} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-bold">
                      {u.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-white text-sm">@{u.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
