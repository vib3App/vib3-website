/**
 * Collaboration API service - Collab rooms, Echo/Remix, Watch parties
 */
import { apiClient } from './client';
import type {
  CollabRoom,
  CollabParticipant,
  CreateCollabRoomInput,
  Remix,
  RemixType,
  WatchParty,
  WatchPartyChatMessage,
  CreateWatchPartyInput,
  CollaborationStats,
} from '@/types/collaboration';

// Map backend room response to frontend CollabRoom type
function mapBackendRoom(room: any): CollabRoom {
  return {
    id: room.id || room._id,
    creatorId: room.host?.id || room.hostId,
    creatorUsername: room.host?.username || room.hostUsername || 'Unknown',
    creatorAvatar: room.host?.profilePicture || room.hostProfilePicture,
    title: room.name || room.title || 'Untitled',
    description: room.description,
    status: room.status || 'waiting',
    participants: (room.participants || []).map((p: any): CollabParticipant => ({
      userId: p.id || p.userId,
      username: p.username || 'Unknown',
      avatar: p.profilePicture || p.avatar,
      role: p.role === 'host' ? 'creator' : 'collaborator',
      joinedAt: p.joinedAt || new Date().toISOString(),
      isReady: p.isReady ?? !p.isMuted,
      hasRecorded: p.hasRecorded ?? false,
      clipUrl: p.clipUrl,
    })),
    maxParticipants: room.maxParticipants || 4,
    isPrivate: room.isPrivate || false,
    inviteCode: room.inviteCode || room.jitsiRoomName,
    createdAt: room.createdAt || new Date().toISOString(),
    startedAt: room.startedAt,
    completedAt: room.completedAt,
  };
}

