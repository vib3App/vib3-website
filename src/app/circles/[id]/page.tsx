'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { CircleMemberList } from '@/components/circles';
import { useCircles } from '@/hooks/useCircles';
import { useAuthStore } from '@/stores/authStore';
import { logger } from '@/utils/logger';

export default function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isAuthVerified } = useAuthStore();
  const { getCircleById, isLoading, addMember, removeMember, deleteCircle } = useCircles();
  const [isDeleting, setIsDeleting] = useState(false);

  const circle = getCircleById(id);
  const isCreator = circle && user?.id === circle.creatorId;

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push(`/login?redirect=/circles/${id}`);
    return null;
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this circle?')) return;
    setIsDeleting(true);
    try {
      await deleteCircle(id);
      router.push('/circles');
    } catch (err) {
      logger.error('Failed to delete circle:', err);
      setIsDeleting(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try { await addMember(id, userId); } catch (err) { logger.error('Failed to add member:', err); }
  };

  const handleRemoveMember = async (userId: string) => {
    try { await removeMember(id, userId); } catch (err) { logger.error('Failed to remove member:', err); }
  };

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-white/5 rounded-2xl" />
              <div className="h-6 bg-white/10 rounded w-1/2" />
              <div className="h-48 bg-white/5 rounded-2xl" />
            </div>
          ) : !circle ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">Circle not found</p>
              <button onClick={() => router.push('/circles')} className="mt-4 px-6 py-2 glass text-white/70 rounded-full hover:bg-white/10 transition">
                Back to Circles
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => router.push('/circles')} className="flex items-center gap-2 text-white/50 hover:text-white transition mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Circles
              </button>

              <div className="glass-card rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: circle.color }}>
                    <span className="text-2xl font-bold text-white">{circle.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-white truncate">{circle.name}</h1>
                    <p className="text-white/40 text-sm mt-1">Created {new Date(circle.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 flex-shrink-0" style={{ backgroundColor: circle.color }} />
                </div>
              </div>

              <CircleMemberList
                members={circle.members}
                creatorId={circle.creatorId}
                currentUserId={user?.id}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
              />

              {isCreator && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full mt-6 p-4 bg-red-500/10 text-red-400 font-medium rounded-2xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Circle'}
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
