'use client';

import { useState } from 'react';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string, memberIds: string[]) => Promise<void>;
}

const PRESET_COLORS = [
  '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
];

export function CreateCircleModal({ isOpen, onClose, onCreate }: CreateCircleModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers(prev => [...prev, trimmed]);
      setMemberInput('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      await onCreate(name.trim(), color, members);
      setName('');
      setColor(PRESET_COLORS[0]);
      setMembers([]);
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Create Circle</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Circle name"
              className="w-full bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50"
            />
            <div>
              <label className="text-white/50 text-sm mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full transition ring-2 ${color === c ? 'ring-white scale-110' : 'ring-transparent hover:ring-white/30'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">Members</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={memberInput}
                  onChange={e => setMemberInput(e.target.value)}
                  placeholder="Enter user ID"
                  className="flex-1 bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-2 outline-none border border-white/10 focus:border-purple-500/50 text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                />
                <button onClick={handleAddMember} className="px-3 py-2 glass text-white/70 rounded-xl hover:bg-white/10 text-sm">Add</button>
              </div>
              {members.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {members.map(m => (
                    <span key={m} className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-white text-xs">
                      {m}
                      <button onClick={() => setMembers(prev => prev.filter(x => x !== m))} className="text-white/50 hover:text-white ml-1">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 glass text-white/70 rounded-xl hover:bg-white/10 transition">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || isCreating}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
