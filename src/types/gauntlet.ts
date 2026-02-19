export type GauntletStatus = 'upcoming' | 'active' | 'voting' | 'completed' | 'cancelled';
export type GauntletCategory = 'dance' | 'comedy' | 'music' | 'art' | 'cooking' | 'fitness' | 'fashion' | 'general';

export interface Gauntlet {
  id: string;
  title: string;
  description?: string;
  category: GauntletCategory;
  status: GauntletStatus;
  coverImageUrl?: string;
  creatorId: string;
  creatorUsername: string;
  maxParticipants: number;
  participantCount: number;
  currentRound: number;
  totalRounds: number;
  prizeDescription?: string;
  startsAt: string;
  endsAt?: string;
  createdAt: string;
  isJoined?: boolean;
  pendingMatchId?: string;
}

export interface GauntletRound {
  id: string;
  gauntletId: string;
  roundNumber: number;
  status: 'pending' | 'active' | 'completed';
  theme?: string;
  matches: GauntletMatch[];
  submissions?: GauntletSubmission[];
  startsAt: string;
  endsAt?: string;
}

export interface GauntletMatch {
  id: string;
  roundId: string;
  participant1: GauntletParticipant;
  participant2: GauntletParticipant;
  participant1Votes: number;
  participant2Votes: number;
  winnerId?: string;
  videoId1?: string;
  videoId2?: string;
  videoUrl1?: string;
  videoUrl2?: string;
  thumbnailUrl1?: string;
  thumbnailUrl2?: string;
  status: 'pending' | 'active' | 'completed';
  userVote?: string;
}

export interface GauntletParticipant {
  userId: string;
  username: string;
  avatar?: string;
  seed?: number;
  isEliminated: boolean;
}

export interface GauntletResult {
  gauntletId: string;
  champion: GauntletParticipant;
  runnerUp: GauntletParticipant;
  standings: Array<{ participant: GauntletParticipant; placement: number }>;
}

export interface GauntletSubmission {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  voteCount: number;
  isEliminated: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  wins: number;
  losses: number;
  points: number;
}

export interface CreateGauntletInput {
  title: string;
  description?: string;
  category: GauntletCategory;
  maxParticipants: number;
  prizeDescription?: string;
  startsAt: string;
}
