'use client';

import { useState, useCallback } from 'react';
import { walletApi } from '@/services/api/wallet';
import { useToastStore } from '@/stores/toastStore';
import { logger } from '@/utils/logger';

interface SendTipSheetProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  type?: 'video' | 'profile';
  onSuccess?: (amount: number) => void;
}

const PRESET_AMOUNTS = [10, 50, 100, 500, 1000];

/**
 * Gap #67: Tip Sending UI
 * Bottom sheet for sending tips with preset/custom amounts.
 */
export function SendTipSheet({ isOpen, onClose, recipientId, recipientName, type = 'profile', onSuccess }: SendTipSheetProps) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [useCustom, setUseCustom] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const effectiveAmount = useCustom ? parseInt(customAmount) || 0 : amount;

  const handleSend = useCallback(async () => {
    if (effectiveAmount < 1) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    setSending(true);
    try {
      await walletApi.spend({
        amount: effectiveAmount,
        type: 'gift',
        recipientId,
        description: message || `Tip of ${effectiveAmount} coins`,
      });
      addToast(`Sent ${effectiveAmount} coins to ${recipientName}!`, 'success');
      onSuccess?.(effectiveAmount);
      onClose();
    } catch (err) {
      logger.error('Tip failed:', err);
      addToast('Failed to send tip. Check your balance.', 'error');
    } finally {
      setSending(false);
    }
  }, [effectiveAmount, recipientId, recipientName, message, addToast, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-lg">Send Tip</h3>
            <p className="text-white/50 text-sm">to @{recipientName}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preset amounts */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {PRESET_AMOUNTS.map(a => (
            <button key={a} onClick={() => { setAmount(a); setUseCustom(false); }}
              className={`py-2.5 rounded-xl text-sm font-medium transition ${
                !useCustom && amount === a
                  ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
                  : 'glass text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              {a >= 1000 ? `${a / 1000}K` : a}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="mb-4">
          <button onClick={() => setUseCustom(!useCustom)}
            className="text-purple-400 text-sm mb-2 hover:underline">
            {useCustom ? 'Use preset' : 'Custom amount'}
          </button>
          {useCustom && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">💰</span>
              <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                placeholder="Enter amount..."
                min="1" max="100000"
                className="flex-1 bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50 text-lg" />
            </div>
          )}
        </div>

        {/* Message */}
        <input type="text" value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Add a message (optional)..." maxLength={200}
          className="w-full bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50 mb-4 text-sm" />

        {/* Summary and send */}
        <div className="flex items-center justify-between mb-4 p-3 glass rounded-xl">
          <span className="text-white/50 text-sm">Total</span>
          <span className="text-white font-bold text-lg flex items-center gap-1">
            <span className="text-yellow-400">💰</span>
            {effectiveAmount.toLocaleString()} coins
          </span>
        </div>

        <button onClick={handleSend} disabled={sending || effectiveAmount < 1}
          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
          {sending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            `Send ${effectiveAmount.toLocaleString()} Coins`
          )}
        </button>
      </div>
    </div>
  );
}
