'use client';

interface SearchResult {
  id: string;
  username: string;
  avatar?: string;
}

interface GiftCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftUsername: string;
  giftAmount: string;
  giftMessage: string;
  giftLoading: boolean;
  giftError: string | null;
  searchResults: SearchResult[];
  selectedRecipient: { id: string; username: string } | null;
  onSearchUsers: (query: string) => void;
  onSelectRecipient: (user: { id: string; username: string }) => void;
  onAmountChange: (amount: string) => void;
  onMessageChange: (message: string) => void;
  onSendGift: () => void;
}

export function GiftCoinsModal({
  isOpen,
  onClose,
  giftUsername,
  giftAmount,
  giftMessage,
  giftLoading,
  giftError,
  searchResults,
  selectedRecipient,
  onSearchUsers,
  onSelectRecipient,
  onAmountChange,
  onMessageChange,
  onSendGift,
}: GiftCoinsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="glass-card p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Gift Coins</h2>

        {/* User Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={giftUsername}
            onChange={(e) => onSearchUsers(e.target.value)}
            placeholder="Search for a user..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 rounded-xl overflow-hidden z-10 border border-white/10">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onSelectRecipient(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <span className="text-white">@{user.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedRecipient && (
          <div className="mb-4 p-3 bg-amber-500/20 rounded-xl flex items-center gap-2">
            <span className="text-amber-400">Sending to:</span>
            <span className="text-white font-semibold">@{selectedRecipient.username}</span>
          </div>
        )}

        <input
          type="number"
          value={giftAmount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Amount of coins..."
          min="1"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-amber-500"
        />

        <input
          type="text"
          value={giftMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Add a message (optional)..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-amber-500"
        />

        {giftError && (
          <p className="text-red-400 text-sm mb-4">{giftError}</p>
        )}

        <button
          onClick={onSendGift}
          disabled={!selectedRecipient || !giftAmount || giftLoading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {giftLoading ? 'Sending...' : 'Send Gift'}
        </button>
      </div>
    </div>
  );
}
