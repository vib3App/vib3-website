'use client';

import {
  BanknotesIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { StepCard } from './StepCard';

interface StripeConnectCardProps {
  hasStripeAccount: boolean;
  isStripeOnboarded: boolean;
  isConnecting: boolean;
  onConnectStripe: () => void;
}

export function StripeConnectCard({
  hasStripeAccount,
  isStripeOnboarded,
  isConnecting,
  onConnectStripe,
}: StripeConnectCardProps) {
  const getIconColor = () => {
    if (!hasStripeAccount) return 'bg-white/10';
    return isStripeOnboarded ? 'bg-green-500/30' : 'bg-orange-500/30';
  };

  const getSubtitle = () => {
    if (!hasStripeAccount) return 'Set up to receive payments';
    return isStripeOnboarded ? 'Connected & Ready' : 'Complete Onboarding';
  };

  return (
    <StepCard
      title="Connect Payment Account"
      subtitle={getSubtitle()}
      icon={BanknotesIcon}
      iconColor={getIconColor()}
      isComplete={isStripeOnboarded}
    >
      {!hasStripeAccount ? (
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            Connect your bank account to receive subscription payments directly.
            We use Stripe for secure payment processing.
          </p>
          <button
            onClick={onConnectStripe}
            disabled={isConnecting}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5" />
                Set Up Payments
              </>
            )}
          </button>
        </div>
      ) : !isStripeOnboarded ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <ExclamationCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/70 text-sm">
              Complete your account setup to start receiving payments.
            </p>
          </div>
          <button
            onClick={onConnectStripe}
            disabled={isConnecting}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition disabled:opacity-50"
          >
            Complete Setup
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="text-sm">
            Your payment account is set up and ready to receive payments!
          </span>
        </div>
      )}
    </StepCard>
  );
}
