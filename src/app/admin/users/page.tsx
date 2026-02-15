'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, type AdminUser, type UserRole, type UserStats } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import { UserStatsCards, UserFilters, UsersTable } from '@/components/admin';
import { logger } from '@/utils/logger';

const LIMIT = 20;

export default function UserManagementPage() {
  const { user: currentUser } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const confirmDialog = useConfirmStore(s => s.show);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const isOwner = currentUser?.role === 'owner';
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
      logger.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setActionLoading(userId);
    try {
      await adminApi.changeUserRole(userId, newRole);
      await loadUsers();
      setSelectedUsers(new Set());
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      addToast(axiosErr.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRoleChange = async (newRole: UserRole) => {
    if (selectedUsers.size === 0) return;
    const ok = await confirmDialog({ title: 'Bulk Role Change', message: `Change ${selectedUsers.size} user(s) to ${newRole}?` });
    if (!ok) return;

    setActionLoading('bulk');
    try {
      for (const userId of selectedUsers) {
        await adminApi.changeUserRole(userId, newRole);
      }
      await loadUsers();
      setSelectedUsers(new Set());
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      addToast(axiosErr.response?.data?.message || 'Some role changes failed');
    } finally {
      setActionLoading(null);
    }
  };

  const canChangeRole = (targetUser: AdminUser): boolean => {
    if (isOwner && targetUser.effectiveRole !== 'owner') return true;
    if (isAdmin && !isOwner) {
      return targetUser.effectiveRole === 'user' || targetUser.effectiveRole === 'moderator';
    }
    return false;
  };

  const getAvailableRoles = (_targetUser: AdminUser): UserRole[] => {
    if (isOwner) return ['user', 'moderator', 'admin'];
    if (isAdmin) return ['user', 'moderator'];
    return [];
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.filter(u => canChangeRole(u)).map(u => u._id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) newSet.delete(userId);
    else newSet.add(userId);
    setSelectedUsers(newSet);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-neutral-400 mt-1">Manage user roles and permissions</p>
        </div>
      </div>

      {stats && <UserStatsCards stats={stats} />}

      <UserFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        roleFilter={roleFilter}
        onRoleFilterChange={(v) => { setRoleFilter(v); setPage(0); }}
        selectedCount={selectedUsers.size}
        isOwner={isOwner}
        actionLoading={actionLoading === 'bulk'}
        onBulkRoleChange={handleBulkRoleChange}
        onClearSelection={() => setSelectedUsers(new Set())}
      />

      <UsersTable
        users={users}
        loading={loading}
        selectedUsers={selectedUsers}
        actionLoading={actionLoading}
        total={total}
        page={page}
        limit={LIMIT}
        onToggleSelection={toggleUserSelection}
        onSelectAll={handleSelectAll}
        onRoleChange={handleRoleChange}
        onPageChange={setPage}
        canChangeRole={canChangeRole}
        getAvailableRoles={getAvailableRoles}
      />
    </div>
  );
}
