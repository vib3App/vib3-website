'use client';

import { useState } from 'react';
import Image from 'next/image';
import { walletApi } from '@/services/api';
import { logger } from '@/utils/logger';

interface SendTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onSuccess?: (amount: number) => void;
}

const PRESET_AMOUNTS = [
  { value: 100, label: '$1', coins: 100 },
  { value: 500, label: '$5', coins: 500 },
  { value: 1000, label: '$10', coins: 1000 },
  { value: 2500, label: '$25', coins: 2500 },
  { value: 5000, label: '$50', coins: 5000 },
  { value: 10000, label: '$100', coins: 10000 },
];

export function SendTipModal({ isOpen, onClose, recipientId, recipientName, recipientAvatar, onSuccess }: SendTipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const amount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handleSend = async () => {
    if (!amount || amount <= 0) {
      setError('Please select an amount');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await walletApi.sendGift(recipientId, amount, message || `Tip for ${recipientName}`);
      setSent(true);
      onSuccess?.(amount);
      setTimeout(() => {
        setSent(false);
        onClose();
        setSelectedAmount(null);
        setCustomAmount('');
        setMessage('');
      }, 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosErr.response?.data?.error || axiosErr.message || 'Failed to send tip');
      logger.error('Tip failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSent(false);
    setError(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleReset} />
      <div className="relative glass rounded-2xl w-full max-w-md overflow-hidden">
        <div className="sticky top-0 glass-card border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button onClick={handleReset} className="text-white/70 hover:text-white text-sm">Cancel</button>
          <h2 className="text-white font-semibold">Send Tip</h2>
          <div className="w-12" />
        </div>

        <div className="p-6 space-y-5">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">V3</div>
              <p className="text-white text-lg font-semibold mb-2">Tip Sent!</p>
              <p className="text-white/50 text-sm">{amount} coins sent to {recipientName}</p>
            </div>
          ) : (
            <>
              {/* Recipient */}
              <div className="flex items-center gap-3 justify-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-teal-400 p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
                    {recipientAvatar ? (
                      <Image src={recipientAvatar} alt={recipientName} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {recipientName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white font-medium">{recipientName}</p>
                  <p className="text-white/50 text-xs">Send a tip</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>
              )}

              {/* Preset amounts */}
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => { setSelectedAmount(preset.value); setCustomAmount(''); }}
                    className={`py-3 rounded-xl text-center transition ${
                      selectedAmount === preset.value
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div className="text-xs opacity-70">{preset.coins} coins</div>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div>
                <label className="text-white/50 text-xs block mb-1">Or enter custom coins</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  placeholder="Custom amount"
                  min="1"
                  className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm outline-none border border-white/10 focus:border-amber-500/50 transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-white/50 text-xs block mb-1">Message (optional)</label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice..."
                  maxLength={200}
                  className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm outline-none border border-white/10 focus:border-amber-500/50 transition"
                />
              </div>

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={loading || !amount || amount <= 0}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : `Send ${amount || 0} Coins`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
