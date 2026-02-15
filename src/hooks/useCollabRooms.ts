'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collaborationApi } from '@/services/api';
import { useToastStore } from '@/stores/toastStore';
import type { CollabRoom } from '@/types/collaboration';

export type CollabTab = 'discover' | 'my';

export function useCollabRooms() {
  const router = useRouter();
  const addToast = useToastStore(s => s.addToast);
  const [tab, setTab] = useState<CollabTab>('discover');
  const [rooms, setRooms] = useState<CollabRoom[]>([]);
  const [myRooms, setMyRooms] = useState<CollabRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Create room modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createMaxParticipants, setCreateMaxParticipants] = useState(4);
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Join by code modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (tab === 'discover') {
          const data = await collaborationApi.getCollabRooms(page);
          setRooms(prev => page === 1 ? data.rooms : [...prev, ...data.rooms]);
          setHasMore(data.hasMore);
        } else {
          const data = await collaborationApi.getMyCollabRooms();
          setMyRooms(data);
        }
      } catch (err) {
        console.error('Failed to fetch collab rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [tab, page]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    setCreating(true);
    try {
      const room = await collaborationApi.createCollabRoom({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        maxParticipants: createMaxParticipants,
        isPrivate: createIsPrivate,
      });
      router.push(`/collab/${room.id}`);
    } catch (err: any) {
      console.error('Failed to create room:', err);
      // Show specific error message
      if (err?.status === 401) {
        addToast('Please login to create a collab room');
      } else if (err?.message) {
        addToast(err.message);
      } else {
        addToast('Failed to create collab room');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    try {
      const room = await collaborationApi.joinByInviteCode(inviteCode.trim());
      router.push(`/collab/${room.id}`);
    } catch (err) {
      console.error('Failed to join room:', err);
      addToast('Invalid invite code');
    } finally {
      setJoining(false);
    }
  };

  const switchTab = (newTab: CollabTab) => {
    setTab(newTab);
    if (newTab === 'discover') setPage(1);
  };

  const loadMore = () => setPage(p => p + 1);

  const displayRooms = tab === 'discover' ? rooms : myRooms;

  return {
    tab,
    switchTab,
    displayRooms,
    loading,
    hasMore,
    loadMore,
    // Create modal
    showCreateModal,
    setShowCreateModal,
    createTitle,
    setCreateTitle,
    createDescription,
    setCreateDescription,
    createMaxParticipants,
    setCreateMaxParticipants,
    createIsPrivate,
    setCreateIsPrivate,
    creating,
    handleCreateRoom,
    // Join modal
    showJoinModal,
    setShowJoinModal,
    inviteCode,
    setInviteCode,
    joining,
    handleJoinByCode,
  };
}
