/**
 * Q&A API service for creator Q&A system
 */
import { apiClient } from './client';
import { logger } from '@/utils/logger';

export interface Question {
  id: string;
  creatorId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  likesCount: number;
  isLiked?: boolean;
  answer?: Answer;
  createdAt: string;
}

export interface Answer {
  id: string;
  text?: string;
  videoUrl?: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export const qaApi = {
  async getQuestions(creatorId: string, page = 1, limit = 20): Promise<{ questions: Question[]; hasMore: boolean }> {
    try {
      const { data } = await apiClient.get<{ questions: Question[]; hasMore: boolean }>(
        `/qa/${creatorId}`, { params: { page, limit } }
      );
      return data;
    } catch (err) {
      logger.error('Failed to fetch questions:', err);
      return { questions: [], hasMore: false };
    }
  },

  async submitQuestion(creatorId: string, text: string): Promise<Question | null> {
    try {
      const { data } = await apiClient.post<Question>(`/qa/${creatorId}/question`, { text });
      return data;
    } catch (err) {
      logger.error('Failed to submit question:', err);
      return null;
    }
  },

  async likeQuestion(questionId: string): Promise<boolean> {
    try {
      await apiClient.post(`/qa/question/${questionId}/like`);
      return true;
    } catch (err) {
      logger.error('Failed to like question:', err);
      return false;
    }
  },

  async answerQuestion(questionId: string, input: { text?: string; videoUrl?: string }): Promise<Answer | null> {
    try {
      const { data } = await apiClient.post<Answer>(`/qa/question/${questionId}/answer`, input);
      return data;
    } catch (err) {
      logger.error('Failed to answer question:', err);
      return null;
    }
  },

  async likeAnswer(answerId: string): Promise<boolean> {
    try {
      await apiClient.post(`/qa/answer/${answerId}/like`);
      return true;
    } catch (err) {
      logger.error('Failed to like answer:', err);
      return false;
    }
  },
};