export const collaborationApi = {
  // ========== Collab Rooms ==========

  /**
   * Get active collab rooms
   */
  async getCollabRooms(page = 1, limit = 20): Promise<{ rooms: CollabRoom[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ rooms: any[]; hasMore: boolean }>('/collab/rooms', {
      params: { page, limit },
    });
    return {
      rooms: (data.rooms || []).map(mapBackendRoom),
      hasMore: data.hasMore,
    };
  },

  /**
   * Get my collab rooms (as creator or participant)
   */
  async getMyCollabRooms(): Promise<CollabRoom[]> {
    const { data } = await apiClient.get<{ rooms: any[] }>('/collab/rooms/my');
    return (data.rooms || []).map(mapBackendRoom);
  },

  /**
   * Get a single collab room
   */
  async getCollabRoom(roomId: string): Promise<CollabRoom> {
    const { data } = await apiClient.get<{ room: any }>(`/collab/rooms/${roomId}`);
    return mapBackendRoom(data.room);
  },

  /**
   * Create a collab room
   */
  async createCollabRoom(input: CreateCollabRoomInput): Promise<CollabRoom> {
    // Map frontend 'title' to backend 'name'
    const payload = {
      name: input.title,
      description: input.description,
      maxParticipants: input.maxParticipants,
      isPrivate: input.isPrivate,
    };
    const { data } = await apiClient.post<{ room: any }>('/collab/rooms', payload);
    return mapBackendRoom(data.room);
  },

  /**
   * Join a collab room
   */
  async joinCollabRoom(roomId: string, inviteCode?: string): Promise<CollabRoom> {
    const { data } = await apiClient.post<{ room: any }>(`/collab/rooms/${roomId}/join`, {
      inviteCode,
    });
    return mapBackendRoom(data.room);
  },

  /**
   * Join by invite code
   */
  async joinByInviteCode(inviteCode: string): Promise<CollabRoom> {
    const { data } = await apiClient.post<{ room: any }>('/collab/rooms/join-by-code', {
      inviteCode,
    });
    return mapBackendRoom(data.room);
  },

  /**
   * Leave a collab room
   */
  async leaveCollabRoom(roomId: string): Promise<void> {
    await apiClient.post(`/collab/rooms/${roomId}/leave`);
  },

  /**
   * Start recording session
   */
  async startRecording(roomId: string): Promise<void> {
    await apiClient.post(`/collab/rooms/${roomId}/start`);
  },

  /**
   * Submit recorded clip
   */
  async submitClip(roomId: string, clipUrl: string): Promise<void> {
    await apiClient.post(`/collab/rooms/${roomId}/submit`, { clipUrl });
  },

  /**
   * Mark as ready
   */
  async setReady(roomId: string, ready: boolean): Promise<void> {
    await apiClient.patch(`/collab/rooms/${roomId}/ready`, { ready });
  },

  /**
   * Finalize collab (creator only)
   */
  async finalizeCollab(roomId: string): Promise<{ videoId: string }> {
    const { data } = await apiClient.post<{ videoId: string }>(`/collab/rooms/${roomId}/finalize`);
    return data;
  },

  /**
   * Cancel collab room (creator only)
   */
  async cancelCollabRoom(roomId: string): Promise<void> {
    await apiClient.delete(`/collab/rooms/${roomId}`);
  },

  // ========== Echo/Remix ==========

  /**
   * Get remixes of a video
   */
  async getVideoRemixes(
    videoId: string,
    type?: RemixType,
    page = 1
  ): Promise<{ remixes: Remix[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ remixes: Remix[]; hasMore: boolean }>(
      `/videos/${videoId}/remixes`,
      { params: { type, page } }
    );
    return data;
  },

  /**
   * Get my remixes
   */
  async getMyRemixes(type?: RemixType): Promise<Remix[]> {
    const { data } = await apiClient.get<{ remixes: Remix[] }>('/remixes/my', {
      params: { type },
    });
    return data.remixes;
  },

  /**
   * Create a remix (echo, duet, stitch)
   */
  async createRemix(
    type: RemixType,
    originalVideoId: string,
    videoUrl: string,
    options?: {
      title?: string;
      description?: string;
      splitPosition?: number;
    }
  ): Promise<Remix> {
    const { data } = await apiClient.post<{ remix: Remix }>('/remixes', {
      type,
      originalVideoId,
      videoUrl,
      ...options,
    });
    return data.remix;
  },

  /**
   * Delete a remix
   */
  async deleteRemix(remixId: string): Promise<void> {
    await apiClient.delete(`/remixes/${remixId}`);
  },

  /**
   * Check if remix is allowed for a video
   */
  async checkRemixPermission(videoId: string): Promise<{
    allowEcho: boolean;
    allowDuet: boolean;
    allowStitch: boolean;
    allowRemix: boolean;
  }> {
    const { data } = await apiClient.get<{
      allowEcho: boolean;
      allowDuet: boolean;
      allowStitch: boolean;
      allowRemix: boolean;
    }>(`/videos/${videoId}/remix-settings`);
    return data;
  },

  // ========== Watch Parties ==========

  /**
   * Get active watch parties
   */
  async getWatchParties(page = 1, limit = 20): Promise<{ parties: WatchParty[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ parties: WatchParty[]; hasMore: boolean }>(
      '/watch-parties',
      { params: { page, limit } }
    );
    return data;
  },

  /**
   * Get a watch party
   */
  async getWatchParty(partyId: string): Promise<WatchParty> {
    const { data } = await apiClient.get<{ party: WatchParty }>(`/watch-parties/${partyId}`);
    return data.party;
  },

  /**
   * Create a watch party
   */
  async createWatchParty(input: CreateWatchPartyInput): Promise<WatchParty> {
    const { data } = await apiClient.post<{ party: WatchParty }>('/watch-parties', input);
    return data.party;
  },

  /**
   * Join a watch party
   */
  async joinWatchParty(partyId: string, inviteCode?: string): Promise<WatchParty> {
    const { data } = await apiClient.post<{ party: WatchParty }>(`/watch-parties/${partyId}/join`, {
      inviteCode,
    });
    return data.party;
  },

  /**
   * Leave a watch party
   */
  async leaveWatchParty(partyId: string): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/leave`);
  },

  /**
   * Add video to watch party playlist
   */
  async addToPlaylist(partyId: string, videoId: string): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/playlist`, { videoId });
  },

  /**
   * Remove video from playlist (host only)
   */
  async removeFromPlaylist(partyId: string, videoId: string): Promise<void> {
    await apiClient.delete(`/watch-parties/${partyId}/playlist/${videoId}`);
  },

  /**
   * Reorder playlist (host only)
   */
  async reorderPlaylist(partyId: string, videoIds: string[]): Promise<void> {
    await apiClient.patch(`/watch-parties/${partyId}/playlist`, { videoIds });
  },

  /**
   * Play/Pause (host only)
   */
  async setPlaybackState(partyId: string, playing: boolean): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/playback`, { playing });
  },

  /**
   * Seek to position (host only)
   */
  async seekTo(partyId: string, position: number): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/seek`, { position });
  },

  /**
   * Skip to next video (host only)
   */
  async skipToNext(partyId: string): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/next`);
  },

  /**
   * Skip to specific video (host only)
   */
  async skipToVideo(partyId: string, videoIndex: number): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/skip`, { videoIndex });
  },

  /**
   * Get chat messages
   */
  async getWatchPartyChat(
    partyId: string,
    before?: string,
    limit = 50
  ): Promise<WatchPartyChatMessage[]> {
    const { data } = await apiClient.get<{ messages: WatchPartyChatMessage[] }>(
      `/watch-parties/${partyId}/chat`,
      { params: { before, limit } }
    );
    return data.messages;
  },

  /**
   * Send chat message
   */
  async sendChatMessage(partyId: string, content: string): Promise<WatchPartyChatMessage> {
    const { data } = await apiClient.post<{ message: WatchPartyChatMessage }>(
      `/watch-parties/${partyId}/chat`,
      { content }
    );
    return data.message;
  },

  /**
   * End watch party (host only)
   */
  async endWatchParty(partyId: string): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/end`);
  },

  // ========== Stats ==========

  /**
   * Get collaboration stats for a user
   */
  async getCollaborationStats(userId?: string): Promise<CollaborationStats> {
    const { data } = await apiClient.get<CollaborationStats>('/collab/stats', {
      params: { userId },
    });
    return data;
  },
};
