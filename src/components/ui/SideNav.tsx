'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

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
];

const secondaryNavItems = [
  { href: '/messages', label: 'Messages', icon: 'message' },
  { href: '/notifications', label: 'Notifications', icon: 'bell' },
];

const creatorNavItems = [
  { href: '/upload', label: 'Upload', icon: 'upload' },
  { href: '/camera', label: 'Camera', icon: 'camera' },
  { href: '/creator', label: 'Creator Studio', icon: 'studio' },
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
          <circle cx="18" cy="5" r="2" fill="currentColor" />
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
    default:
      return null;
  }
}

export function SideNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#0A0E1A] border-r border-white/5 p-4">
      {/* Logo */}
      <Link href="/feed" className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center">
          <span className="text-white font-bold text-xl">V</span>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">
          VIB3
        </span>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  NEW
                </span>
              )}
            </Link>
          );
        })}

        <div className="h-px bg-white/5 my-4" />

        <div className="px-3 py-1 text-xs text-white/30 uppercase tracking-wider">Features</div>
        {featureNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        <div className="h-px bg-white/5 my-4" />

        {secondaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={isAuthenticated ? item.href : '/login'}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="h-px bg-white/5 my-4" />

        {creatorNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={isAuthenticated ? item.href : '/login'}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {isAuthenticated && user ? (
        <Link
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors mt-auto"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#14B8A6] p-0.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1F2E]">
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
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium truncate">{user.username}</div>
            <div className="text-white/50 text-sm truncate">View profile</div>
          </div>
        </Link>
      ) : (
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold hover:opacity-90 transition-opacity mt-auto"
        >
          Log in
        </Link>
      )}
    </aside>
  );
}
