import { apiClient } from '../client';
import { roomsApi } from './rooms';
import { remixApi } from './remix';
import { watchPartyApi } from './watchParty';
import type { CollaborationStats } from '@/types/collaboration';

export const collaborationApi = {
  // Collab Rooms
  getCollabRooms: roomsApi.getCollabRooms,
  getMyCollabRooms: roomsApi.getMyCollabRooms,
  getCollabRoom: roomsApi.getCollabRoom,
  createCollabRoom: roomsApi.createCollabRoom,
  joinCollabRoom: roomsApi.joinCollabRoom,
  joinByInviteCode: roomsApi.joinByInviteCode,
  leaveCollabRoom: roomsApi.leaveCollabRoom,
  inviteUser: roomsApi.inviteUser,
  startRecording: roomsApi.startRecording,
  submitClip: roomsApi.submitClip,
  setReady: roomsApi.setReady,
  finalizeCollab: roomsApi.finalizeCollab,
  cancelCollabRoom: roomsApi.cancelCollabRoom,

  // Echo/Remix
  getVideoRemixes: remixApi.getVideoRemixes,
  getMyRemixes: remixApi.getMyRemixes,
  createRemix: remixApi.createRemix,
  deleteRemix: remixApi.deleteRemix,
  checkRemixPermission: remixApi.checkRemixPermission,

  // Watch Parties
  getWatchParties: watchPartyApi.getWatchParties,
  getWatchParty: watchPartyApi.getWatchParty,
  createWatchParty: watchPartyApi.createWatchParty,
  joinWatchParty: watchPartyApi.joinWatchParty,
  leaveWatchParty: watchPartyApi.leaveWatchParty,
  addToPlaylist: watchPartyApi.addToPlaylist,
  removeFromPlaylist: watchPartyApi.removeFromPlaylist,
  reorderPlaylist: watchPartyApi.reorderPlaylist,
  setPlaybackState: watchPartyApi.setPlaybackState,
  seekTo: watchPartyApi.seekTo,
  skipToNext: watchPartyApi.skipToNext,
  skipToVideo: watchPartyApi.skipToVideo,
  getWatchPartyChat: watchPartyApi.getWatchPartyChat,
  sendChatMessage: watchPartyApi.sendChatMessage,
  endWatchParty: watchPartyApi.endWatchParty,

  // Stats
  async getCollaborationStats(userId?: string): Promise<CollaborationStats> {
    const { data } = await apiClient.get<CollaborationStats>('/collab/stats', {
      params: { userId },
    });
    return data;
  },
};
