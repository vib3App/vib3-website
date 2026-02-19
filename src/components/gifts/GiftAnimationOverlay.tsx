'use client';

import { useState, useEffect, useCallback } from 'react';

interface GiftAnimation {
  id: string;
  type: 'rose' | 'star' | 'diamond' | 'crown' | 'heart' | 'fire';
  senderName: string;
  coinValue: number;
  timestamp: number;
}

interface GiftAnimationOverlayProps {
  onGiftReceived?: (handler: (gift: Omit<GiftAnimation, 'id' | 'timestamp'>) => void) => void;
}

const GIFT_CONFIGS: Record<string, { emoji: string; color: string; label: string }> = {
  rose: { emoji: '🌹', color: '#FF69B4', label: 'Rose' },
  star: { emoji: '⭐', color: '#FFD700', label: 'Star' },
  diamond: { emoji: '💎', color: '#00CED1', label: 'Diamond' },
  crown: { emoji: '👑', color: '#FFD700', label: 'Crown' },
  heart: { emoji: '❤️', color: '#FF4444', label: 'Heart' },
  fire: { emoji: '🔥', color: '#FF6B00', label: 'Fire' },
};

const ANIMATION_DURATION = 3000;

/**
 * Gap #66: Gift Animations
 * Shows animated gift effects with CSS keyframes.
 */
export function GiftAnimationOverlay({ onGiftReceived }: GiftAnimationOverlayProps) {
  const [activeGifts, setActiveGifts] = useState<GiftAnimation[]>([]);

  const triggerGift = useCallback((gift: Omit<GiftAnimation, 'id' | 'timestamp'>) => {
    const newGift: GiftAnimation = {
      ...gift,
      id: `gift-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    setActiveGifts(prev => [...prev, newGift]);
    setTimeout(() => {
      setActiveGifts(prev => prev.filter(g => g.id !== newGift.id));
    }, ANIMATION_DURATION);
  }, []);

  useEffect(() => {
    onGiftReceived?.(triggerGift);
  }, [onGiftReceived, triggerGift]);

  if (activeGifts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {activeGifts.map(gift => (
        <GiftEffect key={gift.id} gift={gift} />
      ))}
    </div>
  );
}

function GiftEffect({ gift }: { gift: GiftAnimation }) {
  const config = GIFT_CONFIGS[gift.type] || GIFT_CONFIGS.heart;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="absolute animate-gift-float"
          style={{
            left: `${20 + Math.random() * 60}%`,
            bottom: '-10%',
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${2 + Math.random()}s`,
            fontSize: `${24 + Math.random() * 24}px`,
            opacity: 0.8,
          }}>
          {config.emoji}
        </div>
      ))}

      {/* Center burst */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-gift-burst text-center">
        <div className="text-6xl mb-2 animate-gift-spin">{config.emoji}</div>
        <div className="glass-card rounded-xl px-4 py-2 animate-gift-fade-in">
          <p className="text-white font-bold text-sm">{gift.senderName}</p>
          <p className="text-xs" style={{ color: config.color }}>
            sent a {config.label} ({gift.coinValue} coins)
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes gift-float {
          0% { transform: translateY(0) rotate(0deg) scale(0); opacity: 0; }
          20% { opacity: 1; transform: translateY(-20vh) rotate(15deg) scale(1); }
          100% { transform: translateY(-100vh) rotate(45deg) scale(0.5); opacity: 0; }
        }
        @keyframes gift-burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1); }
          80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
        @keyframes gift-spin {
          0% { transform: rotate(0deg) scale(0); }
          30% { transform: rotate(360deg) scale(1.3); }
          50% { transform: rotate(720deg) scale(1); }
          100% { transform: rotate(720deg) scale(1); }
        }
        @keyframes gift-fade-in {
          0%, 20% { opacity: 0; transform: translateY(10px); }
          40% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-gift-float { animation: gift-float 2.5s ease-out forwards; }
        .animate-gift-burst { animation: gift-burst 3s ease-out forwards; }
        .animate-gift-spin { animation: gift-spin 1.5s ease-out forwards; }
        .animate-gift-fade-in { animation: gift-fade-in 3s ease-out forwards; }
      `}</style>
    </div>
  );
}

/** Helper to trigger gift animation from outside */
export function useGiftAnimation() {
  const [triggerFn, setTriggerFn] = useState<((gift: Omit<GiftAnimation, 'id' | 'timestamp'>) => void) | null>(null);

  const registerHandler = useCallback((handler: (gift: Omit<GiftAnimation, 'id' | 'timestamp'>) => void) => {
    setTriggerFn(() => handler);
  }, []);

  const sendGift = useCallback((type: string, senderName: string, coinValue: number) => {
    triggerFn?.({ type: type as GiftAnimation['type'], senderName, coinValue });
  }, [triggerFn]);

  return { registerHandler, sendGift };
}
