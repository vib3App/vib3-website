'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { walletApi, searchApi, paymentApi } from '@/services/api';
import {
  CoinsHeroSection,
  CoinPackageGrid,
  EarnCoinsSection,
  TransactionHistory,
  GiftCoinsModal,
} from '@/components/coins';
import type { Wallet, WalletCoinPackage, Transaction } from '@/types/wallet';
import { logger } from '@/utils/logger';

export default function CoinsPage() {
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'buy' | 'earn' | 'history'>('buy');

  // Data states
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [packages, setPackages] = useState<WalletCoinPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Purchase states
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Gift modal states
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
      logger.error('Failed to fetch wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthVerified, fetchData]);

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setPurchaseSuccess(true);
      fetchData();
      window.history.replaceState({}, '', '/coins');
    } else if (urlParams.get('canceled') === 'true') {
      setPurchaseError('Purchase was canceled');
      window.history.replaceState({}, '', '/coins');
    }
  }, [fetchData]);

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
      logger.error('Search failed:', err);
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
      const [updatedWallet, updatedTransactions] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getTransactions(20),
      ]);
      setWallet(updatedWallet);
      setTransactions(updatedTransactions);
      setShowGiftModal(false);
      setGiftUsername('');
      setGiftAmount('');
      setGiftMessage('');
      setSelectedRecipient(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setGiftError(axiosErr.response?.data?.error || 'Failed to send gift');
    } finally {
      setGiftLoading(false);
    }
  };

  const handleBuyPackage = async (pkg: WalletCoinPackage) => {
    setPurchaseLoading(pkg.id);
    setPurchaseError(null);
    try {
      const { url } = await paymentApi.createCheckoutSession(pkg.id);
      if (url) {
        window.location.href = url;
      } else {
        setPurchaseError('Failed to create checkout session');
      }
    } catch (err: unknown) {
      logger.error('Purchase error:', err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setPurchaseError(axiosErr.response?.data?.error || 'Failed to start purchase. Please try again.');
    } finally {
      setPurchaseLoading(null);
    }
  };

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

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
            <button onClick={fetchData} className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
              Retry
            </button>
          </div>
        ) : (
          <>
            <CoinsHeroSection
              wallet={wallet}
              onBuyClick={() => setActiveTab('buy')}
              onGiftClick={() => setShowGiftModal(true)}
              onEarnClick={() => setActiveTab('earn')}
            />

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6">
              {(['buy', 'earn', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium capitalize transition-colors ${
                    activeTab === tab ? 'text-amber-500 border-b-2 border-amber-500' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'buy' && (
                <CoinPackageGrid
                  packages={packages}
                  purchaseLoading={purchaseLoading}
                  purchaseError={purchaseError}
                  purchaseSuccess={purchaseSuccess}
                  onBuyPackage={handleBuyPackage}
                  onClearError={() => setPurchaseError(null)}
                  onClearSuccess={() => setPurchaseSuccess(false)}
                />
              )}
              {activeTab === 'earn' && <EarnCoinsSection />}
              {activeTab === 'history' && <TransactionHistory transactions={transactions} />}
            </div>
          </>
        )}

        <GiftCoinsModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          giftUsername={giftUsername}
          giftAmount={giftAmount}
          giftMessage={giftMessage}
          giftLoading={giftLoading}
          giftError={giftError}
          searchResults={searchResults}
          selectedRecipient={selectedRecipient}
          onSearchUsers={handleSearchUsers}
          onSelectRecipient={handleSelectRecipient}
          onAmountChange={setGiftAmount}
          onMessageChange={setGiftMessage}
          onSendGift={handleSendGift}
        />
      </main>
    </div>
  );
}
