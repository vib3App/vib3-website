'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/services/api';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfileQRModal } from '@/components/profile/ProfileQRModal';
import type { Video } from '@/types';

interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
  stats: {
    followers: number;
    following: number;
    likes: number;
    videos: number;
  };
}

type ProfileTab = 'videos' | 'liked';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function VideoThumbnail({ video }: { video: Video }) {
  const thumbnailUrl = video.thumbnailUrl;
  const videoId = video.id;

  return (
    <Link
      href={`/feed?video=${videoId}`}
      className="relative aspect-[9/16] bg-[#1A1F2E] rounded-lg overflow-hidden group"
    >
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={video.title || video.caption || 'Video thumbnail'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
        <span>{formatCount(video.viewsCount || 0)}</span>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        // Load profile first
        const profileData = await userApi.getProfile(userId);
        setProfile(profileData);

        // Load user's videos (don't fail if this fails)
        try {
          const videosData = await userApi.getUserVideos(userId);
          setVideos(videosData.videos || []);
        } catch (videoErr) {
          console.error('Failed to load user videos:', videoErr);
          setVideos([]);
        }

        // Check if following (only if authenticated and not own profile)
        if (isAuthenticated && !isOwnProfile) {
          try {
            const following = await userApi.isFollowing(userId);
            setIsFollowing(following);
          } catch (followErr) {
            console.error('Failed to check follow status:', followErr);
            setIsFollowing(false);
          }
        }
      } catch (err: unknown) {
        console.error('Failed to load profile:', err);
        const error = err as { message?: string; response?: { status: number }; code?: string };
        if (error.response?.status === 404) {
          setError('User not found');
        } else if (error.response?.status === 400) {
          setError('Invalid user ID');
        } else {
          setError(error.message || 'Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      loadProfile();
    }
  }, [userId, isAuthenticated, isOwnProfile]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsFollowLoading(true);
    try {
      const result = await userApi.toggleFollow(userId, isFollowing);
      setIsFollowing(result.following);

      // Update follower count locally
      if (profile) {
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followers: profile.stats.followers + (result.following ? 1 : -1)
          }
        });
      }
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center px-4">
        <div className="text-white/50 text-lg mb-4">{error || 'User not found'}</div>
        <div className="text-white/30 text-sm mb-4">User ID: {userId}</div>
        <Link href="/feed" className="text-[#6366F1] hover:underline">
          Go back to feed
        </Link>
      </div>
    );
  }

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${userId}`
    : '';

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-semibold">@{profile.username}</h1>
          <div className="flex items-center gap-2">
            {/* QR Code */}
            <button
              onClick={() => setShowQRModal(true)}
              className="text-white p-2"
              title="Share QR Code"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="text-white p-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1F2E] rounded-xl shadow-xl border border-white/10 py-2 z-50">
                  <button
                    onClick={() => { navigator.clipboard.writeText(profileUrl); setShowMoreMenu(false); }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                  {!isOwnProfile && isAuthenticated && (
                    <>
                      <button
                        onClick={() => setShowMoreMenu(false)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/5 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Block
                      </button>
                      <button
                        onClick={() => setShowMoreMenu(false)}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
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

      {/* Profile Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#14B8A6] p-0.5 mb-4">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1F2E]">
              {profile.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/70">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#6366F1] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Name and Username */}
          <h2 className="text-xl font-bold text-white mb-1">
            {profile.displayName || profile.username}
          </h2>
          <p className="text-white/50 text-sm mb-3">@{profile.username}</p>

          {/* Bio */}
          {profile.bio && (
            <p className="text-white/70 text-sm max-w-md mb-4">{profile.bio}</p>
          )}

          {/* Follow Button */}
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`px-8 py-2 rounded-full font-semibold text-sm transition-all ${
                isFollowing
                  ? 'bg-[#1A1F2E] text-white border border-white/20 hover:border-white/40'
                  : 'bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white hover:opacity-90'
              } disabled:opacity-50`}
            >
              {isFollowLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </span>
              ) : isFollowing ? (
                'Following'
              ) : (
                'Follow'
              )}
            </button>
          )}

          {/* Edit Profile for own profile */}
          {isOwnProfile && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-8 py-2 rounded-full font-semibold text-sm bg-[#1A1F2E] text-white border border-white/20 hover:border-white/40 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8 py-4 border-y border-white/5">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{formatCount(profile.stats.following)}</div>
            <div className="text-white/50 text-sm">Following</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{formatCount(profile.stats.followers)}</div>
            <div className="text-white/50 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{formatCount(profile.stats.likes)}</div>
            <div className="text-white/50 text-sm">Likes</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-4">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'videos' ? 'text-white border-b-2 border-white' : 'text-white/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Videos
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'liked' ? 'text-white border-b-2 border-white' : 'text-white/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Liked
          </button>
        </div>

        {/* Videos Grid */}
        {activeTab === 'videos' && (
          videos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {videos.map((video) => (
                <VideoThumbnail key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-white/50">No videos yet</p>
            </div>
          )
        )}

        {/* Liked Videos Grid */}
        {activeTab === 'liked' && (
          likedVideos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {likedVideos.map((video) => (
                <VideoThumbnail key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-white/50">No liked videos</p>
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={{
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio,
            profilePicture: profile.profilePicture,
          }}
          onSave={(updates) => {
            setProfile({ ...profile, ...updates });
          }}
        />
      )}

      {/* QR Code Modal */}
      {profile && (
        <ProfileQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          profile={{
            username: profile.username,
            displayName: profile.displayName,
            profilePicture: profile.profilePicture,
            isVerified: profile.isVerified,
          }}
          profileUrl={profileUrl}
        />
      )}
    </div>
  );
}
