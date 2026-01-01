'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin');
        return;
      }
      if (!user?.isAdmin && user?.role !== 'admin') {
        router.push('/');
        return;
      }
      setChecking(false);
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">Verifying admin access...</div>
      </div>
    );
  }

  if (!user?.isAdmin && user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Admin Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-2xl font-bold text-white">
                VIB3 <span className="text-red-500">Admin</span>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/admin"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/reports"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Reports
                </Link>
                <Link
                  href="/admin/team"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Team
                </Link>
                <Link
                  href="/admin/users"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/dmca"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  DMCA
                </Link>
                <Link
                  href="/admin/withdrawals"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Withdrawals
                </Link>
                <Link
                  href="/admin/flagged-reporters"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Flagged Reporters
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm">
                Logged in as <span className="text-white">{user?.username}</span>
              </span>
              <Link
                href="/"
                className="text-neutral-400 hover:text-white transition-colors text-sm"
              >
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
