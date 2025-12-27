'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<string>('Loading...');

  useEffect(() => {
    // Debug logging
    console.log('Profile redirect - Auth state:', { isAuthenticated, isLoading, user });
    setDebugInfo(`Auth: ${isAuthenticated}, Loading: ${isLoading}, User ID: ${user?.id || 'none'}`);

    if (isLoading) return;

    if (!isAuthenticated || !user) {
      console.log('Not authenticated, redirecting to login');
      router.replace('/login');
    } else if (user.id) {
      console.log('Redirecting to profile:', user.id);
      router.replace(`/profile/${user.id}`);
    } else {
      console.error('User exists but no ID:', user);
      setDebugInfo(`Error: User exists but no ID. User object: ${JSON.stringify(user)}`);
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1] mb-4" />
      <div className="text-white/30 text-xs">{debugInfo}</div>
    </div>
  );
}
