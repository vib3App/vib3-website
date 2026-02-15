'use client';

import Image from 'next/image';
import type { AdminUser, UserRole } from '@/services/api';

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  selectedUsers: Set<string>;
  actionLoading: string | null;
  total: number;
  page: number;
  limit: number;
  onToggleSelection: (userId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
  onPageChange: (page: number) => void;
  canChangeRole: (user: AdminUser) => boolean;
  getAvailableRoles: (user: AdminUser) => UserRole[];
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'moderator': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  }
}

export function UsersTable({
  users,
  loading,
  selectedUsers,
  actionLoading,
  total,
  page,
  limit,
  onToggleSelection,
  onSelectAll,
  onRoleChange,
  onPageChange,
  canChangeRole,
  getAvailableRoles,
}: UsersTableProps) {
  const selectableUsers = users.filter(u => canChangeRole(u));
  const allSelected = selectableUsers.length > 0 && selectedUsers.size === selectableUsers.length;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {loading ? (
        <div className="p-12 text-center text-neutral-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-neutral-400">No users found</div>
      ) : (
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-4 py-3 text-left text-neutral-400 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded bg-neutral-700 border-neutral-600"
                />
              </th>
              <th className="px-4 py-3 text-left text-neutral-400 text-sm font-medium">User</th>
              <th className="px-4 py-3 text-left text-neutral-400 text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-neutral-400 text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-neutral-400 text-sm font-medium">Joined</th>
              <th className="px-4 py-3 text-right text-neutral-400 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-neutral-800/50">
                <td className="px-4 py-3">
                  {canChangeRole(user) && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user._id)}
                      onChange={() => onToggleSelection(user._id)}
                      className="rounded bg-neutral-700 border-neutral-600"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                      {user.profilePicture ? (
                        <Image src={user.profilePicture} alt="" width={40} height={40} className="w-10 h-10 object-cover" />
                      ) : (
                        <span className="text-white font-medium">{user.username?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-neutral-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded border text-sm font-medium ${getRoleBadgeColor(user.effectiveRole)}`}>
                    {user.effectiveRole.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.accountStatus === 'banned' && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Banned</span>
                    )}
                    {user.isVerified && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Verified</span>
                    )}
                    {(user.warningCount || 0) > 0 && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">{user.warningCount} warnings</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {canChangeRole(user) ? (
                    <select
                      value={user.effectiveRole}
                      onChange={(e) => onRoleChange(user._id, e.target.value as UserRole)}
                      disabled={actionLoading === user._id}
                      className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-sm disabled:opacity-50"
                    >
                      {getAvailableRoles(user).map((role) => (
                        <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-neutral-500 text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {total > limit && (
        <div className="px-4 py-3 bg-neutral-800 border-t border-neutral-700 flex items-center justify-between">
          <p className="text-neutral-400 text-sm">
            Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
