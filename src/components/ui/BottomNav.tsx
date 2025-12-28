'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  {
    href: '/feed',
    label: 'Home',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/discover',
    label: 'Discover',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/upload',
    label: 'Create',
    icon: () => (
      <div className="w-12 h-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    ),
    special: true,
  },
  {
    href: '/notifications',
    label: 'Inbox',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: 'menu',
    label: 'More',
    isMenu: true,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
];

const menuItems = [
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/collab', label: 'Collab Rooms', icon: '👥' },
  { href: '/watch-party', label: 'Watch Party', icon: '🎉' },
  { href: '/capsule', label: 'Time Capsules', icon: '⏰' },
  { href: '/challenges', label: 'Challenges', icon: '🏆' },
  { href: '/coins', label: 'VIB3 Coins', icon: '🪙' },
  { href: '/collections', label: 'Collections', icon: '📁' },
  { href: '/live', label: 'Go Live', icon: '🔴' },
  { href: '/shop', label: 'Shop', icon: '🛍️' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/creator-fund', label: 'Creator Fund', icon: '💰' },
  { href: '/messages', label: 'Messages', icon: '💬' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMenu(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-b from-neutral-900 to-stone-950 rounded-t-3xl p-4 animate-slide-up border-t border-amber-900/30">
            <div className="w-12 h-1 bg-amber-500/30 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={isAuthenticated || item.href === '/live' ? item.href : '/login'}
                  onClick={() => setShowMenu(false)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                    pathname === item.href ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-amber-900/20 text-white'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-lg border-t border-amber-900/20 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            if (item.isMenu) {
              return (
                <button
                  key="menu"
                  onClick={() => setShowMenu(!showMenu)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    showMenu ? 'text-white' : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  {item.icon(showMenu)}
                  <span className="text-[10px] mt-1">{item.label}</span>
                </button>
              );
            }

            const href = item.href === '/profile' && !isAuthenticated ? '/login' : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  item.special ? '' : isActive ? 'text-white' : 'text-white/50 hover:text-white/70'
                }`}
              >
                {item.icon(isActive)}
                {!item.special && (
                  <span className="text-[10px] mt-1">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
