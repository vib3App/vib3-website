'use client';

import type { UserProfile } from '@/hooks/useProfile';
import {
  FloatingProfilePicture,
  FloatingActionPill,
  FloatingCircleButton,
} from '@/components/ui/FloatingPillButton';

export function ProfileInfo({ profile, isOwnProfile, isFollowing, isFollowLoading, onFollow, onEditClick, onShare, userId: _userId, onAnalyticsClick, onMessageClick }: { profile: UserProfile; isOwnProfile: boolean; isFollowing: boolean; isFollowLoading: boolean; onFollow: () => void; onEditClick: () => void; onShare: () => void; userId: string; onAnalyticsClick: () => void; onMessageClick: () => void }) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
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

      <h2 className="text-2xl font-bold text-white mb-1">{profile.displayName || profile.username}</h2>
      <p className="text-white/50 text-sm mb-4">@{profile.username}</p>
      {profile.bio && <p className="text-white/70 text-sm max-w-md mb-6">{profile.bio}</p>}

      <div className="flex items-center gap-4">
        {isOwnProfile ? (
          <OwnProfileActions onEditClick={onEditClick} onShare={onShare} onAnalyticsClick={onAnalyticsClick} />
        ) : (
          <OtherProfileActions isFollowing={isFollowing} isFollowLoading={isFollowLoading} onFollow={onFollow} onMessageClick={onMessageClick} onShare={onShare} />
        )}
      </div>
    </div>
  );
}

function OwnProfileActions({ onEditClick, onShare, onAnalyticsClick }: { onEditClick: () => void; onShare: () => void; onAnalyticsClick: () => void }) {
  return (
    <>
      <FloatingActionPill
        icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
        label="Edit VIB3"
        onClick={onEditClick}
      />
      <FloatingCircleButton
        icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
        onClick={onShare}
      />
      <FloatingCircleButton
        icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        gradientFrom="#14B8A6"
        gradientTo="#8B5CF6"
        onClick={onAnalyticsClick}
      />
    </>
  );
}

function OtherProfileActions({ isFollowing, isFollowLoading, onFollow, onMessageClick, onShare }: { isFollowing: boolean; isFollowLoading: boolean; onFollow: () => void; onMessageClick: () => void; onShare: () => void }) {
  return (
    <>
      <FloatingActionPill
        icon={
          isFollowing ? (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          )
        }
        label={isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
        gradientFrom={isFollowing ? '#10B981' : '#8B5CF6'}
        gradientTo={isFollowing ? '#34D399' : '#14B8A6'}
        onClick={onFollow}
      />
      <FloatingCircleButton
        icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        gradientFrom="#14B8A6"
        gradientTo="#8B5CF6"
        onClick={onMessageClick}
      />
      <FloatingCircleButton
        icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
        onClick={onShare}
      />
    </>
  );
}
