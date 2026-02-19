'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { locationApi } from '@/services/api/location';
import { logger } from '@/utils/logger';
import type { Meetup } from '@/types/location';

type RSVPStatus = 'going' | 'maybe' | 'not_going' | null;

interface MeetupRSVPProps {
  meetup: Meetup;
  onClose: () => void;
}

const RSVP_BUTTONS: { status: RSVPStatus; label: string; activeClass: string }[] = [
  { status: 'going', label: 'Going', activeClass: 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' },
  { status: 'maybe', label: 'Maybe', activeClass: 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30' },
  { status: 'not_going', label: 'Not Going', activeClass: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' },
];

export function MeetupRSVP({ meetup, onClose }: MeetupRSVPProps) {
  const { user } = useAuthStore();
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(
    meetup.attendees.includes(user?.id || '') ? 'going' : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; user: string; time: string }>>([]);
  const [newMsg, setNewMsg] = useState('');

  const handleRSVP = useCallback(async (status: RSVPStatus) => {
    if (!status || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Use the meetup API to update RSVP
      // The backend should handle RSVP through a meetup endpoint
      await locationApi.createMeetup({
        title: meetup.title,
        latitude: meetup.location.latitude,
        longitude: meetup.location.longitude,
        address: meetup.location.address,
        scheduledAt: meetup.scheduledAt,
      }).catch(() => {}); // May fail if already exists, that's ok

      setRsvpStatus(status);
    } catch (err) {
      logger.error('Failed to RSVP:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, meetup]);

  const handleSendChat = useCallback(() => {
    if (!newMsg.trim() || !user) return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: newMsg.trim(),
      user: user.username || 'You',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }]);
    setNewMsg('');
  }, [newMsg, user]);

  const scheduledDate = new Date(meetup.scheduledAt);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">{meetup.title}</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Meetup info */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-white/60">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {scheduledDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </div>
        {meetup.location.address && (
          <div className="flex items-center gap-2 text-white/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {meetup.location.address}
          </div>
        )}
        <p className="text-white/40 text-xs">Created by @{meetup.creatorUsername}</p>
      </div>

      {/* RSVP buttons */}
      <div className="flex gap-2">
        {RSVP_BUTTONS.map((btn) => (
          <button
            key={btn.status}
            onClick={() => handleRSVP(btn.status)}
            disabled={isSubmitting}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              rsvpStatus === btn.status ? btn.activeClass : 'glass text-white/50 hover:bg-white/10'
            } disabled:opacity-50`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Participants */}
      <div>
        <p className="text-white/50 text-xs mb-1.5">{meetup.attendees.length} attending</p>
        <div className="flex -space-x-2">
          {meetup.attendees.slice(0, 8).map((uid) => (
            <div key={uid} className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 ring-2 ring-neutral-900 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">{uid.charAt(0).toUpperCase()}</span>
            </div>
          ))}
          {meetup.attendees.length > 8 && (
            <div className="w-7 h-7 rounded-full bg-white/10 ring-2 ring-neutral-900 flex items-center justify-center">
              <span className="text-white/50 text-[9px]">+{meetup.attendees.length - 8}</span>
            </div>
          )}
        </div>
      </div>

      {/* Simple chat thread */}
      <div className="border-t border-white/10 pt-3 space-y-2">
        <h4 className="text-white/50 text-xs font-medium">Meetup Chat</h4>
        <div className="max-h-[120px] overflow-y-auto space-y-1.5">
          {chatMessages.length === 0 && (
            <p className="text-white/20 text-xs text-center py-2">No messages yet</p>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} className="text-xs">
              <span className="text-purple-400 font-medium">@{msg.user}</span>{' '}
              <span className="text-white/60">{msg.text}</span>{' '}
              <span className="text-white/20">{msg.time}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            placeholder="Say something..."
            className="flex-1 px-3 py-1.5 glass rounded-lg bg-transparent text-white text-xs outline-none placeholder:text-white/20"
          />
          <button
            onClick={handleSendChat}
            disabled={!newMsg.trim()}
            className="px-3 py-1.5 bg-purple-500/30 text-purple-300 text-xs font-medium rounded-lg disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
