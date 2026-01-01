'use client';

import { useEffect, useState } from 'react';
import { adminApi, type TeamMember, type UserRole } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function TeamPage() {
  const { user: currentUser } = useAuthStore();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isOwner = currentUser?.email === 'tmc363@gmail.com';

  useEffect(() => {
    loadTeam();
  }, []);

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
    const confirmed = confirm(
      `Demote this ${currentRole} to ${newRole}?`
    );
    if (!confirmed) return;

    setActionLoading(userId);
    try {
      await adminApi.changeUserRole(userId, newRole as UserRole);
      await loadTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to demote');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (userId: string) => {
    const confirmed = confirm('Remove this user from the team entirely?');
    if (!confirmed) return;

    setActionLoading(userId);
    try {
      await adminApi.changeUserRole(userId, 'user');
      await loadTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setActionLoading(userId);
    try {
      await adminApi.changeUserRole(userId, role);
      await loadTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 'admin':
        return (
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        );
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Full system access. Cannot be modified.';
      case 'admin':
        return 'Can manage moderators and handle all moderation tasks.';
      case 'moderator':
        return 'Can handle reports, warnings, and bans.';
      default:
        return '';
    }
  };

  // Group team by role
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <p className="text-neutral-400 mt-1">
            Manage administrators and moderators
          </p>
        </div>
        <Link
          href="/admin/users"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Add Team Member
        </Link>
      </div>

      {/* Owner Section */}
      {owner && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Owner
          </h2>
          <div className="bg-neutral-900 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getRoleIcon('owner')}
                <div className="w-14 h-14 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                  {owner.profilePicture ? (
                    <img src={owner.profilePicture} alt="" className="w-14 h-14 object-cover" />
                  ) : (
                    <span className="text-white text-xl font-bold">
                      {owner.username?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-white text-lg font-medium">{owner.username}</p>
                  <p className="text-neutral-400">{owner.email}</p>
                  <p className="text-purple-400 text-sm mt-1">{getRoleDescription('owner')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admins Section */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Administrators ({admins.length})
        </h2>
        {admins.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
            <p className="text-neutral-400">No administrators yet</p>
            <Link
              href="/admin/users"
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
            >
              Promote someone to admin
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="bg-neutral-900 border border-red-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getRoleIcon('admin')}
                    <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                      {admin.profilePicture ? (
                        <img src={admin.profilePicture} alt="" className="w-12 h-12 object-cover" />
                      ) : (
                        <span className="text-white font-bold">
                          {admin.username?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{admin.username}</p>
                      <p className="text-neutral-400 text-sm">{admin.email}</p>
                      {admin.roleChangedAt && (
                        <p className="text-neutral-500 text-xs mt-1">
                          Promoted {new Date(admin.roleChangedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDemote(admin._id, 'admin')}
                        disabled={actionLoading === admin._id}
                        className="px-3 py-1 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 rounded text-sm disabled:opacity-50"
                      >
                        Demote to Moderator
                      </button>
                      <button
                        onClick={() => handleRemove(admin._id)}
                        disabled={actionLoading === admin._id}
                        className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderators Section */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Moderators ({moderators.length})
        </h2>
        {moderators.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
            <p className="text-neutral-400">No moderators yet</p>
            <Link
              href="/admin/users"
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
            >
              Add a moderator
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {moderators.map((mod) => (
              <div
                key={mod._id}
                className="bg-neutral-900 border border-blue-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getRoleIcon('moderator')}
                    <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                      {mod.profilePicture ? (
                        <img src={mod.profilePicture} alt="" className="w-12 h-12 object-cover" />
                      ) : (
                        <span className="text-white font-bold">
                          {mod.username?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{mod.username}</p>
                      <p className="text-neutral-400 text-sm">{mod.email}</p>
                      {mod.roleChangedAt && (
                        <p className="text-neutral-500 text-xs mt-1">
                          Added {new Date(mod.roleChangedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isOwner && (
                      <button
                        onClick={() => handleRoleChange(mod._id, 'admin')}
                        disabled={actionLoading === mod._id}
                        className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded text-sm disabled:opacity-50"
                      >
                        Promote to Admin
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(mod._id)}
                      disabled={actionLoading === mod._id}
                      className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
