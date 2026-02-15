/**
 * Challenge types - Trending challenges users can participate in
 */

export type ChallengeCategory =
  | 'trending'
  | 'new'
  | 'music'
  | 'dance'
  | 'comedy'
  | 'sponsored'
  | 'fitness'
  | 'food'
  | 'art'
  | 'other';

type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

type ChallengeStatus = 'draft' | 'active' | 'ended' | 'cancelled';

interface ChallengeCreator {
  _id: string;
  username: string;
  avatar?: string;
}

interface ChallengeStats {
  participantCount: number;
  videoCount: number;
  viewCount: number;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  hashtag: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  creatorId: string | ChallengeCreator;
  coverImage?: string;
  prize?: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  isSponsored: boolean;
  isFeatured: boolean;
  stats: ChallengeStats;
  rules?: string;
  hasJoined?: boolean;
  isCreator?: boolean; // True if current user created this challenge
  createdAt: string;
  updatedAt: string;
}

export interface CreateChallengeInput {
  title: string;
  description: string;
  hashtag: string;
  category?: ChallengeCategory;
  difficulty?: ChallengeDifficulty;
  coverImage?: string;
  prize?: string;
  endDate: string;
  rules?: string;
}

export interface UpdateChallengeInput {
  title?: string;
  description?: string;
  category?: ChallengeCategory;
  difficulty?: ChallengeDifficulty;
  coverImage?: string;
  prize?: string;
  endDate?: string;
  rules?: string;
  status?: ChallengeStatus;
}

export interface ChallengesListResponse {
  challenges: Challenge[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
