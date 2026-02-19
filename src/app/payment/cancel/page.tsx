'use client';

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-white/60 mb-6">
          Your payment was not completed. No charges were made. You can try again anytime.
        </p>

        <div className="space-y-3">
          <Link href="/coins"
            className="block w-full py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-xl hover:opacity-90 transition">
            Try Again
          </Link>
          <Link href="/feed"
            className="block w-full py-3 glass text-white/70 rounded-xl hover:bg-white/10 transition">
            Back to Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
