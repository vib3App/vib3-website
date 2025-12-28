'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { SidebarSearch } from './SidebarSearch';
import { FollowingAccounts } from './FollowingAccounts';
import { EnergyMeter } from './EnergyMeter';

const mainNavItems = [
  { href: '/feed', label: 'For You', icon: 'home' },
  { href: '/following', label: 'Following', icon: 'users' },
  { href: '/discover', label: 'Discover', icon: 'compass' },
  { href: '/live', label: 'LIVE', icon: 'live', badge: true },
];

const featureNavItems = [
  { href: '/collab', label: 'Collab Rooms', icon: 'collab' },
  { href: '/watch-party', label: 'Watch Party', icon: 'party' },
  { href: '/capsule', label: 'Time Capsules', icon: 'capsule' },
  { href: '/collections', label: 'Collections', icon: 'collections' },
  { href: '/challenges', label: 'Challenges', icon: 'trophy' },
];

const creatorNavItems = [
  { href: '/upload', label: 'Upload', icon: 'upload' },
  { href: '/camera', label: 'Camera', icon: 'camera' },
  { href: '/creator', label: 'Creator Studio', icon: 'studio' },
];

const moreNavItems = [
  { href: '/coins', label: 'VIB3 Coins', icon: 'coins' },
  { href: '/shop', label: 'Shop', icon: 'shop' },
  { href: '/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/creator-fund', label: 'Creator Fund', icon: 'fund' },
  { href: '/messages', label: 'Messages', icon: 'message' },
  { href: '/notifications', label: 'Notifications', icon: 'bell' },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const strokeWidth = active ? 2.5 : 1.5;
  const fill = active ? 'currentColor' : 'none';

  switch (name) {
    case 'home':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'users':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'compass':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case 'live':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'message':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'bell':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    case 'upload':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 4v16m8-8H4" />
        </svg>
      );
    case 'studio':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'collab':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'party':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'capsule':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'collections':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'camera':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'trophy':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case 'coins':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'shop':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    case 'analytics':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'fund':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'energy':
      return (
        <svg className="w-6 h-6" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'more':
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      );
    default:
      return null;
  }
}

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [showMore, setShowMore] = useState(false);
  const [showEnergyMeter, setShowEnergyMeter] = useState(false);

  const handleLogoClick = () => {
    if (pathname === '/feed') {
      // Refresh the feed
      window.location.reload();
    } else {
      router.push('/feed');
    }
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass-heavy border-r border-white/10 overflow-y-auto">
        {/* Aurora background accent */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo - Clickable to refresh */}
        <div
          onClick={handleLogoClick}
          className="relative flex items-center gap-3 px-6 py-5 mb-2 cursor-pointer group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">
            VIB3
          </span>
        </div>

        {/* Search */}
        <SidebarSearch />

        {/* Main Navigation */}
        <nav className="relative flex-1 px-3 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-xl border border-white/10" />
                )}
                <span className="relative"><NavIcon name={item.icon} active={isActive} /></span>
                <span className="relative">{item.label}</span>
                {item.badge && (
                  <span className="relative ml-auto px-2 py-0.5 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

          <div className="px-3 py-1 text-xs text-white/30 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
            Features
          </div>
          {featureNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 to-teal-500/15 rounded-xl border border-white/10" />
                )}
                <span className="relative"><NavIcon name={item.icon} active={isActive} /></span>
                <span className="relative text-sm">{item.label}</span>
              </Link>
            );
          })}

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

          <div className="px-3 py-1 text-xs text-white/30 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50" />
            Create
          </div>
          {creatorNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={isAuthenticated ? item.href : '/login'}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 to-purple-500/15 rounded-xl border border-white/10" />
                )}
                <span className="relative"><NavIcon name={item.icon} active={isActive} /></span>
                <span className="relative text-sm">{item.label}</span>
              </Link>
            );
          })}

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

          {/* More Section */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <NavIcon name="more" active={false} />
              <span className="text-sm">More</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMore && (
            <div className="pl-3 space-y-1">
              {moreNavItems.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={isAuthenticated ? item.href : '/login'}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                    style={{ animationDelay: `${i * 30}ms`, animation: 'slide-up-scale 0.2s ease-out forwards' }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl border border-white/10" />
                    )}
                    <span className="relative"><NavIcon name={item.icon} active={isActive} /></span>
                    <span className="relative text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Energy Meter Button */}
          <button
            onClick={() => setShowEnergyMeter(true)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all w-full group"
          >
            <NavIcon name="energy" active={false} />
            <span className="text-sm">Energy Meter</span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-teal-400 animate-pulse" />
              <span className="text-xs text-green-400/70 group-hover:text-green-400">Active</span>
            </div>
          </button>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

          {/* Following Accounts */}
          <FollowingAccounts />
        </nav>

        {/* User Profile */}
        <div className="relative p-3 border-t border-white/10">
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-teal-500 p-0.5">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-neutral-900">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{user.username}</div>
                <div className="text-white/40 text-sm truncate group-hover:text-purple-400 transition-colors">View profile</div>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="relative flex items-center justify-center gap-2 p-3 rounded-xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-white font-semibold">Log in</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Energy Meter Modal */}
      <EnergyMeter isOpen={showEnergyMeter} onClose={() => setShowEnergyMeter(false)} />
    </>
  );
}
