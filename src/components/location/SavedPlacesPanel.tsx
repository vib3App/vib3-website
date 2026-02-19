'use client';

import { useState } from 'react';
import type { SavedPlace } from '@/types/location';

interface SavedPlacesPanelProps {
  places: SavedPlace[];
  onSavePlace: (input: { name: string; address: string; latitude: number; longitude: number; category?: string }) => Promise<SavedPlace>;
  onDeletePlace: (id: string) => Promise<void>;
  myLocation: { lat: number; lng: number } | null;
}

const categories = ['Home', 'Work', 'Gym', 'Restaurant', 'Shopping', 'Other'];

export function SavedPlacesPanel({ places, onSavePlace, onDeletePlace, myLocation }: SavedPlacesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Other');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !address || !myLocation) return;
    setIsSaving(true);
    try {
      await onSavePlace({ name, address, latitude: myLocation.lat, longitude: myLocation.lng, category });
      setName('');
      setAddress('');
      setCategory('Other');
      setShowForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white/50 text-sm font-medium">Saved Places ({places.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-purple-400 text-sm hover:text-purple-300">
          {showForm ? 'Cancel' : '+ Save'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-3 space-y-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Place name"
            className="w-full glass text-white text-sm px-3 py-2 rounded-lg outline-none placeholder:text-white/30"
          />
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full glass text-white text-sm px-3 py-2 rounded-lg outline-none placeholder:text-white/30"
          />
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-1 text-xs rounded-full transition ${category === cat ? 'bg-purple-500 text-white' : 'glass text-white/50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={!name || !address || isSaving}
            className="w-full py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Place'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {places.map(place => (
          <div key={place.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{place.name}</p>
              <p className="text-white/30 text-xs truncate">{place.address} {place.category && `· ${place.category}`}</p>
            </div>
            <button
              onClick={() => onDeletePlace(place.id)}
              className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {places.length === 0 && <p className="text-white/30 text-sm text-center py-4">No saved places</p>}
      </div>
    </div>
  );
}
