'use client';

import { useState } from 'react';
import type { Meetup } from '@/types/location';

interface MeetupPanelProps {
  meetups: Meetup[];
  onCreateMeetup: (input: { title: string; latitude: number; longitude: number; address?: string; scheduledAt: string }) => Promise<Meetup>;
  onDeleteMeetup: (meetupId: string) => Promise<void>;
  myLocation: { lat: number; lng: number } | null;
}

export function MeetupPanel({ meetups, onCreateMeetup, onDeleteMeetup, myLocation }: MeetupPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title || !date || !time || !myLocation) return;
    setIsCreating(true);
    try {
      await onCreateMeetup({
        title,
        latitude: myLocation.lat,
        longitude: myLocation.lng,
        address: address || undefined,
        scheduledAt: new Date(`${date}T${time}`).toISOString(),
      });
      setTitle('');
      setAddress('');
      setDate('');
      setTime('');
      setShowForm(false);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white/50 text-sm font-medium">Meetups ({meetups.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-purple-400 text-sm hover:text-purple-300">
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-3 space-y-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Meetup title"
            className="w-full glass text-white text-sm px-3 py-2 rounded-lg outline-none placeholder:text-white/30"
          />
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Address (optional)"
            className="w-full glass text-white text-sm px-3 py-2 rounded-lg outline-none placeholder:text-white/30"
          />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="glass text-white text-sm px-3 py-2 rounded-lg outline-none" />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="glass text-white text-sm px-3 py-2 rounded-lg outline-none" />
          </div>
          <button
            onClick={handleCreate}
            disabled={!title || !date || !time || isCreating}
            className="w-full py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Meetup'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {meetups.map(meetup => (
          <div key={meetup.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{meetup.title}</p>
              <p className="text-white/30 text-xs">{formatDate(meetup.scheduledAt)} &middot; {meetup.attendees.length} going</p>
            </div>
            <button
              onClick={() => onDeleteMeetup(meetup.id)}
              className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {meetups.length === 0 && <p className="text-white/30 text-sm text-center py-4">No meetups planned</p>}
      </div>
    </div>
  );
}
