'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Story, StoryReaction, StoryViewerProfile } from '@/types/story';
import { storiesApi } from '@/services/api/stories';
import { logger } from '@/utils/logger';

interface StoryAnalyticsProps {
  story: Story;
  isOwnStory: boolean;
}

export function StoryAnalytics({ story, isOwnStory }: StoryAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOwnStory) return null;

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-white/60 text-xs px-3 py-1.5 glass rounded-full hover:bg-white/10">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {story.viewCount} views
      </button>

      {isOpen && (
        <StoryAnalyticsPanel story={story} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

function StoryAnalyticsPanel({ story, onClose }: { story: Story; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'viewers' | 'reactions'>('overview');
  const [viewers, setViewers] = useState<StoryViewerProfile[]>([]);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [viewersLoaded, setViewersLoaded] = useState(false);

  useEffect(() => {
    if (activeTab === 'viewers' && !viewersLoaded) {
      setViewersLoading(true);
      storiesApi.getStoryViewers(story.id)
        .then(data => { setViewers(data); setViewersLoaded(true); })
        .catch(err => { logger.error('Failed to load viewers:', err); setViewersLoaded(true); })
        .finally(() => setViewersLoading(false));
    }
  }, [activeTab, viewersLoaded, story.id]);

  const reactionCounts = getReactionCounts(story.reactions);
  const uniqueViewers = story.viewCount;
  const totalReactions = story.reactions.length;
  const postedTime = new Date(story.createdAt).toLocaleString();
  const expiresTime = new Date(story.expiresAt).toLocaleString();

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Story Insights</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(['overview', 'viewers', 'reactions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === tab ? 'text-white border-b-2 border-purple-500' : 'text-white/50'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon="👁️" label="Views" value={uniqueViewers} />
                <StatCard icon="💬" label="Reactions" value={totalReactions} />
              </div>
              <div className="glass rounded-xl p-3 space-y-2">
                <InfoRow label="Posted" value={postedTime} />
                <InfoRow label="Expires" value={expiresTime} />
                <InfoRow label="Type" value={story.mediaType === 'video' ? 'Video' : 'Photo'} />
                {story.caption && <InfoRow label="Caption" value={story.caption} />}
              </div>
              {reactionCounts.length > 0 && (
                <div className="glass rounded-xl p-3">
                  <h4 className="text-white/50 text-xs uppercase mb-2">Reaction Breakdown</h4>
                  <div className="flex flex-wrap gap-2">
                    {reactionCounts.map(r => (
                      <span key={r.emoji} className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full text-sm">
                        <span>{r.emoji}</span>
                        <span className="text-white/70">{r.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'viewers' && (
            <div className="space-y-2">
              {viewersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : viewers.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">
                  {story.viewCount > 0 ? `${story.viewCount} views` : 'No viewers yet'}
                </p>
              ) : (
                viewers.map(v => (
                  <ViewerItem key={v.userId} viewer={v} />
                ))
              )}
            </div>
          )}

          {activeTab === 'reactions' && (
            <div className="space-y-2">
              {story.reactions.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">No reactions yet</p>
              ) : (
                story.reactions.map(r => (
                  <ReactionItem key={r.id} reaction={r} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <div className="text-2xl font-bold text-white mt-1">{value.toLocaleString()}</div>
      <div className="text-white/50 text-xs">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  );
}

function ReactionItem({ reaction }: { reaction: StoryReaction }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
        {reaction.username[0]?.toUpperCase()}
      </div>
      <span className="text-white text-sm flex-1">@{reaction.username}</span>
      <span className="text-xl">{reaction.emoji}</span>
      <span className="text-white/30 text-xs">
        {new Date(reaction.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
      </span>
    </div>
  );
}

function ViewerItem({ viewer }: { viewer: StoryViewerProfile }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        {viewer.avatar ? (
          <Image src={viewer.avatar} alt={viewer.username} width={32} height={32} className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
            {viewer.username[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-white text-sm flex-1">@{viewer.username}</span>
      <span className="text-white/30 text-xs">
        {new Date(viewer.viewedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
      </span>
    </div>
  );
}

function getReactionCounts(reactions: StoryReaction[]): { emoji: string; count: number }[] {
  const map = new Map<string, number>();
  reactions.forEach(r => map.set(r.emoji, (map.get(r.emoji) || 0) + 1));
  return Array.from(map.entries()).map(([emoji, count]) => ({ emoji, count })).sort((a, b) => b.count - a.count);
}
