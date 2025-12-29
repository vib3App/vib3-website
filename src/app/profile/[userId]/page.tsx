'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useProfile, type UserProfile } from '@/hooks/useProfile';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfileQRModal } from '@/components/profile/ProfileQRModal';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { formatCount } from '@/utils/format';
import type { Video } from '@/types';

function VideoThumbnail({ video }: { video: Video }) {
  return (
    <Link href={`/feed?video=${video.id}`} className="relative aspect-[9/16] glass-card rounded-lg overflow-hidden group">
      {video.thumbnailUrl ? (
        <Image src={video.thumbnailUrl} alt={video.title || video.caption || 'Video thumbnail'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
        <span>{formatCount(video.viewsCount || 0)}</span>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
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
          <ProfileInfo profile={p.profile} isOwnProfile={p.isOwnProfile} isFollowing={p.isFollowing} isFollowLoading={p.isFollowLoading} onFollow={p.handleFollow} onEditClick={() => p.setShowEditModal(true)} />
          <ProfileStats stats={p.profile.stats} />
          <ProfileTabs activeTab={p.activeTab} onTabChange={p.setActiveTab} />
          <ProfileVideos activeTab={p.activeTab} videos={p.videos} likedVideos={p.likedVideos} />
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
        <h1 className="text-white font-semibold">@{profile.username}</h1>
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

function ProfileInfo({ profile, isOwnProfile, isFollowing, isFollowLoading, onFollow, onEditClick }: { profile: UserProfile; isOwnProfile: boolean; isFollowing: boolean; isFollowLoading: boolean; onFollow: () => void; onEditClick: () => void }) {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-teal-400 p-0.5 mb-4">
        <div className="w-full h-full rounded-full overflow-hidden glass-card">
          {profile.profilePicture ? (
            <Image src={profile.profilePicture} alt={profile.username} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/70">{profile.username.charAt(0).toUpperCase()}</div>
          )}
        </div>
        {profile.isVerified && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        )}
      </div>
      <h2 className="text-xl font-bold text-white mb-1">{profile.displayName || profile.username}</h2>
      <p className="text-white/50 text-sm mb-3">@{profile.username}</p>
      {profile.bio && <p className="text-white/70 text-sm max-w-md mb-4">{profile.bio}</p>}
      {!isOwnProfile ? (
        <button onClick={onFollow} disabled={isFollowLoading} className={`px-8 py-2 rounded-full font-semibold text-sm transition-all ${isFollowing ? 'glass-card text-white' : 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'} disabled:opacity-50`}>
          {isFollowLoading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></span> : isFollowing ? 'Following' : 'Follow'}
        </button>
      ) : (
        <button onClick={onEditClick} className="px-8 py-2 rounded-full font-semibold text-sm glass-card text-white">Edit Profile</button>
      )}
    </div>
  );
}

function ProfileStats({ stats }: { stats: UserProfile['stats'] }) {
  return (
    <div className="flex justify-center gap-8 mb-8 py-4 border-y border-white/5">
      <div className="text-center"><div className="text-xl font-bold text-white">{formatCount(stats.following)}</div><div className="text-white/50 text-sm">Following</div></div>
      <div className="text-center"><div className="text-xl font-bold text-white">{formatCount(stats.followers)}</div><div className="text-white/50 text-sm">Followers</div></div>
      <div className="text-center"><div className="text-xl font-bold text-white">{formatCount(stats.likes)}</div><div className="text-white/50 text-sm">Likes</div></div>
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

function ProfileVideos({ activeTab, videos, likedVideos }: { activeTab: 'videos' | 'liked'; videos: Video[]; likedVideos: Video[] }) {
  const displayVideos = activeTab === 'videos' ? videos : likedVideos;
  const emptyMessage = activeTab === 'videos' ? 'No videos yet' : 'No liked videos';
  const EmptyIcon = activeTab === 'videos' ? VideoIcon : HeartIcon;

  if (displayVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <EmptyIcon />
        <p className="text-white/50">{emptyMessage}</p>
      </div>
    );
  }

  return <div className="grid grid-cols-3 gap-1">{displayVideos.map((video) => <VideoThumbnail key={video.id} video={video} />)}</div>;
}

function VideoIcon() {
  return <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
}

function HeartIcon() {
  return <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
}
