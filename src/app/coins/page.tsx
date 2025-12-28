'use client';

import { useState } from 'react';
import { SideNav } from '@/components/ui/SideNav';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuthStore } from '@/stores/authStore';

const coinPackages = [
  { id: 1, coins: 100, price: 0.99, popular: false },
  { id: 2, coins: 500, price: 4.99, popular: false },
  { id: 3, coins: 1000, price: 9.99, popular: true, bonus: 50 },
  { id: 4, coins: 2500, price: 19.99, popular: false, bonus: 150 },
  { id: 5, coins: 5000, price: 39.99, popular: false, bonus: 500 },
  { id: 6, coins: 10000, price: 74.99, popular: false, bonus: 1500 },
];

const recentTransactions = [
  { id: 1, type: 'received', amount: 50, from: '@musicstar', date: '2 hours ago' },
  { id: 2, type: 'sent', amount: 25, to: '@dancer99', date: '5 hours ago' },
  { id: 3, type: 'earned', amount: 100, reason: 'Video went viral', date: '1 day ago' },
  { id: 4, type: 'purchased', amount: 1000, price: '$9.99', date: '3 days ago' },
];

export default function CoinsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'buy' | 'earn' | 'history'>('buy');
  const [coinBalance] = useState(3247);
  const [showGiftModal, setShowGiftModal] = useState(false);

  return (
    <div className="flex min-h-screen aurora-bg">
      <SideNav />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/60 via-orange-500/60 to-yellow-500/60 backdrop-blur-3xl" />

          {/* Animated scrolling text */}
          <div className="absolute top-4 left-0 w-[200%] text-white/20 text-sm whitespace-nowrap animate-scroll">
            VIB3 Coins - Support your favorite creators - Unlock exclusive content - VIB3 Coins - Support your favorite creators - Unlock exclusive content -
          </div>

          <div className="relative px-6 py-12 md:py-20 text-center text-white">
            <div className="text-6xl mb-4">V3</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">VIB3 Coins</h1>
            <p className="text-xl text-white/90 mb-8">Your virtual currency for the VIB3 ecosystem</p>

            {/* Balance Cards - Glass */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
              <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">{coinBalance.toLocaleString()}</div>
                <div className="text-white/70">Your VIB3 Coins</div>
              </div>
              <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
                <div className="text-4xl font-bold text-white">${(coinBalance * 0.01).toFixed(2)}</div>
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
              {coinPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative glass-card p-6 transition-all hover:scale-105 cursor-pointer ${
                    pkg.popular
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'hover:border-amber-500/30'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-4xl mb-2">V3</div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {pkg.coins.toLocaleString()}
                    </div>
                    {pkg.bonus && (
                      <div className="text-green-400 text-sm mb-2">
                        +{pkg.bonus} bonus coins!
                      </div>
                    )}
                    <div className="text-white/50 mb-4">VIB3 Coins</div>
                    <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
                      ${pkg.price}
                    </button>
                  </div>
                </div>
              ))}
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
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-neutral-900 rounded-xl p-4 flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'received' || tx.type === 'earned'
                        ? 'bg-green-500/20 text-green-500'
                        : tx.type === 'sent'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    {tx.type === 'received' || tx.type === 'earned' ? '+' : '-'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {tx.type === 'received' && `Received from ${tx.from}`}
                      {tx.type === 'sent' && `Sent to ${tx.to}`}
                      {tx.type === 'earned' && tx.reason}
                      {tx.type === 'purchased' && `Purchased for ${tx.price}`}
                    </p>
                    <p className="text-white/50 text-sm">{tx.date}</p>
                  </div>
                  <div
                    className={`font-bold ${
                      tx.type === 'received' || tx.type === 'earned' || tx.type === 'purchased'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {tx.type === 'sent' ? '-' : '+'}
                    {tx.amount} V3
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gift Modal */}
        {showGiftModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowGiftModal(false)}
          >
            <div
              className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Gift Coins</h2>
              <input
                type="text"
                placeholder="Enter username..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4"
              />
              <input
                type="number"
                placeholder="Amount of coins..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4"
              />
              <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl">
                Send Gift
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />

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
