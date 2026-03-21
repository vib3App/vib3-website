/**
 * Live streaming types
 */

type LiveStreamStatus = 'scheduled' | 'starting' | 'live' | 'ended' | 'cancelled';

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

export interface AgoraCredentials {
  token: string;
  channelName: string;
  uid: number;
  appId: string;
  role: 'host' | 'viewer';
}

export interface StartStreamResponse {
  stream: LiveStream;
  agora: AgoraCredentials | null;
}

export interface JoinStreamResponse {
  stream: LiveStream;
  roomId: string;
  agora: AgoraCredentials | null;
}

export interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: number;
  appId: string;
  role: 'host' | 'viewer';
  isHost: boolean;
  streamId: string;
}
