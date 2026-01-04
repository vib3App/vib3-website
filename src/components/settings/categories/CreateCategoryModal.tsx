'use client';

interface CreateCategoryModalProps {
  isOpen: boolean;
  name: string;
  error: string | null;
  isCreating: boolean;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export function CreateCategoryModal({
  isOpen,
  name,
  error,
  isCreating,
  onNameChange,
  onClose,
  onCreate,
}: CreateCategoryModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Create Category</h2>

          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Category name"
            maxLength={30}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 mb-2"
            autoFocus
          />
          <div className="flex justify-between text-xs text-white/40 mb-4">
            <span>{error && <span className="text-red-400">{error}</span>}</span>
            <span>{name.length}/30</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={isCreating || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
