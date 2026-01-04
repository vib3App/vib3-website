import { apiClient } from '../client';
import type { CollabRoom, CollabParticipant, CreateCollabRoomInput } from '@/types/collaboration';

function mapBackendRoom(room: any): CollabRoom {
  if (!room) throw new Error('Room data is null or undefined');

  let participantsArray: CollabParticipant[] = [];
  if (Array.isArray(room.participants)) {
    participantsArray = room.participants.map((p: any): CollabParticipant => ({
      userId: p.id || p.userId || p._id,
      username: p.username || 'Unknown',
      avatar: p.profilePicture || p.avatar,
      role: p.role === 'host' ? 'creator' : 'collaborator',
      joinedAt: p.joinedAt || new Date().toISOString(),
      isReady: p.isReady ?? !p.isMuted,
      hasRecorded: p.hasRecorded ?? false,
      clipUrl: p.clipUrl,
    }));
  }

  const participantCount = Array.isArray(room.participants)
    ? room.participants.length
    : (typeof room.participants === 'number' ? room.participants : 0);

  return {
    id: room.id || room._id,
    creatorId: room.host?.id || room.host?._id || room.hostId,
    creatorUsername: room.host?.username || room.hostUsername || 'Unknown',
    creatorAvatar: room.host?.profilePicture || room.hostProfilePicture,
    title: room.name || room.title || 'Untitled',
    description: room.description,
    status: room.status || 'waiting',
    participants: participantsArray,
    participantCount,
    maxParticipants: room.maxParticipants || 4,
    isPrivate: room.isPrivate || false,
    inviteCode: room.inviteCode || room.jitsiRoomName,
    createdAt: room.createdAt || new Date().toISOString(),
    startedAt: room.startedAt,
    completedAt: room.completedAt || room.endedAt,
  };
}

export const roomsApi = {
  async getCollabRooms(page = 1, limit = 20): Promise<{ rooms: CollabRoom[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ rooms: any[]; hasMore: boolean }>('/collab/rooms', {
      params: { page, limit },
    });
    return { rooms: (data.rooms || []).map(mapBackendRoom), hasMore: data.hasMore };
  },

  async getMyCollabRooms(): Promise<CollabRoom[]> {
    const { data } = await apiClient.get<{ hosted: any[]; participating: any[] }>('/collab/my-rooms');
    return [...(data.hosted || []).map(mapBackendRoom), ...(data.participating || []).map(mapBackendRoom)];
  },

  async getCollabRoom(roomId: string): Promise<CollabRoom> {
    const { data } = await apiClient.get<{ room: any }>(`/collab/rooms/${roomId}`);
    return mapBackendRoom(data.room);
  },

  async createCollabRoom(input: CreateCollabRoomInput): Promise<CollabRoom> {
    const payload = {
      name: input.title,
      description: input.description,
      maxParticipants: input.maxParticipants,
      isPrivate: input.isPrivate,
    };
    const { data } = await apiClient.post<{ room: any }>('/collab/rooms', payload);
    return mapBackendRoom(data.room);
  },

  async joinCollabRoom(roomId: string, inviteCode?: string): Promise<CollabRoom> {
    const { data } = await apiClient.post<{ room: any }>(`/collab/rooms/${roomId}/join`, { inviteCode });
    return mapBackendRoom(data.room);
  },

  async joinByInviteCode(inviteCode: string): Promise<CollabRoom> {
    const { data } = await apiClient.post<{ room: any }>('/collab/rooms/join-by-code', { inviteCode });
    return mapBackendRoom(data.room);
  },

  async leaveCollabRoom(roomId: string): Promise<void> {
    await apiClient.post(`/collab/rooms/${roomId}/leave`);
  },

  async inviteUser(roomId: string, userId: string): Promise<void> {
    await apiClient.post(`/collab/rooms/${roomId}/invite`, { userId });
  },

  async startRecording(roomId: string): Promise<void> {
    await apiClient.post(`/collab/rooms/${roomId}/start`);
  },

  async submitClip(roomId: string, clipUrl: string): Promise<void> {
    await apiClient.post(`/collab/rooms/${roomId}/submit`, { clipUrl });
  },

  async setReady(roomId: string, ready: boolean): Promise<void> {
    await apiClient.patch(`/collab/rooms/${roomId}/ready`, { ready });
  },

  async finalizeCollab(roomId: string): Promise<{ videoId: string }> {
    const { data } = await apiClient.post<{ videoId: string }>(`/collab/rooms/${roomId}/finalize`);
    return data;
  },

  async cancelCollabRoom(roomId: string): Promise<void> {
    await apiClient.delete(`/collab/rooms/${roomId}`);
  },
};
