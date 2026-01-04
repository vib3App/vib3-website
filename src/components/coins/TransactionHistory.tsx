'use client';

import type { Transaction } from '@/types/wallet';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

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

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        No transactions yet. Buy or earn coins to get started!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
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
      ))}
    </div>
  );
}
