'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfileQRModal } from '@/components/profile/ProfileQRModal';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { ProfileStats, ProfileTabs, ProfileVideos } from '@/components/profile/ProfileSections';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

export default function ProfilePage() {
  const router = useRouter();
  const p = useProfile();

  if (p.isLoading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (p.error || !p.profile) {
    return (
      <div className="min-h-screen aurora-bg flex flex-col items-center justify-center px-4">
        <div className="text-white/50 text-lg mb-4">{p.error || 'User not found'}</div>
        <Link href="/feed" className="text-purple-400 hover:underline">Go back to feed</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <ProfileHeader profile={p.profile} onBack={p.goBack} onQRClick={() => p.setShowQRModal(true)} showMoreMenu={p.showMoreMenu} onToggleMenu={() => p.setShowMoreMenu(!p.showMoreMenu)} onCopyLink={p.copyProfileLink} isOwnProfile={p.isOwnProfile} isAuthenticated={p.isAuthenticated} />

        <div className="max-w-3xl mx-auto px-4 py-6">
          <ProfileInfo profile={p.profile} isOwnProfile={p.isOwnProfile} isFollowing={p.isFollowing} isFollowLoading={p.isFollowLoading} onFollow={p.handleFollow} onEditClick={() => p.setShowEditModal(true)} onShare={p.copyProfileLink} userId={p.userId} onAnalyticsClick={() => router.push('/creator/analytics')} onMessageClick={() => router.push(`/messages?user=${p.userId}`)} />
          <ProfileStats stats={p.profile.stats} />
          <ProfileTabs activeTab={p.activeTab} onTabChange={p.setActiveTab} />
          <ProfileVideos activeTab={p.activeTab} videos={p.videos} likedVideos={p.likedVideos} isOwnProfile={p.isOwnProfile} onDeleteVideo={p.deleteVideo} />
        </div>

        {p.profile && (
          <>
            <EditProfileModal isOpen={p.showEditModal} onClose={() => p.setShowEditModal(false)} profile={{ username: p.profile.username, displayName: p.profile.displayName, bio: p.profile.bio, profilePicture: p.profile.profilePicture }} onSave={(updates) => p.updateProfile(updates)} />
            <ProfileQRModal isOpen={p.showQRModal} onClose={() => p.setShowQRModal(false)} profile={{ username: p.profile.username, displayName: p.profile.displayName, profilePicture: p.profile.profilePicture, isVerified: p.profile.isVerified }} profileUrl={p.profileUrl} />
          </>
        )}
      </main>
    </div>
  );
}
