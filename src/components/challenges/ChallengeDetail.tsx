'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { challengesApi } from '@/services/api';
import type { Challenge } from '@/types/challenge';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VideoSubmission = { _id?: string; id?: string; thumbnailUrl?: string; username?: string; [key: string]: any };
import { logger } from '@/utils/logger';

interface ChallengeDetailProps {
  challengeId: string;
  onClose: () => void;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function getTimeRemaining(endDate: string): string | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} left`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} left`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} min left`;
}

/**
 * Gap #83: Challenge Detail panel
 * Shows challenge info, rules, top submissions, and allows joining/submitting.
 */
export function ChallengeDetail({ challengeId, onClose }: ChallengeDetailProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [challengeData, submissionsData] = await Promise.all([
          challengesApi.getChallenge(challengeId),
          challengesApi.getChallengeVideos(challengeId, { sort: 'popular', limit: 12 }),
        ]);
        setChallenge(challengeData);
        setSubmissions(submissionsData.videos);
      } catch (err) {
        logger.error('Failed to load challenge detail:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [challengeId]);

  const loadSubmissions = async (sort: 'popular' | 'recent') => {
    setSortBy(sort);
    setSubmissionsLoading(true);
    try {
      const data = await challengesApi.getChallengeVideos(challengeId, { sort, limit: 12 });
      setSubmissions(data.videos);
    } catch (err) {
      logger.error('Failed to load submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!challenge) return;
    setJoining(true);
    try {
      if (challenge.hasJoined) {
        await challengesApi.leaveChallenge(challengeId);
        setChallenge(prev => prev ? {
          ...prev,
          hasJoined: false,
          stats: { ...prev.stats, participantCount: prev.stats.participantCount - 1 },
        } : null);
      } else {
        await challengesApi.joinChallenge(challengeId);
        setChallenge(prev => prev ? {
          ...prev,
          hasJoined: true,
          stats: { ...prev.stats, participantCount: prev.stats.participantCount + 1 },
        } : null);
      }
    } catch (err) {
      logger.error('Failed to join/leave challenge:', err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!challenge) return null;

  const timeRemaining = getTimeRemaining(challenge.endDate);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 pt-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-white font-bold text-lg">Challenge Details</h2>
          <div className="w-6" />
        </div>

        {/* Cover */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-4">
          {challenge.coverImage ? (
            <Image src={challenge.coverImage} alt={challenge.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-8xl">🏆</div>
          )}
          {timeRemaining && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              {timeRemaining}
            </div>
          )}
        </div>

        {/* Info */}
        <h1 className="text-2xl font-bold text-white mb-1">{challenge.title}</h1>
        <p className="text-amber-500 font-medium mb-2">#{challenge.hashtag}</p>
        <p className="text-white/70 mb-4">{challenge.description}</p>

        {/* Rules */}
        {challenge.rules && (
          <div className="glass-card p-4 rounded-xl mb-4">
            <h3 className="text-white font-semibold mb-2">Rules</h3>
            <p className="text-white/60 text-sm whitespace-pre-line">{challenge.rules}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 mb-4 text-sm">
          <div className="text-center">
            <div className="text-white font-bold">{formatCount(challenge.stats.participantCount)}</div>
            <div className="text-white/50">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">{formatCount(challenge.stats.videoCount)}</div>
            <div className="text-white/50">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">{formatCount(challenge.stats.viewCount)}</div>
            <div className="text-white/50">Views</div>
          </div>
          {challenge.prize && (
            <div className="text-center">
              <div className="text-amber-400 font-bold">{challenge.prize}</div>
              <div className="text-white/50">Prize</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleJoin}
            disabled={joining}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              challenge.hasJoined
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90'
            } ${joining ? 'opacity-50' : ''}`}
          >
            {joining ? 'Loading...' : challenge.hasJoined ? 'Joined' : 'Join Challenge'}
          </button>
          {challenge.hasJoined && (
            <Link
              href={`/camera?challenge=${challengeId}&hashtag=${challenge.hashtag}`}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-center hover:opacity-90 transition"
            >
              Submit Video
            </Link>
          )}
        </div>

        {/* Submissions */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Top Submissions</h3>
            <div className="flex gap-2">
              {(['popular', 'recent'] as const).map(sort => (
                <button
                  key={sort}
                  onClick={() => loadSubmissions(sort)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    sortBy === sort ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {sort === 'popular' ? 'Top' : 'Recent'}
                </button>
              ))}
            </div>
          </div>

          {submissionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              No submissions yet. Be the first!
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {submissions.map(video => (
                <Link
                  key={video._id || video.id}
                  href={`/video/${video._id || video.id}`}
                  className="aspect-[9/16] rounded-lg overflow-hidden bg-white/5 relative group"
                >
                  {video.thumbnailUrl && (
                    <Image src={video.thumbnailUrl} alt="" fill className="object-cover" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">@{video.username || 'user'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
