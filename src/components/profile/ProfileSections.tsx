'use client';

import type { UserProfile } from '@/hooks/useProfile';
import type { Video } from '@/types';
import { FloatingStatBubble } from '@/components/ui/FloatingPillButton';
import { VideoThumbnail } from './VideoThumbnail';

export function ProfileStats({ stats }: { stats?: UserProfile['stats'] }) {
  const following = stats?.following ?? 0;
  const followers = stats?.followers ?? 0;
  const likes = stats?.likes ?? 0;

  return (
    <div className="flex justify-center gap-4 mb-8 py-4">
      <FloatingStatBubble count={following} label="Following" gradientFrom="#8B5CF6" gradientTo="#14B8A6" delay={0} />
      <FloatingStatBubble count={followers} label="Followers" gradientFrom="#14B8A6" gradientTo="#8B5CF6" delay={0.5} />
      <FloatingStatBubble count={likes} label="Likes" gradientFrom="#8B5CF6" gradientTo="#14B8A6" delay={1} />
    </div>
  );
}

export function ProfileTabs({ activeTab, onTabChange }: { activeTab: 'videos' | 'liked'; onTabChange: (tab: 'videos' | 'liked') => void }) {
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

export function ProfileVideos({ activeTab, videos, likedVideos, isOwnProfile, onDeleteVideo }: { activeTab: 'videos' | 'liked'; videos: Video[]; likedVideos: Video[]; isOwnProfile: boolean; onDeleteVideo: (videoId: string) => void }) {
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
