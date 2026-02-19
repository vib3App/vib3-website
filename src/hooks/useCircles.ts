'use client';

import { useState, useCallback, useEffect } from 'react';
import { locationApi } from '@/services/api/location';
import type { LocationCircle } from '@/types/location';
import { logger } from '@/utils/logger';

export function useCircles() {
  const [circles, setCircles] = useState<LocationCircle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCircles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await locationApi.getCircles();
      setCircles(data);
    } catch (err) {
      logger.error('Failed to load circles:', err);
      setError('Failed to load circles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCircles();
  }, [loadCircles]);

  const createCircle = useCallback(async (name: string, color: string, memberIds: string[]) => {
    try {
      const created = await locationApi.createCircle(name, color, memberIds);
      setCircles(prev => [created, ...prev]);
      return created;
    } catch (err) {
      logger.error('Failed to create circle:', err);
      throw err;
    }
  }, []);

  const deleteCircle = useCallback(async (circleId: string) => {
    try {
      await locationApi.deleteCircle(circleId);
      setCircles(prev => prev.filter(c => c.id !== circleId));
    } catch (err) {
      logger.error('Failed to delete circle:', err);
      throw err;
    }
  }, []);

  const addMember = useCallback(async (circleId: string, userId: string) => {
    try {
      await locationApi.addToCircle(circleId, userId);
      setCircles(prev =>
        prev.map(c =>
          c.id === circleId ? { ...c, members: [...c.members, userId] } : c
        )
      );
    } catch (err) {
      logger.error('Failed to add member:', err);
      throw err;
    }
  }, []);

  const removeMember = useCallback(async (circleId: string, userId: string) => {
    try {
      await locationApi.removeFromCircle(circleId, userId);
      setCircles(prev =>
        prev.map(c =>
          c.id === circleId ? { ...c, members: c.members.filter(m => m !== userId) } : c
        )
      );
    } catch (err) {
      logger.error('Failed to remove member:', err);
      throw err;
    }
  }, []);

  const getCircleById = useCallback(
    (id: string) => circles.find(c => c.id === id) || null,
    [circles]
  );

  return {
    circles, isLoading, error, loadCircles,
    createCircle, deleteCircle, addMember, removeMember, getCircleById,
  };
}
