'use client';

import { useState } from 'react';
import type { Geofence } from '@/types/location';

interface GeofencePanelProps {
  geofences: Geofence[];
  onCreateGeofence: (input: { name: string; latitude: number; longitude: number; radius: number; type: 'enter' | 'exit' | 'both' }) => Promise<Geofence>;
  onDeleteGeofence: (id: string) => Promise<void>;
  myLocation: { lat: number; lng: number } | null;
}

export function GeofencePanel({ geofences, onCreateGeofence, onDeleteGeofence, myLocation }: GeofencePanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [radius, setRadius] = useState(200);
  const [type, setType] = useState<'enter' | 'exit' | 'both'>('both');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !myLocation) return;
    setIsCreating(true);
    try {
      await onCreateGeofence({ name, latitude: myLocation.lat, longitude: myLocation.lng, radius, type });
      setName('');
      setRadius(200);
      setType('both');
      setShowForm(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white/50 text-sm font-medium">Geofences ({geofences.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-purple-400 text-sm hover:text-purple-300">
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-3 space-y-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Zone name"
            className="w-full glass text-white text-sm px-3 py-2 rounded-lg outline-none placeholder:text-white/30"
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40 text-xs">Radius</span>
              <span className="text-white text-xs font-mono">{radius}m</span>
            </div>
            <input
              type="range" min="50" max="2000" step="50" value={radius}
              onChange={e => setRadius(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
          </div>
          <div className="flex gap-1">
            {(['enter', 'exit', 'both'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 text-xs rounded-lg transition ${type === t ? 'bg-purple-500 text-white' : 'glass text-white/50'}`}
              >
                {t === 'enter' ? 'Enter' : t === 'exit' ? 'Exit' : 'Both'}
              </button>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={!name || isCreating}
            className="w-full py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Geofence'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {geofences.map(gf => (
          <div key={gf.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{gf.name}</p>
              <p className="text-white/30 text-xs">{gf.radius}m &middot; {gf.type}</p>
            </div>
            <button
              onClick={() => onDeleteGeofence(gf.id)}
              className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {geofences.length === 0 && <p className="text-white/30 text-sm text-center py-4">No geofences set up</p>}
      </div>
    </div>
  );
}
