'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '@/services/websocket';

/**
 * Gap #39: Gift Animation Overlay
 *
 * Listens for WebSocket `gift_sent` events.
 * Shows animated gift icon floating up with sender name.
 * Queues multiple gifts sequentially.
 */

interface GiftEvent {
  id: string;
  senderName: string;
  giftName: string;
  giftIcon: string;
  value: number;
}

const GIFT_ICONS: Record<string, string> = {
  Rose: '🌹',
  Star: '⭐',
  Diamond: '💎',
  Crown: '👑',
  Heart: '❤️',
  Fire: '🔥',
  Rocket: '🚀',
  Rainbow: '🌈',
};

interface GiftAnimationOverlayProps {
  streamId: string;
}

export function GiftAnimationOverlay({ streamId }: GiftAnimationOverlayProps) {
  const [activeGifts, setActiveGifts] = useState<GiftEvent[]>([]);
  const counterRef = useRef(0);

  const addGift = useCallback((gift: Omit<GiftEvent, 'id'>) => {
    counterRef.current += 1;
    const id = `gift-anim-${counterRef.current}`;
    const newGift = { ...gift, id };
    setActiveGifts((prev) => [...prev, newGift]);

    // Remove after animation (3 seconds)
    setTimeout(() => {
      setActiveGifts((prev) => prev.filter((g) => g.id !== id));
    }, 3000);
  }, []);

  // Listen to gift events via WebSocket
  useEffect(() => {
    const unsub = websocketService.on('gift_sent', (data: {
      streamId: string;
      senderName: string;
      giftName: string;
      giftIcon?: string;
      giftValue?: number;
    }) => {
      if (data.streamId !== streamId) return;
      addGift({
        senderName: data.senderName,
        giftName: data.giftName,
        giftIcon: data.giftIcon || GIFT_ICONS[data.giftName] || '🎁',
        value: data.giftValue || 0,
      });
    });

    return unsub;
  }, [streamId, addGift]);

  if (activeGifts.length === 0) return null;

  return (
    <div className="absolute left-4 bottom-32 z-30 pointer-events-none space-y-2">
      {activeGifts.map((gift) => (
        <div
          key={gift.id}
          className="flex items-center gap-2 glass px-3 py-2 rounded-2xl animate-gift-float"
        >
          <span className="text-2xl">{gift.giftIcon}</span>
          <div>
            <p className="text-white text-xs font-medium">
              <span className="text-purple-300">@{gift.senderName}</span>
            </p>
            <p className="text-white/60 text-[10px]">
              sent {gift.giftName}
            </p>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes gift-float {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          15% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: 1; transform: translateY(-30px) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
        }
        .animate-gift-float {
          animation: gift-float 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
