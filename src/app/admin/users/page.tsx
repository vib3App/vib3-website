'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, type AdminUser, type UserRole, type UserStats } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export default function UserManagementPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  // Determine current user's role level
  const isOwner = currentUser?.email === 'tmc363@gmail.com';
  const isAdmin = currentUser?.isAdmin || currentUser?.role === 'admin' || isOwner;

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        adminApi.getUsers({
          search: search || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          limit: LIMIT,
          skip: page * LIMIT,
        }),
        adminApi.getUserStats().catch(() => null),
      ]);

      setUsers(usersResponse.users);
      setTotal(usersResponse.total);
      if (statsResponse) setStats(statsResponse);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setActionLoading(userId);
    try {
      await adminApi.changeUserRole(userId, newRole);
      // Refresh users
      await loadUsers();
      setSelectedUsers(new Set());
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRoleChange = async (newRole: UserRole) => {
    if (selectedUsers.size === 0) return;

    const confirmed = confirm(
      `Change ${selectedUsers.size} user(s) to ${newRole}?`
    );
    if (!confirmed) return;

    setActionLoading('bulk');
    try {
      for (const userId of selectedUsers) {
        await adminApi.changeUserRole(userId, newRole);
      }
      await loadUsers();
      setSelectedUsers(new Set());
    } catch (err: any) {
      alert(err.response?.data?.message || 'Some role changes failed');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'moderator':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const canChangeRole = (targetUser: AdminUser): boolean => {
    // Owner can change anyone except themselves
    if (isOwner && targetUser.email !== 'tmc363@gmail.com') return true;

    // Admin can only change moderators and users
    if (isAdmin && !isOwner) {
      return targetUser.effectiveRole === 'user' || targetUser.effectiveRole === 'moderator';
    }

    return false;
  };

  const getAvailableRoles = (targetUser: AdminUser): UserRole[] => {
    // Owner can assign any role except owner
    if (isOwner) {
      return ['user', 'moderator', 'admin'];
    }

    // Admin can only assign user or moderator
    if (isAdmin) {
      return ['user', 'moderator'];
    }

    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-neutral-400 mt-1">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-neutral-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-neutral-400 text-sm">Admins</p>
            <p className="text-2xl font-bold text-red-400">{stats.admins}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-neutral-400 text-sm">Moderators</p>
            <p className="text-2xl font-bold text-blue-400">{stats.moderators}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-neutral-400 text-sm">Banned</p>
            <p className="text-2xl font-bold text-orange-400">{stats.banned}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admins</option>
            <option value="moderator">Moderators</option>
            <option value="user">Users</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-neutral-800 rounded-lg">
            <span className="text-white font-medium">
              {selectedUsers.size} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkRoleChange('moderator')}
                disabled={actionLoading === 'bulk'}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm disabled:opacity-50"
              >
                Make Moderator
              </button>
              {isOwner && (
                <button
                  onClick={() => handleBulkRoleChange('admin')}
                  disabled={actionLoading === 'bulk'}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm disabled:opacity-50"
                >
                  Make Admin
                </button>
              )}
              <button
                onClick={() => handleBulkRoleChange('user')}
                disabled={actionLoading === 'bulk'}
                className="px-3 py-1 bg-neutral-600 hover:bg-neutral-500 text-white rounded text-sm disabled:opacity-50"
              >
                Remove Role
              </button>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="px-3 py-1 border border-neutral-600 text-neutral-400 rounded text-sm hover:bg-neutral-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
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
                    checked={selectedUsers.size === users.filter(u => canChangeRole(u)).length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(new Set(users.filter(u => canChangeRole(u)).map(u => u._id)));
                      } else {
                        setSelectedUsers(new Set());
                      }
                    }}
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
                        onChange={() => toggleUserSelection(user._id)}
                        className="rounded bg-neutral-700 border-neutral-600"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt=""
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {user.username?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-neutral-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded border text-sm font-medium ${getRoleBadgeColor(
                        user.effectiveRole
                      )}`}
                    >
                      {user.effectiveRole.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.accountStatus === 'banned' && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                          Banned
                        </span>
                      )}
                      {user.isVerified && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                          Verified
                        </span>
                      )}
                      {(user.warningCount || 0) > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          {user.warningCount} warnings
                        </span>
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
                        onChange={(e) => handleRoleChange(user._id, e.target.value as UserRole)}
                        disabled={actionLoading === user._id}
                        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-sm disabled:opacity-50"
                      >
                        {getAvailableRoles(user).map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
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

        {/* Pagination */}
        {total > LIMIT && (
          <div className="px-4 py-3 bg-neutral-800 border-t border-neutral-700 flex items-center justify-between">
            <p className="text-neutral-400 text-sm">
              Showing {page * LIMIT + 1}-{Math.min((page + 1) * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * LIMIT >= total}
                className="px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
