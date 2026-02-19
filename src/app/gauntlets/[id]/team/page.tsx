'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { TeamManagement, type TeamMemberInfo } from '@/components/gauntlets/TeamManagement';
import { gauntletsApi } from '@/services/api/gauntlets';
import { useAuthStore } from '@/stores/authStore';
import { websocketService } from '@/services/websocket';
import { logger } from '@/utils/logger';

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isAuthenticated, isAuthVerified } = useAuthStore();
  const [teamName, setTeamName] = useState('My Team');
  const [teamAvatar, setTeamAvatar] = useState<string | undefined>();
  const [members, setMembers] = useState<TeamMemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    try {
      // Load gauntlet data which includes team info
      const gauntlet = await gauntletsApi.getGauntlet(id);
      // Team data would come from backend; for now, populate from gauntlet participants
      setTeamName(gauntlet.title + ' Team');
      if (user) {
        setMembers([{
          userId: user.id,
          username: user.username,
          avatar: user.profilePicture,
          role: 'captain',
          joinedAt: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      logger.error('Failed to load team:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (isAuthenticated) loadTeam();
  }, [isAuthenticated, loadTeam]);

  const handleUpdateName = useCallback((name: string) => {
    setTeamName(name);
    websocketService.send('gauntlet:team:update', { gauntletId: id, teamName: name });
  }, [id]);

  const handleAddMember = useCallback((userId: string) => {
    websocketService.send('gauntlet:team:add', { gauntletId: id, userId });
    setMembers((prev) => [
      ...prev,
      { userId, username: 'Loading...', role: 'member', joinedAt: new Date().toISOString() },
    ]);
  }, [id]);

  const handleRemoveMember = useCallback((userId: string) => {
    websocketService.send('gauntlet:team:remove', { gauntletId: id, userId });
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  }, [id]);

  const handleUpdateAvatar = useCallback((url: string) => {
    setTeamAvatar(url);
    websocketService.send('gauntlet:team:update', { gauntletId: id, teamAvatar: url });
  }, [id]);

  if (isAuthVerified && !isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <AuroraBackground intensity={20} />
        <TopNav />
        <main className="pt-20 pb-8 relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-white/40 text-lg mb-4">Sign in to manage your team</p>
            <Link href="/login" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl">
              Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            href={`/gauntlets/${id}`}
            className="inline-flex items-center gap-1 text-white/40 hover:text-white/60 text-sm mb-4 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gauntlet
          </Link>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-6 bg-white/10 rounded w-1/3" />
                    <div className="h-4 bg-white/5 rounded w-1/4" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <TeamManagement
              gauntletId={id}
              teamName={teamName}
              teamAvatar={teamAvatar}
              members={members}
              isCaptain={members[0]?.userId === user?.id}
              onUpdateName={handleUpdateName}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onUpdateAvatar={handleUpdateAvatar}
            />
          )}
        </div>
      </main>
    </div>
  );
}
