'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FollowingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to feed with following tab
    router.replace('/feed?tab=following');
  }, [router]);

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
    </div>
  );
}
