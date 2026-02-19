'use client';

import { useState } from 'react';

interface CircleMemberListProps {
  members: string[];
  creatorId: string;
  currentUserId: string | undefined;
  onAddMember: (userId: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export function CircleMemberList({ members, creatorId, currentUserId, onAddMember, onRemoveMember }: CircleMemberListProps) {
  const [newMemberId, setNewMemberId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const isCreator = currentUserId === creatorId;

  const handleAdd = async () => {
    const trimmed = newMemberId.trim();
    if (!trimmed) return;
    setIsAdding(true);
    try {
      await onAddMember(trimmed);
      setNewMemberId('');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <h3 className="text-white font-semibold mb-4">Members ({members.length})</h3>

      {isCreator && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newMemberId}
            onChange={e => setNewMemberId(e.target.value)}
            placeholder="Enter user ID to add"
            className="flex-1 bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-2 outline-none border border-white/10 focus:border-purple-500/50 text-sm"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newMemberId.trim() || isAdding}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No members yet</p>
        ) : (
          members.map(memberId => (
            <div key={memberId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                  {memberId.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-white text-sm font-medium">
                  {memberId === creatorId ? `${memberId} (Creator)` : memberId}
                </span>
              </div>
              {isCreator && memberId !== creatorId && (
                <button onClick={() => onRemoveMember(memberId)} className="text-red-400 hover:text-red-300 transition p-1" title="Remove member">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
