'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { walletApi, searchApi } from '@/services/api';
import type { Wallet, WalletCoinPackage, Transaction } from '@/types/wallet';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function CoinsPage() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'buy' | 'earn' | 'history'>('buy');

  // Data states
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [packages, setPackages] = useState<WalletCoinPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gift modal
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftUsername, setGiftUsername] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; avatar?: string }[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; username: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletData, packagesData, transactionsData] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getPackages(),
        walletApi.getTransactions(20),
      ]);
      setWallet(walletData);
      setPackages(packagesData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchData]);

  // Search users for gifting
  const handleSearchUsers = async (query: string) => {
    setGiftUsername(query);
    setSelectedRecipient(null);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchApi.search(query, { type: 'users' });
      setSearchResults(results.users?.slice(0, 5) || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSelectRecipient = (user: { id: string; username: string }) => {
    setSelectedRecipient(user);
    setGiftUsername(user.username);
    setSearchResults([]);
  };

  const handleSendGift = async () => {
    if (!selectedRecipient || !giftAmount) return;

    const amount = parseInt(giftAmount);
    if (isNaN(amount) || amount <= 0) {
      setGiftError('Please enter a valid amount');
      return;
    }

    if (wallet && amount > wallet.coins) {
      setGiftError('Insufficient coins');
      return;
    }

    setGiftLoading(true);
    setGiftError(null);

    try {
      await walletApi.sendGift(selectedRecipient.id, amount, giftMessage || undefined);
      // Refresh wallet data
      const updatedWallet = await walletApi.getWallet();
      setWallet(updatedWallet);
      const updatedTransactions = await walletApi.getTransactions(20);
      setTransactions(updatedTransactions);
      // Reset and close modal
      setShowGiftModal(false);
      setGiftUsername('');
      setGiftAmount('');
      setGiftMessage('');
      setSelectedRecipient(null);
    } catch (err: any) {
      setGiftError(err.response?.data?.error || 'Failed to send gift');
    } finally {
      setGiftLoading(false);
    }
  };

  const handleBuyPackage = (pkg: WalletCoinPackage) => {
    // For web, redirect to payment or show payment modal
    // This would integrate with Stripe for web purchases
    alert(`Web purchases coming soon! Package: ${pkg.coins} coins for $${pkg.price}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg">
        <TopNav />
        <main className="pt-20 md:pt-16 pb-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your coins</h2>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold hover:opacity-90 transition"
            >
              Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        {/* Header with Back Button */}
        <header className="sticky top-16 z-40 glass-heavy mx-4 mt-3 rounded-2xl mb-4">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white">VIB3 Coins</h1>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 px-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/60 via-orange-500/60 to-yellow-500/60 backdrop-blur-3xl" />

              <div className="relative px-6 py-12 md:py-20 text-center text-white">
                <div className="text-6xl mb-4">V3</div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">VIB3 Coins</h1>
                <p className="text-xl text-white/90 mb-8">Your virtual currency for the VIB3 ecosystem</p>

                {/* Balance Cards */}
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
                  <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                      {wallet?.coins.toLocaleString() || 0}
                    </div>
                    <div className="text-white/70">Your VIB3 Coins</div>
                  </div>
                  <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
                    <div className="text-4xl font-bold text-white">
                      ${((wallet?.coins || 0) * 0.01).toFixed(2)}
                    </div>
                    <div className="text-white/70">USD Value</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab('buy')}
                    className="bg-white text-amber-600 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
                  >
                    Buy Coins
                  </button>
                  <button
                    onClick={() => setShowGiftModal(true)}
                    className="bg-white/20 text-white font-semibold px-8 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-colors"
                  >
                    Gift Coins
                  </button>
                  <button
                    onClick={() => setActiveTab('earn')}
                    className="bg-white/20 text-white font-semibold px-8 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-colors"
                  >
                    Earn Coins
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6">
              {(['buy', 'earn', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-amber-500 border-b-2 border-amber-500'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'buy' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg) => {
                    const isPopular = pkg.id === 'coins_1000';
                    return (
                      <div
                        key={pkg.id}
                        className={`relative glass-card p-6 transition-all hover:scale-105 cursor-pointer ${
                          isPopular
                            ? 'border-amber-500 ring-2 ring-amber-500/20'
                            : 'hover:border-amber-500/30'
                        }`}
                        onClick={() => handleBuyPackage(pkg)}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            MOST POPULAR
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-4xl mb-2">V3</div>
                          <div className="text-3xl font-bold text-white mb-1">
                            {pkg.coins.toLocaleString()}
                          </div>
                          {pkg.bonus > 0 && (
                            <div className="text-green-400 text-sm mb-2">
                              +{pkg.bonus.toLocaleString()} bonus coins!
                            </div>
                          )}
                          <div className="text-white/50 mb-4">VIB3 Coins</div>
                          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
                            ${pkg.price.toFixed(2)}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'earn' && (
                <div className="space-y-4">
                  <div className="glass-card p-6 hover:border-pink-500/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl">
                        📹
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">Create Viral Content</h3>
                        <p className="text-white/50">Earn up to 1000 coins per viral video</p>
                      </div>
                      <div className="ml-auto px-3 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-full">+1000</div>
                    </div>
                  </div>

                  <div className="glass-card p-6 hover:border-cyan-500/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                        👥
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">Invite Friends</h3>
                        <p className="text-white/50">Get 50 coins for each friend who joins</p>
                      </div>
                      <div className="ml-auto px-3 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-full">+50</div>
                    </div>
                  </div>

                  <div className="glass-card p-6 hover:border-green-500/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                        ✅
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">Daily Check-in</h3>
                        <p className="text-white/50">Earn 5-25 coins daily just for opening the app</p>
                      </div>
                      <div className="ml-auto px-3 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-full">+5-25</div>
                    </div>
                  </div>

                  <div className="glass-card p-6 hover:border-amber-500/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl">
                        🏆
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">Complete Challenges</h3>
                        <p className="text-white/50">Participate in weekly challenges for coins</p>
                      </div>
                      <div className="ml-auto px-3 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-full">+100-500</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-white/50">
                      No transactions yet. Buy or earn coins to get started!
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx._id}
                        className="glass-card p-4 flex items-center gap-4"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.amount > 0
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {tx.amount > 0 ? '+' : '-'}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{tx.description}</p>
                          <p className="text-white/50 text-sm">{formatDate(tx.createdAt)}</p>
                        </div>
                        <div
                          className={`font-bold ${
                            tx.amount > 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {tx.amount > 0 ? '+' : ''}{tx.amount} V3
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Gift Modal */}
        {showGiftModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowGiftModal(false)}
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
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Search for a user..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 rounded-xl overflow-hidden z-10 border border-white/10">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectRecipient(user)}
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
                onChange={(e) => setGiftAmount(e.target.value)}
                placeholder="Amount of coins..."
                min="1"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-amber-500"
              />

              <input
                type="text"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Add a message (optional)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-amber-500"
              />

              {giftError && (
                <p className="text-red-400 text-sm mb-4">{giftError}</p>
              )}

              <button
                onClick={handleSendGift}
                disabled={!selectedRecipient || !giftAmount || giftLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
              >
                {giftLoading ? 'Sending...' : 'Send Gift'}
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
