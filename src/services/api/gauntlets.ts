import { apiClient } from '@/services/api/client';
import type {
  Gauntlet, GauntletRound, GauntletMatch, GauntletResult,
  CreateGauntletInput, LeaderboardEntry,
} from '@/types/gauntlet';

export const gauntletsApi = {
  async getGauntlets(options?: { status?: string; category?: string; page?: number; limit?: number }): Promise<{ gauntlets: Gauntlet[]; hasMore: boolean }> {
    const { data } = await apiClient.get('/gauntlets', { params: options });
    return { gauntlets: data.gauntlets || data || [], hasMore: data.hasMore ?? false };
  },

  async getGauntlet(gauntletId: string): Promise<Gauntlet> {
    const { data } = await apiClient.get(`/gauntlets/${gauntletId}`);
    return data;
  },

  async createGauntlet(input: CreateGauntletInput): Promise<Gauntlet> {
    const { data } = await apiClient.post('/gauntlets', input);
    return data;
  },

  async joinGauntlet(gauntletId: string): Promise<void> {
    await apiClient.post(`/gauntlets/${gauntletId}/join`);
  },

  async leaveGauntlet(gauntletId: string): Promise<void> {
    await apiClient.post(`/gauntlets/${gauntletId}/leave`);
  },

  async getRounds(gauntletId: string): Promise<GauntletRound[]> {
    const { data } = await apiClient.get(`/gauntlets/${gauntletId}/rounds`);
    return data.rounds || data || [];
  },

  async vote(gauntletId: string, matchId: string, participantId: string): Promise<{ participant1Votes: number; participant2Votes: number }> {
    const { data } = await apiClient.post(`/gauntlets/${gauntletId}/matches/${matchId}/vote`, { participantId });
    return data;
  },

  async getResults(gauntletId: string): Promise<GauntletResult> {
    const { data } = await apiClient.get(`/gauntlets/${gauntletId}/results`);
    return data;
  },

  async getMatch(gauntletId: string, matchId: string): Promise<GauntletMatch> {
    const { data } = await apiClient.get(`/gauntlets/${gauntletId}/matches/${matchId}`);
    return data;
  },

  async submitVideo(gauntletId: string, matchId: string, videoId: string): Promise<void> {
    await apiClient.post(`/gauntlets/${gauntletId}/matches/${matchId}/submit`, { videoId });
  },

  async getMyGauntlets(): Promise<{ gauntlets: Gauntlet[]; hasMore: boolean }> {
    const { data } = await apiClient.get('/gauntlets/my');
    return { gauntlets: data.gauntlets || data || [], hasMore: data.hasMore ?? false };
  },

  async submitRoundVideo(
    gauntletId: string, roundNum: number,
    payload: { videoId: string; videoUrl: string; thumbnailUrl?: string },
  ): Promise<void> {
    await apiClient.post(`/gauntlets/${gauntletId}/rounds/${roundNum}/submit`, payload);
  },

  async voteRound(
    gauntletId: string, roundNum: number,
    payload: { matchupId?: string; choice?: 1 | 2; submissionId?: string },
  ): Promise<{ participant1Votes: number; participant2Votes: number }> {
    const { data } = await apiClient.post(`/gauntlets/${gauntletId}/rounds/${roundNum}/vote`, payload);
    return data;
  },

  async sendGift(
    gauntletId: string, roundNum: number, matchupIndex: number,
    payload: { recipientSide: 1 | 2; giftType: string; coins: number },
  ): Promise<void> {
    await apiClient.post(
      `/gauntlets/${gauntletId}/rounds/${roundNum}/matchups/${matchupIndex}/gift`,
      payload,
    );
  },

  async getLeaderboard(gauntletId: string): Promise<LeaderboardEntry[]> {
    const { data } = await apiClient.get(`/gauntlets/${gauntletId}/leaderboard`);
    return data.leaderboard || data || [];
  },
};
