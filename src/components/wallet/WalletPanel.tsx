'use client';

import { useState, useEffect, useCallback } from 'react';
import { walletApi } from '@/services/api/wallet';
import type { Wallet, Transaction } from '@/types/wallet';
import { logger } from '@/utils/logger';

type FilterType = 'all' | 'purchase' | 'spend' | 'gift' | 'earned';

/**
 * Gap #71: Wallet/Balance UI
 * Current coin balance, transaction history with filters.
 */
export function WalletPanel() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [walletData, txData] = await Promise.all([
        walletApi.getWallet().catch(() => null),
        walletApi.getTransactions(50, 0).catch(() => []),
      ]);
      setWallet(walletData);
      setTransactions(txData);
    } catch (err) {
      logger.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTx = filter === 'all'
    ? transactions
    : transactions.filter(tx => {
      if (filter === 'earned') return tx.type === 'earned' || tx.type === 'gift_received' || tx.type === 'bonus';
      if (filter === 'gift') return tx.type === 'gift' || tx.type === 'gift_received';
      return tx.type === filter;
    });

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'purchase', label: 'Purchased' },
    { id: 'spend', label: 'Spent' },
    { id: 'gift', label: 'Gifts' },
    { id: 'earned', label: 'Earned' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-purple-500/30 rounded-2xl p-6">
        <p className="text-white/50 text-sm mb-1">Coin Balance</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">💰</span>
          <span className="text-4xl font-bold text-white">{(wallet?.coins || 0).toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
          <div>
            <span className="text-white/40 text-xs">Total Purchased</span>
            <p className="text-white font-medium">{(wallet?.totalPurchased || 0).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-white/40 text-xs">Total Spent</span>
            <p className="text-white font-medium">{(wallet?.totalSpent || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
              filter === f.id ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        {filteredTx.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-8">No transactions found</p>
        ) : (
          filteredTx.map(tx => (
            <TransactionRow key={tx._id} transaction={tx} />
          ))
        )}
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncoming = ['purchase', 'gift_received', 'earned', 'bonus', 'refund'].includes(transaction.type);
  const icon = getTransactionIcon(transaction.type);
  const label = getTransactionLabel(transaction);

  return (
    <div className="flex items-center gap-3 p-3 glass rounded-xl">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
        isIncoming ? 'bg-green-500/10' : 'bg-red-500/10'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{label}</p>
        <p className="text-white/30 text-xs">
          {new Date(transaction.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className={`font-bold text-sm ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
        {isIncoming ? '+' : '-'}{transaction.amount.toLocaleString()}
      </span>
    </div>
  );
}

function getTransactionIcon(type: string): string {
  const icons: Record<string, string> = {
    purchase: '💳', spend: '💸', gift: '🎁', gift_received: '🎁',
    earned: '💰', bonus: '🎉', refund: '↩️',
  };
  return icons[type] || '💰';
}

function getTransactionLabel(tx: Transaction): string {
  if (tx.description) return tx.description;
  switch (tx.type) {
    case 'purchase': return 'Coin Purchase';
    case 'spend': return 'Coins Spent';
    case 'gift': return `Gift to @${tx.recipientUsername || 'user'}`;
    case 'gift_received': return `Gift from @${tx.senderUsername || 'user'}`;
    case 'earned': return 'Coins Earned';
    case 'bonus': return 'Bonus Coins';
    case 'refund': return 'Refund';
    default: return 'Transaction';
  }
}
