'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/feed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-white/60 mb-6">
          Your coins have been added to your account. Thank you for your purchase!
        </p>

        {sessionId && (
          <p className="text-white/30 text-xs mb-4">Session: {sessionId.slice(0, 20)}...</p>
        )}

        <div className="space-y-3">
          <Link href="/feed"
            className="block w-full py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-xl hover:opacity-90 transition">
            Continue to Feed
          </Link>
          <p className="text-white/40 text-sm">Redirecting in {countdown}s...</p>
        </div>
      </div>
    </div>
  );
}
