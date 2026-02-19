'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { liveApi } from '@/services/api';
import type { LiveGift } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Gap #39: Live Gift Panel
 *
 * Gift selection grid with coin amounts.
 * Sends gift via POST /api/live/{streamId}/gift.
 * Checks user's coin balance before sending.
 */

const GIFT_EMOJIS: Record<string, string> = {
  Rose: '🌹',
  Star: '⭐',
  Diamond: '💎',
  Crown: '👑',
  Heart: '❤️',
  Fire: '🔥',
  Rocket: '🚀',
  Rainbow: '🌈',
};

interface LiveGiftPanelProps {
  streamId: string;
  isOpen: boolean;
  onClose: () => void;
  userCoinBalance?: number;
}

export function LiveGiftPanel({
  streamId,
  isOpen,
  onClose,
  userCoinBalance = 0,
}: LiveGiftPanelProps) {
  const [gifts, setGifts] = useState<LiveGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const loadGifts = async () => {
      try {
        const data = await liveApi.getGifts();
        setGifts(data);
      } catch (err) {
        logger.error('Failed to load gifts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGifts();
  }, [isOpen]);

  const handleSendGift = useCallback(async (gift: LiveGift) => {
    if (userCoinBalance < gift.coinValue) {
      setError('Not enough coins!');
      setTimeout(() => setError(null), 2000);
      return;
    }

    setSending(gift.id);
    setError(null);
    try {
      await liveApi.sendGift(streamId, gift.id, 1);
      setSending(null);
    } catch (err) {
      logger.error('Failed to send gift:', err);
      setError('Failed to send gift');
      setTimeout(() => setError(null), 2000);
      setSending(null);
    }
  }, [streamId, userCoinBalance]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-gray-900 rounded-t-3xl lg:rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Send a Gift</h3>
            <p className="text-yellow-400 text-xs mt-0.5">
              Balance: {userCoinBalance} coins
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Gift grid */}
        <div className="p-4 grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-3 animate-pulse">
                <div className="w-12 h-12 bg-white/10 rounded-xl" />
                <div className="h-3 w-10 bg-white/10 rounded" />
              </div>
            ))
          ) : (
            gifts.map((gift) => {
              const emoji = GIFT_EMOJIS[gift.name] || '🎁';
              const canAfford = userCoinBalance >= gift.coinValue;
              return (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  disabled={sending === gift.id || !canAfford}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${
                    sending === gift.id
                      ? 'bg-pink-500/20 scale-95'
                      : canAfford
                        ? 'hover:bg-white/10'
                        : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  {gift.iconUrl ? (
                    <img src={gift.iconUrl} alt={gift.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <span className="text-3xl">{emoji}</span>
                  )}
                  <span className="text-white text-xs font-medium">{gift.name}</span>
                  <span className="text-yellow-400 text-[10px]">{gift.coinValue} coins</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
