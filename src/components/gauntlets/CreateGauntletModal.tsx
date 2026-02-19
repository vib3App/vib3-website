'use client';

import { useState } from 'react';
import type { CreateGauntletInput, GauntletCategory } from '@/types/gauntlet';

interface CreateGauntletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateGauntletInput) => void;
}

const categories: { id: GauntletCategory; label: string }[] = [
  { id: 'dance', label: 'Dance' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'music', label: 'Music' },
  { id: 'art', label: 'Art' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'general', label: 'General' },
];

export function CreateGauntletModal({ isOpen, onClose, onCreate }: CreateGauntletModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GauntletCategory>('general');
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [prize, setPrize] = useState('');
  const [startsAt, setStartsAt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim() || !startsAt) return;
    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      maxParticipants,
      prizeDescription: prize.trim() || undefined,
      startsAt,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Create Gauntlet</h2>
          <div className="space-y-4">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Gauntlet title" className="w-full bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50 resize-none" />
            <div>
              <label className="text-white/50 text-sm mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 text-sm rounded-full transition ${category === c.id ? 'bg-purple-500 text-white' : 'glass text-white/60 hover:text-white'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">Max Participants</label>
              <select value={maxParticipants} onChange={e => setMaxParticipants(Number(e.target.value))} className="w-full bg-white/5 text-white rounded-xl px-4 py-3 outline-none border border-white/10">
                {[8, 16, 32, 64].map(n => <option key={n} value={n} className="bg-neutral-900">{n}</option>)}
              </select>
            </div>
            <input type="text" value={prize} onChange={e => setPrize(e.target.value)} placeholder="Prize description (optional)" className="w-full bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50" />
            <div>
              <label className="text-white/50 text-sm mb-2 block">Start Date</label>
              <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="w-full bg-white/5 text-white rounded-xl px-4 py-3 outline-none border border-white/10" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 glass text-white/70 rounded-xl hover:bg-white/10 transition">Cancel</button>
              <button onClick={handleSubmit} disabled={!title.trim() || !startsAt} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
