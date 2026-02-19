'use client';

import { useReducer, useCallback, useEffect } from 'react';
import { GiftAnimation } from './GiftAnimation';
import { websocketService } from '@/services/websocket';

interface QueuedGift {
  id: string;
  giftName: string;
  giftIcon: string;
  senderName: string;
  value: number;
}

interface GiftState {
  queue: QueuedGift[];
  current: QueuedGift | null;
}

type GiftAction =
  | { type: 'enqueue'; gift: QueuedGift }
  | { type: 'complete' };

function giftReducer(state: GiftState, action: GiftAction): GiftState {
  switch (action.type) {
    case 'enqueue': {
      if (state.current) {
        return { ...state, queue: [...state.queue, action.gift] };
      }
      return { ...state, current: action.gift };
    }
    case 'complete': {
      const [next, ...rest] = state.queue;
      return { current: next || null, queue: rest };
    }
  }
}

interface GiftAnimationQueueProps {
  streamId: string;
}

export function GiftAnimationQueue({ streamId }: GiftAnimationQueueProps) {
  const [{ current }, dispatch] = useReducer(giftReducer, { queue: [], current: null });

  useEffect(() => {
    const unsub = websocketService.onGiftReceived((data: { streamId: string; gift: QueuedGift }) => {
      if (data.streamId === streamId) {
        dispatch({ type: 'enqueue', gift: data.gift });
      }
    });
    return unsub;
  }, [streamId]);

  const handleComplete = useCallback(() => {
    dispatch({ type: 'complete' });
  }, []);

  if (!current) return null;

  return (
    <div className="absolute top-32 left-4 z-30">
      <GiftAnimation
        key={current.id}
        giftName={current.giftName}
        giftIcon={current.giftIcon}
        senderName={current.senderName}
        value={current.value}
        onComplete={handleComplete}
      />
    </div>
  );
}
