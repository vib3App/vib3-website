'use client';

import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { VerificationStatus } from './types';

interface StatusCardsProps {
  status: VerificationStatus;
  isVerified: boolean;
  rejectionReason?: string | null;
}

export function VerifiedCard() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">You&apos;re Verified!</h2>
      <p className="text-white/50">Your account has already been verified.</p>
    </div>
  );
}

export function PendingCard() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
        <ClockIcon className="w-12 h-12 text-yellow-500" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Request Pending</h2>
      <p className="text-white/50 max-w-md mx-auto">
        Your verification request is being reviewed. This typically takes 1-3 business days.
      </p>
    </div>
  );
}

export function RejectedCard({ rejectionReason }: { rejectionReason?: string | null }) {
  return (
    <div className="text-center py-8 mb-8">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
        <XCircleIcon className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Previous Request Declined</h2>
      {rejectionReason && (
        <p className="text-white/50 text-sm max-w-md mx-auto mb-4">
          Reason: {rejectionReason}
        </p>
      )}
      <p className="text-white/50 text-sm">You can submit a new request below.</p>
    </div>
  );
}

export function StatusCards({ status, isVerified, rejectionReason }: StatusCardsProps) {
  if (isVerified) return <VerifiedCard />;
  if (status === 'pending') return <PendingCard />;
  if (status === 'rejected') return <RejectedCard rejectionReason={rejectionReason} />;
  return null;
}
