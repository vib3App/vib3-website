'use client';

import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/hooks/useProfile';
import type { Video } from '@/types';
import { FloatingStatBubble } from '@/components/ui/FloatingPillButton';
import { VideoThumbnail } from './VideoThumbnail';

export function ProfileStats({ stats, userId }: { stats?: UserProfile['stats']; userId?: string }) {
  const router = useRouter();
  const following = stats?.following ?? 0;
  const followers = stats?.followers ?? 0;
  const likes = stats?.likes ?? 0;

  return (
    <div className="flex justify-center gap-4 mb-8 py-4">
      <button onClick={() => userId && router.push(`/profile/${userId}/following`)}>
        <FloatingStatBubble count={following} label="Following" gradientFrom="#8B5CF6" gradientTo="#14B8A6" delay={0} />
      </button>
      <button onClick={() => userId && router.push(`/profile/${userId}/followers`)}>
        <FloatingStatBubble count={followers} label="Followers" gradientFrom="#14B8A6" gradientTo="#8B5CF6" delay={0.5} />
      </button>
      <FloatingStatBubble count={likes} label="Likes" gradientFrom="#8B5CF6" gradientTo="#14B8A6" delay={1} />
    </div>
  );
}

export function ProfileTabs({ activeTab, onTabChange }: { activeTab: 'videos' | 'liked' | 'exclusive'; onTabChange: (tab: 'videos' | 'liked' | 'exclusive') => void }) {
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
      <button onClick={() => onTabChange('exclusive')} className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'exclusive' ? 'text-white border-b-2 border-white' : 'text-white/50'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        Exclusive
      </button>
    </div>
  );
}

const CATEGORY_FILTERS = ['All', 'Comedy', 'Music', 'Dance', 'Food', 'Sports', 'Education', 'Tech', 'Travel', 'Fashion'];

export function ProfileCategoryFilter({ selected, onSelect }: { selected: string; onSelect: (cat: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-3">
      {CATEGORY_FILTERS.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${
            selected === cat
              ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export function ProfileVideos({ activeTab, videos, likedVideos, isOwnProfile, onDeleteVideo, categoryFilter, isSubscribed }: { activeTab: 'videos' | 'liked' | 'exclusive'; videos: Video[]; likedVideos: Video[]; isOwnProfile: boolean; onDeleteVideo: (videoId: string) => void; categoryFilter?: string; isSubscribed?: boolean }) {
  let displayVideos: Video[];
  let emptyMessage: string;
  let EmptyIcon: () => React.JSX.Element;

  if (activeTab === 'exclusive') {
    // Exclusive tab - show subscriber-only content
    if (!isOwnProfile && !isSubscribed) {
      return (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-white/50 mb-3">Subscribe to unlock exclusive content</p>
          <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-sm font-medium hover:opacity-90 transition">
            Subscribe
          </button>
        </div>
      );
    }
    displayVideos = videos.filter(v => !v.isPublic);
    emptyMessage = 'No exclusive content yet';
    EmptyIcon = LockIcon;
  } else if (activeTab === 'liked') {
    displayVideos = likedVideos;
    emptyMessage = 'No liked videos';
    EmptyIcon = HeartIcon;
  } else {
    displayVideos = videos;
    emptyMessage = 'No videos yet';
    EmptyIcon = VideoIcon;
  }

  // Apply category filter
  if (categoryFilter && categoryFilter !== 'All' && activeTab === 'videos') {
    const cat = categoryFilter.toLowerCase();
    displayVideos = displayVideos.filter(v =>
      v.hashtags?.some(h => h.toLowerCase().includes(cat)) ||
      v.caption?.toLowerCase().includes(cat) ||
      v.title?.toLowerCase().includes(cat)
    );
  }

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

function LockIcon() {
  return <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
}
