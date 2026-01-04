'use client';

import type { ChallengeCategory } from '@/types/challenge';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  creating: boolean;
  formState: {
    title: string;
    hashtag: string;
    description: string;
    category: ChallengeCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    prize: string;
    endDate: string;
  };
  onFormChange: {
    setTitle: (value: string) => void;
    setHashtag: (value: string) => void;
    setDescription: (value: string) => void;
    setCategory: (value: ChallengeCategory) => void;
    setDifficulty: (value: 'easy' | 'medium' | 'hard') => void;
    setPrize: (value: string) => void;
    setEndDate: (value: string) => void;
  };
}

export function CreateChallengeModal({
  isOpen,
  onClose,
  onCreate,
  creating,
  formState,
  onFormChange,
}: CreateChallengeModalProps) {
  if (!isOpen) return null;

  const { title, hashtag, description, category, difficulty, prize, endDate } = formState;
  const { setTitle, setHashtag, setDescription, setCategory, setDifficulty, setPrize, setEndDate } = onFormChange;
  const isValid = title && hashtag && description && endDate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-heavy rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Create a Challenge</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Challenge Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your challenge a catchy name"
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Hashtag *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">#</span>
              <input
                type="text"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="YourChallengeHashtag"
                className="w-full glass rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what participants should do..."
              rows={3}
              className="w-full glass rounded-xl px-4 py-3 text-white resize-none placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChallengeCategory)}
                className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-transparent"
              >
                <option value="dance" className="bg-gray-900">Dance</option>
                <option value="music" className="bg-gray-900">Music</option>
                <option value="comedy" className="bg-gray-900">Comedy</option>
                <option value="fitness" className="bg-gray-900">Fitness</option>
                <option value="food" className="bg-gray-900">Food</option>
                <option value="art" className="bg-gray-900">Art</option>
                <option value="other" className="bg-gray-900">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-transparent"
              >
                <option value="easy" className="bg-gray-900">Easy</option>
                <option value="medium" className="bg-gray-900">Medium</option>
                <option value="hard" className="bg-gray-900">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">End Date *</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Prize (Optional)</label>
            <input
              type="text"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              placeholder="e.g., 1000 V3 Coins"
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <button
            onClick={onCreate}
            disabled={creating || !isValid}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Challenge'}
          </button>
        </div>
      </div>
    </div>
  );
}
