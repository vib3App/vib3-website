'use client';

import type { UserRole } from '@/services/api';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  selectedCount: number;
  isOwner: boolean;
  actionLoading: boolean;
  onBulkRoleChange: (role: UserRole) => void;
  onClearSelection: () => void;
}

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  selectedCount,
  isOwner,
  actionLoading,
  onBulkRoleChange,
  onClearSelection,
}: UserFiltersProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admins</option>
          <option value="moderator">Moderators</option>
          <option value="user">Users</option>
        </select>
      </div>

      {selectedCount > 0 && (
        <div className="mt-4 flex items-center gap-4 p-3 bg-neutral-800 rounded-lg">
          <span className="text-white font-medium">{selectedCount} selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => onBulkRoleChange('moderator')}
              disabled={actionLoading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm disabled:opacity-50"
            >
              Make Moderator
            </button>
            {isOwner && (
              <button
                onClick={() => onBulkRoleChange('admin')}
                disabled={actionLoading}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm disabled:opacity-50"
              >
                Make Admin
              </button>
            )}
            <button
              onClick={() => onBulkRoleChange('user')}
              disabled={actionLoading}
              className="px-3 py-1 bg-neutral-600 hover:bg-neutral-500 text-white rounded text-sm disabled:opacity-50"
            >
              Remove Role
            </button>
            <button
              onClick={onClearSelection}
              className="px-3 py-1 border border-neutral-600 text-neutral-400 rounded text-sm hover:bg-neutral-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
