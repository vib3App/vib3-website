'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProfile, type UserProfile } from '@/hooks/useProfile';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfileQRModal } from '@/components/profile/ProfileQRModal';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import {
  FloatingProfilePicture,
  FloatingStatBubble,
  FloatingActionPill,
  FloatingCircleButton,
} from '@/components/ui/FloatingPillButton';
import { useConfirmStore } from '@/stores/confirmStore';
import { formatCount } from '@/utils/format';
import type { Video } from '@/types';

function VideoThumbnail({ video, showDelete, onDelete }: { video: Video; showDelete?: boolean; onDelete?: (videoId: string) => void }) {
  const confirmDialog = useConfirmStore(s => s.show);
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      const ok = await confirmDialog({ title: 'Delete Video', message: 'Are you sure you want to delete this video?', variant: 'danger', confirmText: 'Delete' });
      if (ok) onDelete(video.id);
    }
  };

  return (
    <Link href={`/video/${video.id}?user=${video.userId}`} className="relative aspect-[9/16] glass-card rounded-lg overflow-hidden group">
      {video.thumbnailUrl ? (
        <Image src={video.thumbnailUrl} alt={video.title || video.caption || 'Video thumbnail'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-teal-500/30">
          <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />

      {/* Views count (top-left) */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 rounded-full">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
        <span className="text-white text-[10px] font-semibold">{formatCount(video.viewsCount || 0)}</span>
      </div>

      {/* Likes count (top-right) */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 rounded-full">
        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="text-white text-[10px] font-semibold">{formatCount(video.likesCount || 0)}</span>
      </div>

      {/* Delete button (bottom-right, only for own videos) */}
      {showDelete && (
        <button
          onClick={handleDelete}
          className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors group/delete"
          title="Delete video"
        >
          <svg className="w-4 h-4 text-white group-hover/delete:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </Link>
  );
}

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

function ProfileHeader({ profile, onBack, onQRClick, showMoreMenu, onToggleMenu, onCopyLink, isOwnProfile, isAuthenticated }: { profile: UserProfile; onBack: () => void; onQRClick: () => void; showMoreMenu: boolean; onToggleMenu: () => void; onCopyLink: () => void; isOwnProfile: boolean; isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <button onClick={onBack} className="text-white p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-white font-semibold">@{profile.username || 'user'}</h1>
        <div className="flex items-center gap-2">
          <button onClick={onQRClick} className="text-white p-2" title="Share QR Code">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </button>
          <div className="relative">
            <button onClick={onToggleMenu} className="text-white p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl shadow-xl py-2 z-50">
                <button onClick={onCopyLink} className="w-full px-4 py-2 text-left text-white hover:bg-white/5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Copy Link
                </button>
                {!isOwnProfile && isAuthenticated && (
                  <>
                    <button className="w-full px-4 py-2 text-left text-white hover:bg-white/5 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      Block
                    </button>
                    <button className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Report
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileInfo({ profile, isOwnProfile, isFollowing, isFollowLoading, onFollow, onEditClick, onShare, userId, onAnalyticsClick, onMessageClick }: { profile: UserProfile; isOwnProfile: boolean; isFollowing: boolean; isFollowLoading: boolean; onFollow: () => void; onEditClick: () => void; onShare: () => void; userId: string; onAnalyticsClick: () => void; onMessageClick: () => void }) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Floating Profile Picture */}
      <div className="mb-6">
        <FloatingProfilePicture
          src={profile.profilePicture}
          fallback={(profile.username || 'U').charAt(0).toUpperCase()}
          size={120}
        />
        {profile.isVerified && (
          <div className="flex justify-center -mt-3">
            <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center border-2 border-black">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        )}
      </div>

      {/* Name and Username */}
      <h2 className="text-2xl font-bold text-white mb-1">{profile.displayName || profile.username}</h2>
      <p className="text-white/50 text-sm mb-4">@{profile.username}</p>
      {profile.bio && <p className="text-white/70 text-sm max-w-md mb-6">{profile.bio}</p>}

      {/* Floating Action Buttons */}
      <div className="flex items-center gap-4">
        {isOwnProfile ? (
          <>
            <FloatingActionPill
              icon={
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              label="Edit VIB3"
              onClick={onEditClick}
            />
            <FloatingCircleButton
              icon={
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              }
              onClick={onShare}
            />
            <FloatingCircleButton
              icon={
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              gradientFrom="#14B8A6"
              gradientTo="#8B5CF6"
              onClick={onAnalyticsClick}
            />
          </>
        ) : (
          <>
            <FloatingActionPill
              icon={
                isFollowing ? (
                  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )
              }
              label={isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              gradientFrom={isFollowing ? '#10B981' : '#8B5CF6'}
              gradientTo={isFollowing ? '#34D399' : '#14B8A6'}
              onClick={onFollow}
            />
            <FloatingCircleButton
              icon={
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              gradientFrom="#14B8A6"
              gradientTo="#8B5CF6"
              onClick={onMessageClick}
            />
            <FloatingCircleButton
              icon={
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              }
              onClick={onShare}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ProfileStats({ stats }: { stats?: UserProfile['stats'] }) {
  const following = stats?.following ?? 0;
  const followers = stats?.followers ?? 0;
  const likes = stats?.likes ?? 0;

  return (
    <div className="flex justify-center gap-4 mb-8 py-4">
      <FloatingStatBubble
        count={following}
        label="Following"
        gradientFrom="#8B5CF6"
        gradientTo="#14B8A6"
        delay={0}
      />
      <FloatingStatBubble
        count={followers}
        label="Followers"
        gradientFrom="#14B8A6"
        gradientTo="#8B5CF6"
        delay={0.5}
      />
      <FloatingStatBubble
        count={likes}
        label="Likes"
        gradientFrom="#8B5CF6"
        gradientTo="#14B8A6"
        delay={1}
      />
    </div>
  );
}

function ProfileTabs({ activeTab, onTabChange }: { activeTab: 'videos' | 'liked'; onTabChange: (tab: 'videos' | 'liked') => void }) {
  return (
    <div className="flex border-b border-white/10 mb-4">
      <button onClick={() => onTabChange('videos')} className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'videos' ? 'text-white border-b-2 border-white' : 'text-white/50'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        Videos
      </button>
      <button onClick={() => onTabChange('liked')} className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'liked' ? 'text-white border-b-2 border-white' : 'text-white/50'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        Liked
      </button>
    </div>
  );
}

function ProfileVideos({ activeTab, videos, likedVideos, isOwnProfile, onDeleteVideo }: { activeTab: 'videos' | 'liked'; videos: Video[]; likedVideos: Video[]; isOwnProfile: boolean; onDeleteVideo: (videoId: string) => void }) {
  const displayVideos = activeTab === 'videos' ? videos : likedVideos;
  const emptyMessage = activeTab === 'videos' ? 'No videos yet' : 'No liked videos';
  const EmptyIcon = activeTab === 'videos' ? VideoIcon : HeartIcon;
  const showDelete = activeTab === 'videos' && isOwnProfile;

  if (displayVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <EmptyIcon />
        <p className="text-white/50">{emptyMessage}</p>
      </div>
    );
  }

  return <div className="grid grid-cols-3 gap-1">{displayVideos.map((video) => <VideoThumbnail key={video.id} video={video} showDelete={showDelete} onDelete={onDeleteVideo} />)}</div>;
}

function VideoIcon() {
  return <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
}

function HeartIcon() {
  return <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
}
