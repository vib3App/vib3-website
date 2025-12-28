'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';

type SettingsSection = 'account' | 'privacy' | 'notifications' | 'content' | 'about';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/settings');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors
    }
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

  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'content', label: 'Content', icon: '🎬' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
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
          {/* Profile Card */}
          <Link
            href="/profile"
            className="flex items-center gap-4 p-4 bg-[#1A1F2E] rounded-2xl mb-6 hover:bg-[#252A3E] transition-colors"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#14B8A6] p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1F2E]">
                {user?.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.username}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
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

          {/* Section Tabs */}
          <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as SettingsSection)}
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

          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-4">
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-white">Edit Profile</span>
                  </div>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-white">Email & Phone</span>
                  </div>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <span className="text-white">Password</span>
                  </div>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <span className="text-white">VIB3 Pro</span>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white text-xs font-medium rounded-full">
                    Upgrade
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-white">Private Account</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-white/20 relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-white">Allow Comments</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-white">Allow Messages</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-white">Allow Duets</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
                  <span className="text-white">Blocked Accounts</span>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors border-t border-white/5">
                  <span className="text-white">Download Your Data</span>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <span className="text-white block">Push Notifications</span>
                    <span className="text-white/50 text-sm">Get notified on your device</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">New Followers</span>
                    <span className="text-white/50 text-sm">When someone follows you</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Likes</span>
                    <span className="text-white/50 text-sm">When someone likes your video</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Comments</span>
                    <span className="text-white/50 text-sm">When someone comments on your video</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Mentions</span>
                    <span className="text-white/50 text-sm">When someone mentions you</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Direct Messages</span>
                    <span className="text-white/50 text-sm">When you receive a message</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Live Streams</span>
                    <span className="text-white/50 text-sm">When followed creators go live</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <span className="text-white block">Email Notifications</span>
                    <span className="text-white/50 text-sm">Weekly digest and updates</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-white/20 relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-1 top-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Settings */}
          {activeSection === 'content' && (
            <div className="space-y-4">
              {/* Playback Settings */}
              <h3 className="text-white/50 text-sm font-medium px-1">Playback</h3>
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <span className="text-white block">Autoplay Videos</span>
                    <span className="text-white/50 text-sm">Play videos automatically in feed</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Default Quality</span>
                    <span className="text-white/50 text-sm">Video playback quality</span>
                  </div>
                  <select className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm">
                    <option value="auto">Auto</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                    <option value="360p">360p</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Loop Videos</span>
                    <span className="text-white/50 text-sm">Repeat videos when finished</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Mute by Default</span>
                    <span className="text-white/50 text-sm">Start videos muted</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-white/20 relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-1 top-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* AI Features */}
              <h3 className="text-white/50 text-sm font-medium px-1 mt-6">AI Features</h3>
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <span className="text-white block">Auto-Captions</span>
                    <span className="text-white/50 text-sm">Generate captions automatically</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Caption Language</span>
                    <span className="text-white/50 text-sm">Preferred caption language</span>
                  </div>
                  <select className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Smart Recommendations</span>
                    <span className="text-white/50 text-sm">AI-powered content suggestions</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Beauty Filters</span>
                    <span className="text-white/50 text-sm">AI face enhancement in camera</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Display Settings */}
              <h3 className="text-white/50 text-sm font-medium px-1 mt-6">Display</h3>
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <span className="text-white block">Dark Mode</span>
                    <span className="text-white/50 text-sm">Use dark theme</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Reduce Motion</span>
                    <span className="text-white/50 text-sm">Limit animations</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-white/20 relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-1 top-1 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div>
                    <span className="text-white block">Show View Counts</span>
                    <span className="text-white/50 text-sm">Display view numbers</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-[#6366F1] relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Data & Storage */}
              <h3 className="text-white/50 text-sm font-medium px-1 mt-6">Data & Storage</h3>
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <span className="text-white block">Data Saver</span>
                    <span className="text-white/50 text-sm">Reduce data usage</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-white/20 relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-1 top-1 transition-transform" />
                  </button>
                </div>

                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors border-t border-white/5">
                  <div>
                    <span className="text-white block">Clear Cache</span>
                    <span className="text-white/50 text-sm">Free up storage space</span>
                  </div>
                  <span className="text-white/50 text-sm">128 MB</span>
                </button>

                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors border-t border-white/5">
                  <div>
                    <span className="text-white block">Clear Watch History</span>
                    <span className="text-white/50 text-sm">Remove all watched videos</span>
                  </div>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* About Section */}
          {activeSection === 'about' && (
            <div className="space-y-4">
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
                  <span className="text-white">Terms of Service</span>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors border-t border-white/5">
                  <span className="text-white">Privacy Policy</span>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors border-t border-white/5">
                  <span className="text-white">Community Guidelines</span>
                  <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="text-center text-white/30 text-sm py-4">
                VIB3 v1.0.0
              </div>
            </div>
          )}

          {/* Logout Button */}
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
