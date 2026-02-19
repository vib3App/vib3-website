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

export type ProfileTabType = 'videos' | 'liked' | 'exclusive' | 'drafts' | 'scheduled' | 'private' | 'favorited';

export function ProfileTabs({ activeTab, onTabChange, isOwnProfile }: { activeTab: ProfileTabType; onTabChange: (tab: ProfileTabType) => void; isOwnProfile?: boolean }) {
  const tabClass = (tab: ProfileTabType) =>
    `flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors text-sm ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-white/50'}`;

  return (
    <div className="flex border-b border-white/10 mb-4 overflow-x-auto scrollbar-hide">
      <button onClick={() => onTabChange('videos')} className={tabClass('videos')}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        Videos
      </button>
      <button onClick={() => onTabChange('liked')} className={tabClass('liked')}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        Liked
      </button>
      <button onClick={() => onTabChange('exclusive')} className={tabClass('exclusive')}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        Exclusive
      </button>
      {/* GAP-12: Own-profile-only tabs */}
      {isOwnProfile && (
        <>
          <button onClick={() => onTabChange('drafts')} className={tabClass('drafts')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Drafts
          </button>
          <button onClick={() => onTabChange('scheduled')} className={tabClass('scheduled')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Scheduled
          </button>
          <button onClick={() => onTabChange('private')} className={tabClass('private')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            Private
          </button>
          <button onClick={() => onTabChange('favorited')} className={tabClass('favorited')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            Saved
          </button>
        </>
      )}
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

interface ProfileVideosProps {
  activeTab: ProfileTabType;
  videos: Video[];
  likedVideos: Video[];
  drafts?: Array<{ id: string; caption: string; thumbnailUrl?: string; updatedAt: string }>;
  scheduledVideos?: Array<{ id: string; caption: string; thumbnailUrl?: string; scheduledFor?: string }>;
  isOwnProfile: boolean;
  onDeleteVideo: (videoId: string) => void;
  categoryFilter?: string;
  isSubscribed?: boolean;
}

export function ProfileVideos({ activeTab, videos, likedVideos, drafts, scheduledVideos, isOwnProfile, onDeleteVideo, categoryFilter, isSubscribed }: ProfileVideosProps) {
  // GAP-12: Handle new tab types
  if (activeTab === 'drafts') {
    if (!drafts?.length) return <EmptyState icon={<DraftIcon />} message="No drafts yet" />;
    return (
      <div className="grid grid-cols-3 gap-1">
        {drafts.map(d => (
          <div key={d.id} className="relative aspect-[9/16] bg-white/5 rounded overflow-hidden group">
            {d.thumbnailUrl ? <img src={d.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><DraftIcon /></div>}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-yellow-500/80 text-black text-[10px] font-bold rounded">DRAFT</div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-1.5">
              <p className="text-[10px] text-white/80 truncate">{d.caption || 'Untitled'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'scheduled') {
    if (!scheduledVideos?.length) return <EmptyState icon={<CalendarIcon />} message="No scheduled videos" />;
    return (
      <div className="grid grid-cols-3 gap-1">
        {scheduledVideos.map(v => (
          <div key={v.id} className="relative aspect-[9/16] bg-white/5 rounded overflow-hidden group">
            {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><CalendarIcon /></div>}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500/80 text-white text-[10px] font-bold rounded">SCHEDULED</div>
            {v.scheduledFor && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-1.5">
                <p className="text-[10px] text-white/80">{new Date(v.scheduledFor).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'private') {
    const privateVideos = videos.filter(v => !v.isPublic);
    if (!privateVideos.length) return <EmptyState icon={<EyeOffIcon />} message="No private videos" />;
    return <div className="grid grid-cols-3 gap-1">{privateVideos.map(video => <VideoThumbnail key={video.id} video={video} showDelete={isOwnProfile} onDelete={onDeleteVideo} />)}</div>;
  }

  if (activeTab === 'favorited') {
    // Favorited uses likedVideos or a separate saved endpoint
    if (!likedVideos.length) return <EmptyState icon={<BookmarkIcon />} message="No saved videos" />;
    return <div className="grid grid-cols-3 gap-1">{likedVideos.map(video => <VideoThumbnail key={video.id} video={video} showDelete={false} onDelete={onDeleteVideo} />)}</div>;
  }

  let displayVideos: Video[];
  let emptyMessage: string;
  let EmptyIcon: () => React.JSX.Element;

  if (activeTab === 'exclusive') {
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

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return <div className="text-center py-12"><div className="w-16 h-16 text-white/20 mx-auto mb-4">{icon}</div><p className="text-white/50">{message}</p></div>;
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

function DraftIcon() {
  return <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}

function CalendarIcon() {
  return <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}

function EyeOffIcon() {
  return <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;
}

function BookmarkIcon() {
  return <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
}
