/**
 * Live streaming types
 */

export type LiveStreamStatus = 'scheduled' | 'starting' | 'live' | 'ended' | 'cancelled';

export interface LiveStream {
  id: string;
  hostId: string;
  hostUsername: string;
  hostAvatar?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: LiveStreamStatus;
  viewerCount: number;
  likeCount: number;
  giftCount: number;
  streamKey?: string;
  rtmpUrl?: string;
  hlsUrl?: string;
  startedAt?: string;
  endedAt?: string;
  scheduledFor?: string;
  isPrivate: boolean;
  allowGuests: boolean;
  maxGuests: number;
  guests: LiveGuest[];
  createdAt: string;
}

export interface LiveGuest {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: string;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface LiveChatMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  type: 'text' | 'gift' | 'join' | 'leave' | 'system';
  giftId?: string;
  giftName?: string;
  giftValue?: number;
  createdAt: string;
}

export interface LiveReaction {
  type: 'like' | 'heart' | 'fire' | 'laugh' | 'wow' | 'clap';
  count: number;
}

export interface LiveGift {
  id: string;
  name: string;
  iconUrl: string;
  coinValue: number;
  animationUrl?: string;
}

export interface CreateLiveStreamInput {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  isPrivate?: boolean;
  allowGuests?: boolean;
  maxGuests?: number;
  scheduledFor?: string;
}

export interface LiveStreamStats {
  peakViewers: number;
  totalViewers: number;
  totalLikes: number;
  totalGifts: number;
  totalCoinsEarned: number;
  duration: number;
  chatMessages: number;
}

export interface LiveKitCredentials {
  token: string;
  wsUrl: string;
  roomName: string;
}

export interface StartStreamResponse {
  stream: LiveStream;
  liveKit: LiveKitCredentials | null;
}

export interface JoinStreamResponse {
  stream: LiveStream;
  roomId: string;
  liveKit: LiveKitCredentials | null;
}

export interface LiveKitTokenResponse {
  token: string;
  wsUrl: string;
  roomName: string;
  isHost: boolean;
}

export interface LiveKitStatus {
  available: boolean;
  wsUrl: string | null;
}
