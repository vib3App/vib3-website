'use client';

import { useState } from 'react';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

const colors = ['#a855f7', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export function CreateCircleModal({ isOpen, onClose, onCreate }: CreateCircleModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(colors[0]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color);
    setName('');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-6 max-w-sm w-full">
          <h2 className="text-lg font-bold text-white mb-4">Create Circle</h2>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Circle name"
            className="w-full bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50 mb-4"
          />
          <div className="mb-4">
            <p className="text-white/50 text-sm mb-2">Color</p>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 glass text-white/70 rounded-xl hover:bg-white/10 transition">Cancel</button>
            <button onClick={handleCreate} disabled={!name.trim()} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium rounded-xl disabled:opacity-50">Create</button>
          </div>
        </div>
      </div>
    </>
  );
}
