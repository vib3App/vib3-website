'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { SearchUser, SearchHashtag, SearchSound } from '@/services/api';
import type { Video } from '@/types';
import type { TranscriptMatch, SearchTab } from '@/hooks/useSearch';
import { formatCount, formatDuration } from '@/utils/format';

interface SearchResultsProps {
  activeTab: SearchTab;
  users: SearchUser[];
  videos: Video[];
  hashtags: SearchHashtag[];
  sounds: SearchSound[];
  transcriptMatches: TranscriptMatch[];
  onTabChange: (tab: SearchTab) => void;
}

export function SearchResults({
  activeTab,
  users,
  videos,
  hashtags,
  sounds,
  transcriptMatches,
  onTabChange,
}: SearchResultsProps) {
  return (
    <div className="space-y-6">
      {(activeTab === 'top' || activeTab === 'users') && users.length > 0 && (
        <UsersSection
          users={activeTab === 'top' ? users.slice(0, 3) : users}
          showHeader={activeTab === 'top'}
          onSeeAll={() => onTabChange('users')}
        />
      )}

      {(activeTab === 'top' || activeTab === 'hashtags') && hashtags.length > 0 && (
        <HashtagsSection
          hashtags={activeTab === 'top' ? hashtags.slice(0, 5) : hashtags}
          showHeader={activeTab === 'top'}
          onSeeAll={() => onTabChange('hashtags')}
        />
      )}

      {(activeTab === 'top' || activeTab === 'sounds') && sounds.length > 0 && (
        <SoundsSection
          sounds={activeTab === 'top' ? sounds.slice(0, 3) : sounds}
          showHeader={activeTab === 'top'}
          onSeeAll={() => onTabChange('sounds')}
        />
      )}

      {(activeTab === 'top' || activeTab === 'videos') && videos.length > 0 && (
        <VideosSection
          videos={activeTab === 'top' ? videos.slice(0, 6) : videos}
          showHeader={activeTab === 'top'}
          onSeeAll={() => onTabChange('videos')}
        />
      )}

      {(activeTab === 'top' || activeTab === 'transcripts') && transcriptMatches.length > 0 && (
        <TranscriptsSection
          matches={activeTab === 'top' ? transcriptMatches.slice(0, 3) : transcriptMatches}
          showHeader={activeTab === 'top'}
          onSeeAll={() => onTabChange('transcripts')}
        />
      )}
    </div>
  );
}

function UsersSection({ users, showHeader, onSeeAll }: { users: SearchUser[]; showHeader: boolean; onSeeAll: () => void }) {
  return (
    <section>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-medium">Users</h2>
          <button onClick={onSeeAll} className="text-purple-400 text-sm">See all</button>
        </div>
      )}
      <div className="space-y-3">
        {users.map((user) => (
          <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-full overflow-hidden glass">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.username} width={48} height={48} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-white font-medium">{user.username}</span>
                {user.isVerified && (
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="text-white/50 text-sm">{formatCount(user.followerCount)} followers</p>
            </div>
            <button className="px-4 py-1.5 bg-purple-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HashtagsSection({ hashtags, showHeader, onSeeAll }: { hashtags: SearchHashtag[]; showHeader: boolean; onSeeAll: () => void }) {
  return (
    <section>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-medium">Hashtags</h2>
          <button onClick={onSeeAll} className="text-purple-400 text-sm">See all</button>
        </div>
      )}
      <div className="space-y-3">
        {hashtags.map((hashtag) => (
          <Link key={hashtag.name} href={`/hashtag/${hashtag.name}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 text-xl font-bold">#</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">#{hashtag.name}</p>
              <p className="text-white/50 text-sm">{formatCount(hashtag.videoCount)} videos</p>
            </div>
            {hashtag.trending && (
              <span className="text-teal-400 text-xs font-medium">Trending</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

function SoundsSection({ sounds, showHeader, onSeeAll }: { sounds: SearchSound[]; showHeader: boolean; onSeeAll: () => void }) {
  return (
    <section>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-medium">Sounds</h2>
          <button onClick={onSeeAll} className="text-purple-400 text-sm">See all</button>
        </div>
      )}
      <div className="space-y-3">
        {sounds.map((sound) => (
          <div key={sound.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-lg overflow-hidden glass">
              {sound.coverUrl ? (
                <Image src={sound.coverUrl} alt={sound.title} width={48} height={48} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{sound.title}</p>
              <p className="text-white/50 text-sm">{sound.artist} • {formatDuration(sound.duration)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-sm">{formatCount(sound.useCount)} uses</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VideosSection({ videos, showHeader, onSeeAll }: { videos: Video[]; showHeader: boolean; onSeeAll: () => void }) {
  return (
    <section>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-medium">Videos</h2>
          <button onClick={onSeeAll} className="text-purple-400 text-sm">See all</button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {videos.map((video) => (
          <Link key={video.id} href={`/feed?video=${video.id}`} className="relative aspect-[9/16] glass rounded-lg overflow-hidden group">
            {video.thumbnailUrl ? (
              <Image src={video.thumbnailUrl} alt={video.caption || 'Video'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
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
        ))}
      </div>
    </section>
  );
}

function TranscriptsSection({ matches, showHeader, onSeeAll }: { matches: TranscriptMatch[]; showHeader: boolean; onSeeAll: () => void }) {
  return (
    <section>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-medium">Found in Videos</h2>
          <button onClick={onSeeAll} className="text-purple-400 text-sm">See all</button>
        </div>
      )}
      <div className="space-y-3">
        {matches.map((match, index) => (
          <Link key={index} href={`/feed?video=${match.videoId}&t=${match.timestamp}`} className="block p-3 rounded-xl glass hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">...{match.context}...</p>
                <p className="text-white/50 text-xs mt-1">at {formatDuration(match.timestamp)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
