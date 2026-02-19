'use client';

import { useState, useEffect, useRef } from 'react';
import { websocketService } from '@/services/websocket';

interface LiveLocationMessageProps {
  /** Initial lat/lng from the message */
  lat: number;
  lng: number;
  /** Duration in minutes that sharing was set for */
  duration: number;
  /** When sharing started (ISO string) */
  startedAt: string;
  /** Sender info */
  senderUsername: string;
  senderId: string;
  /** Conversation ID for receiving live updates */
  conversationId: string;
  isOwn: boolean;
}

/**
 * Gap #53: Live Location Sharing in DMs
 * Shows a live map in a message bubble that updates in real-time.
 * Listens for WebSocket location updates for active live location messages.
 */
export function LiveLocationMessage({
  lat: initialLat, lng: initialLng, duration, startedAt,
  senderUsername, senderId, conversationId, isOwn,
}: LiveLocationMessageProps) {
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const expiresAtRef = useRef(new Date(startedAt).getTime() + duration * 60000);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const remaining = expiresAtRef.current - Date.now();
      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        return;
      }
      const mins = Math.ceil(remaining / 60000);
      setTimeRemaining(
        mins > 60
          ? `${Math.floor(mins / 60)}h ${mins % 60}m remaining`
          : `${mins}m remaining`
      );
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for live location updates from the sender
  useEffect(() => {
    if (isExpired) return;

    const unsub = websocketService.on('location:share', (data: {
      conversationId?: string; senderId?: string;
      lat?: number; lng?: number; timestamp?: number;
    }) => {
      if (data.conversationId !== conversationId) return;
      if (data.senderId !== senderId) return;
      if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        setCurrentLat(data.lat);
        setCurrentLng(data.lng);
      }
    });

    return unsub;
  }, [conversationId, senderId, isExpired]);

  const mapUrl = `https://maps.google.com/maps?q=${currentLat},${currentLng}&z=15&output=embed`;
  const openMapUrl = `https://maps.google.com/?q=${currentLat},${currentLng}`;

  return (
    <div className={`rounded-2xl overflow-hidden max-w-[280px] ${isOwn ? 'bg-purple-500/20' : 'glass'}`}>
      {/* Map embed */}
      <div className="relative w-full h-[160px] bg-white/5">
        {!isExpired ? (
          <iframe
            src={mapUrl}
            className="w-full h-full border-0"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Live Location"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/30 text-sm">Location sharing ended</span>
          </div>
        )}

        {/* Live indicator */}
        {!isExpired && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-teal-500/80 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-white text-[10px] font-bold">LIVE</span>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="px-3 py-2 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white text-xs font-medium">
              {isOwn ? 'Your live location' : `${senderUsername}'s live location`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs ${isExpired ? 'text-white/30' : 'text-teal-400/60'}`}>
            {timeRemaining}
          </span>
          <a
            href={openMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 text-xs hover:text-teal-300 underline"
          >
            Open Map
          </a>
        </div>
      </div>
    </div>
  );
}
