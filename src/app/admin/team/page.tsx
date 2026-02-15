'use client';

import { useEffect, useState } from 'react';
import { adminApi, type TeamMember, type UserRole } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import Link from 'next/link';
import { RoleSection, TeamMemberCard } from '@/components/admin';

export default function TeamPage() {
  const { user: currentUser } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const confirmDialog = useConfirmStore(s => s.show);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isOwner = currentUser?.email === 'tmc363@gmail.com';

  useEffect(() => { loadTeam(); }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const { team: teamData } = await adminApi.getTeam();
      setTeam(teamData);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemote = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'moderator' : 'user';
    const ok = await confirmDialog({ title: 'Demote User', message: `Demote this ${currentRole} to ${newRole}?`, variant: 'danger', confirmText: 'Demote' });
    if (!ok) return;
    await executeRoleChange(userId, newRole as UserRole);
  };

  const handleRemove = async (userId: string) => {
    const ok = await confirmDialog({ title: 'Remove from Team', message: 'Remove this user from the team entirely?', variant: 'danger', confirmText: 'Remove' });
    if (!ok) return;
    await executeRoleChange(userId, 'user');
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    await executeRoleChange(userId, role);
  };

  const executeRoleChange = async (userId: string, role: UserRole) => {
    setActionLoading(userId);
    try {
      await adminApi.changeUserRole(userId, role);
      await loadTeam();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      addToast(axiosErr.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  const owner = team.find(m => m.effectiveRole === 'owner');
  const admins = team.filter(m => m.effectiveRole === 'admin');
  const moderators = team.filter(m => m.effectiveRole === 'moderator');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader />

      {owner && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Owner
          </h2>
          <TeamMemberCard member={owner} role="owner" isOwner={false} actionLoading={actionLoading} />
        </div>
      )}

      <RoleSection
        title="Administrators"
        count={admins.length}
        color="red"
        members={admins}
        role="admin"
        isOwner={isOwner}
        actionLoading={actionLoading}
        emptyText="No administrators yet"
        emptyLinkText="Promote someone to admin"
        onDemote={(userId) => handleDemote(userId, 'admin')}
        onRemove={handleRemove}
      />

      <RoleSection
        title="Moderators"
        count={moderators.length}
        color="blue"
        members={moderators}
        role="moderator"
        isOwner={isOwner}
        actionLoading={actionLoading}
        emptyText="No moderators yet"
        emptyLinkText="Add a moderator"
        onPromote={(userId) => handleRoleChange(userId, 'admin')}
        onRemove={handleRemove}
      />
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">Team Management</h1>
        <p className="text-neutral-400 mt-1">Manage administrators and moderators</p>
      </div>
      <Link href="/admin/users" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
        Add Team Member
      </Link>
    </div>
  );
}
