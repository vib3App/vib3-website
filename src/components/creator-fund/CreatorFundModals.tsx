'use client';

import type { CreatorFundTier } from '@/types/creatorFund';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  applying: boolean;
  isEligible: boolean;
  potentialTier?: CreatorFundTier | null;
}

export function ApplyModal({ isOpen, onClose, onApply, applying, isEligible, potentialTier }: ApplyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-heavy rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">Apply to Creator Fund</h2>
        <p className="text-white/50 mb-6">
          {isEligible ? 'You meet all requirements! Apply now to start earning.' : 'You need to meet all requirements before applying.'}
        </p>

        {isEligible && potentialTier && (
          <div className="glass rounded-xl p-4 mb-6">
            <p className="text-white/70 text-sm mb-1">You will start at</p>
            <p className="text-white font-bold text-lg capitalize">{potentialTier} Tier</p>
          </div>
        )}

        <button
          onClick={onApply}
          disabled={applying || !isEligible}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {applying ? 'Applying...' : isEligible ? 'Apply Now' : 'Not Eligible'}
        </button>
      </div>
    </div>
  );
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: () => void;
  withdrawing: boolean;
  availableBalance: number;
  hasPaymentMethod: boolean;
  paymentMethodDisplay?: string;
  withdrawAmount: string;
  onAmountChange: (amount: string) => void;
}

export function WithdrawModal({
  isOpen, onClose, onWithdraw, withdrawing, availableBalance, hasPaymentMethod, paymentMethodDisplay, withdrawAmount, onAmountChange,
}: WithdrawModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-heavy rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">Withdraw Funds</h2>
        <p className="text-white/50 mb-6">Available balance: ${availableBalance.toFixed(2)}</p>

        {!hasPaymentMethod && (
          <div className="bg-amber-500/20 text-amber-500 p-4 rounded-xl mb-6 text-sm">
            Please add a payment method before withdrawing.
          </div>
        )}

        <div className="mb-4">
          <label className="block text-white/70 text-sm mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">$</span>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              min="50"
              max={availableBalance}
              className="w-full glass rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>

        {hasPaymentMethod && paymentMethodDisplay && (
          <div className="mb-6">
            <label className="block text-white/70 text-sm mb-2">Withdraw to</label>
            <div className="glass rounded-xl px-4 py-3 text-white">{paymentMethodDisplay}</div>
          </div>
        )}

        <button
          onClick={onWithdraw}
          disabled={withdrawing || !hasPaymentMethod}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {withdrawing ? 'Processing...' : 'Withdraw'}
        </button>
        <p className="text-white/30 text-xs text-center mt-4">
          Minimum withdrawal: $50. Processing time: 3-5 business days.
        </p>
      </div>
    </div>
  );
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  paymentType: 'paypal' | 'bank';
  onPaymentTypeChange: (type: 'paypal' | 'bank') => void;
  paymentEmail: string;
  onEmailChange: (email: string) => void;
}

export function PaymentMethodModal({
  isOpen, onClose, onSave, saving, paymentType, onPaymentTypeChange, paymentEmail, onEmailChange,
}: PaymentMethodModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-heavy rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

        <div className="mb-4">
          <label className="block text-white/70 text-sm mb-2">Payment Type</label>
          <div className="flex gap-4">
            <button
              onClick={() => onPaymentTypeChange('paypal')}
              className={`flex-1 py-3 rounded-xl font-medium transition ${
                paymentType === 'paypal' ? 'bg-blue-500 text-white' : 'glass text-white/70 hover:bg-white/10'
              }`}
            >
              PayPal
            </button>
            <button
              onClick={() => onPaymentTypeChange('bank')}
              className={`flex-1 py-3 rounded-xl font-medium transition ${
                paymentType === 'bank' ? 'bg-blue-500 text-white' : 'glass text-white/70 hover:bg-white/10'
              }`}
            >
              Bank Account
            </button>
          </div>
        </div>

        {paymentType === 'paypal' && (
          <div className="mb-6">
            <label className="block text-white/70 text-sm mb-2">PayPal Email</label>
            <input
              type="email"
              value={paymentEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="your@email.com"
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        )}

        {paymentType === 'bank' && (
          <div className="mb-6 text-center text-white/50">
            <p>Bank account setup requires verification.</p>
            <p className="text-sm mt-2">Please use PayPal for now.</p>
          </div>
        )}

        <button
          onClick={onSave}
          disabled={saving || (paymentType === 'paypal' && !paymentEmail)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Payment Method'}
        </button>
      </div>
    </div>
  );
}
