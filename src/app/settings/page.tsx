'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import {
  AccountSection,
  PrivacySection,
  NotificationsSection,
  ContentSection,
  AboutSection,
} from '@/components/settings';

type SettingsSection = 'account' | 'privacy' | 'notifications' | 'content' | 'about';

const SECTIONS: { id: SettingsSection; label: string; icon: string }[] = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'content', label: 'Content', icon: '🎬' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

function ProfileCard({ user }: { user: { username: string; email: string; profilePicture?: string } | null }) {
  return (
    <Link href="/profile" className="flex items-center gap-4 p-4 bg-[#1A1F2E] rounded-2xl mb-6 hover:bg-[#252A3E] transition-colors">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#14B8A6] p-0.5">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1F2E]">
          {user?.profilePicture ? (
            <Image src={user.profilePicture} alt={user.username} width={64} height={64} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/70">
              {user?.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-white font-semibold">{user?.username}</h2>
        <p className="text-white/50 text-sm">{user?.email}</p>
      </div>
      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?redirect=/settings');
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-4 px-4 h-14">
            <button onClick={() => router.back()} className="text-white/50 hover:text-white md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">Settings</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4">
          <ProfileCard user={user} />

          <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  activeSection === section.id
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-[#1A1F2E] text-white/70 hover:bg-[#252A3E]'
                }`}
              >
                <span>{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </div>

          {activeSection === 'account' && <AccountSection />}
          {activeSection === 'privacy' && <PrivacySection />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'content' && <ContentSection />}
          {activeSection === 'about' && <AboutSection />}

          <button
            onClick={handleLogout}
            className="w-full mt-6 p-4 bg-red-500/10 text-red-400 font-medium rounded-2xl hover:bg-red-500/20 transition-colors"
          >
            Log Out
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
