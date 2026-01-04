'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  StarIcon,
  CalendarIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { UserSubscription } from '@/services/api/subscriptions';

interface SubscriptionCardProps {
  subscription: UserSubscription;
  onCancel: () => Promise<void>;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SubscriptionCard({ subscription, onCancel }: SubscriptionCardProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    await onCancel();
    setIsCancelling(false);
    setShowCancelConfirm(false);
  };

  const isActive = subscription.status === 'active';
  const isCancelled = subscription.status === 'cancelled';

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <CreatorInfo subscription={subscription} isActive={isActive} isCancelled={isCancelled} />
      <SubscriptionDetails
        subscription={subscription}
        isActive={isActive}
        isCancelled={isCancelled}
        showCancelConfirm={showCancelConfirm}
        isCancelling={isCancelling}
        onShowCancel={() => setShowCancelConfirm(true)}
        onHideCancel={() => setShowCancelConfirm(false)}
        onConfirmCancel={handleCancel}
      />
    </div>
  );
}

function CreatorInfo({ subscription, isActive, isCancelled }: { subscription: UserSubscription; isActive: boolean; isCancelled: boolean }) {
  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${subscription.creatorId}`}>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
            {subscription.creatorAvatar ? (
              <Image src={subscription.creatorAvatar} alt={subscription.creatorUsername} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {subscription.creatorUsername.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${subscription.creatorId}`} className="text-white font-medium hover:underline">
            @{subscription.creatorUsername}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-purple-400 text-sm flex items-center gap-1">
              <StarIcon className="w-3.5 h-3.5" />
              {subscription.tier.name}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-white/50 text-sm">${subscription.price.toFixed(2)}/mo</span>
          </div>
        </div>
        <StatusBadge isActive={isActive} isCancelled={isCancelled} status={subscription.status} />
      </div>
    </div>
  );
}

function StatusBadge({ isActive, isCancelled, status }: { isActive: boolean; isCancelled: boolean; status: string }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
        <CheckCircleIcon className="w-3.5 h-3.5" />Active
      </span>
    );
  }
  if (isCancelled) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
        <ExclamationTriangleIcon className="w-3.5 h-3.5" />Cancelled
      </span>
    );
  }
  if (status === 'expired') {
    return <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/50 rounded-full text-xs">Expired</span>;
  }
  return null;
}

function SubscriptionDetails({
  subscription, isActive, isCancelled, showCancelConfirm, isCancelling, onShowCancel, onHideCancel, onConfirmCancel,
}: {
  subscription: UserSubscription;
  isActive: boolean;
  isCancelled: boolean;
  showCancelConfirm: boolean;
  isCancelling: boolean;
  onShowCancel: () => void;
  onHideCancel: () => void;
  onConfirmCancel: () => void;
}) {
  return (
    <div className="p-4 space-y-3">
      {subscription.tier.benefits.length > 0 && <BenefitsList benefits={subscription.tier.benefits} />}
      <DateInfo subscription={subscription} isActive={isActive} isCancelled={isCancelled} />
      {isActive && (
        <CancelActions
          showConfirm={showCancelConfirm}
          isCancelling={isCancelling}
          onShow={onShowCancel}
          onHide={onHideCancel}
          onConfirm={onConfirmCancel}
        />
      )}
    </div>
  );
}

function BenefitsList({ benefits }: { benefits: string[] }) {
  return (
    <div className="space-y-1">
      {benefits.slice(0, 3).map((benefit, i) => (
        <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
          <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
          {benefit}
        </div>
      ))}
      {benefits.length > 3 && <p className="text-white/50 text-xs pl-6">+{benefits.length - 3} more benefits</p>}
    </div>
  );
}

function DateInfo({ subscription, isActive, isCancelled }: { subscription: UserSubscription; isActive: boolean; isCancelled: boolean }) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-white/10">
      <div className="flex items-center gap-2 text-white/50 text-sm">
        <CalendarIcon className="w-4 h-4" />
        <span>Started {formatDate(subscription.startedAt)}</span>
      </div>
      {subscription.renewsAt && isActive && <span className="text-white/50 text-sm">Renews {formatDate(subscription.renewsAt)}</span>}
      {isCancelled && subscription.expiresAt && <span className="text-orange-400 text-sm">Ends {formatDate(subscription.expiresAt)}</span>}
    </div>
  );
}

function CancelActions({ showConfirm, isCancelling, onShow, onHide, onConfirm }: { showConfirm: boolean; isCancelling: boolean; onShow: () => void; onHide: () => void; onConfirm: () => void }) {
  if (showConfirm) {
    return (
      <div className="pt-2 flex gap-2">
        <button onClick={onHide} className="flex-1 py-2 glass text-white rounded-lg text-sm hover:bg-white/10 transition">Keep Subscription</button>
        <button
          onClick={onConfirm}
          disabled={isCancelling}
          className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {isCancelling ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <><XCircleIcon className="w-4 h-4" />Confirm Cancel</>}
        </button>
      </div>
    );
  }
  return (
    <div className="pt-2">
      <button onClick={onShow} className="w-full py-2 text-white/50 hover:text-red-400 text-sm transition">Cancel Subscription</button>
    </div>
  );
}
