/**
 * Collaboration types - Collab rooms, Echo/Remix, Watch parties
 */

// ========== Collab Rooms ==========

export type CollabRoomStatus = 'waiting' | 'recording' | 'editing' | 'completed' | 'cancelled';

export interface CollabRoom {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar?: string;
  title: string;
  description?: string;
  status: CollabRoomStatus;
  participants: CollabParticipant[];
  maxParticipants: number;
  isPrivate: boolean;
  inviteCode?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CollabParticipant {
  userId: string;
  username: string;
  avatar?: string;
  role: 'creator' | 'collaborator';
  joinedAt: string;
  isReady: boolean;
  hasRecorded: boolean;
  clipUrl?: string;
}

export interface CreateCollabRoomInput {
  title: string;
  description?: string;
  maxParticipants?: number;
  isPrivate?: boolean;
}

// ========== Echo/Remix ==========

export type RemixType = 'echo' | 'duet' | 'stitch' | 'remix';

export interface Remix {
  id: string;
  type: RemixType;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar?: string;
  originalVideoId: string;
  originalVideoTitle: string;
  originalCreatorUsername: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface CreateRemixInput {
  type: RemixType;
  originalVideoId: string;
  videoFile: File;
  title?: string;
  description?: string;
  splitPosition?: number; // For duet/stitch: 0-100 percentage
}

export interface RemixSettings {
  allowEcho: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  allowRemix: boolean;
}

// ========== Watch Parties ==========

export type WatchPartyStatus = 'waiting' | 'playing' | 'paused' | 'ended';

export interface WatchParty {
  id: string;
  hostId: string;
  hostUsername: string;
  hostAvatar?: string;
  title: string;
  status: WatchPartyStatus;
  playlist: WatchPartyVideo[];
  currentVideoIndex: number;
  currentPosition: number; // seconds
  participants: WatchPartyParticipant[];
  maxParticipants: number;
  isPrivate: boolean;
  inviteCode?: string;
  createdAt: string;
  startedAt?: string;
}

export interface WatchPartyVideo {
  videoId: string;
  videoTitle: string;
  videoThumbnail?: string;
  videoDuration: number;
  addedBy: string;
  addedAt: string;
}

export interface WatchPartyParticipant {
  userId: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  joinedAt: string;
  isOnline: boolean;
}

export interface WatchPartyChatMessage {
  id: string;
  partyId: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  type: 'text' | 'reaction' | 'system';
  createdAt: string;
}

export interface CreateWatchPartyInput {
  title: string;
  videoIds?: string[];
  maxParticipants?: number;
  isPrivate?: boolean;
}

// ========== Collaboration Stats ==========

export interface CollaborationStats {
  totalCollabs: number;
  totalRemixes: number;
  totalWatchParties: number;
  topCollaborators: Array<{
    userId: string;
    username: string;
    avatar?: string;
    collabCount: number;
  }>;
}
