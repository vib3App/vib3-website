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
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-teal-500 to-purple-500 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
        {/* Button */}
        <div className="relative w-12 h-8 bg-gradient-to-r from-purple-500 via-teal-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
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
  { href: '/settings', label: 'Settings', icon: '⚙️' },
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
  { href: '/settings?tab=appearance', label: 'Themes', icon: '🎨' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Menu Overlay - Liquid Glass */}
      {showMenu && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMenu(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-20 left-2 right-2 glass-heavy rounded-3xl p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle indicator */}
            <div className="w-12 h-1 bg-gradient-to-r from-purple-500/50 to-teal-500/50 rounded-full mx-auto mb-4" />

            {/* Grid of menu items */}
            <div className="grid grid-cols-3 gap-2">
              {menuItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={isAuthenticated || item.href === '/live' ? item.href : '/login'}
                  onClick={() => setShowMenu(false)}
                  className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-gradient-to-br from-purple-500/20 to-teal-500/20 text-white'
                      : 'hover:bg-white/10 text-white/70 hover:text-white'
                  }`}
                  style={{ animationDelay: `${i * 30}ms`, animation: 'slide-up-scale 0.3s ease-out forwards' }}
                >
                  {pathname === item.href && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-teal-500/10 rounded-xl" />
                  )}
                  <span className="relative text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="relative text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Liquid Glass */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden p-2">
        <div className="glass-heavy rounded-2xl mx-2 overflow-hidden">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              if (item.isMenu) {
                return (
                  <button
                    key="menu"
                    onClick={() => setShowMenu(!showMenu)}
                    className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all ${
                      showMenu ? 'text-white' : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    {showMenu && (
                      <div className="absolute inset-2 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-xl blur-sm" />
                    )}
                    <span className="relative">{item.icon(showMenu)}</span>
                    <span className="relative text-[10px] mt-1">{item.label}</span>
                  </button>
                );
              }

              const href = item.href === '/profile' && !isAuthenticated ? '/login' : item.href;

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all ${
                    item.special ? '' : isActive ? 'text-white' : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  {isActive && !item.special && (
                    <div className="absolute inset-2 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-xl blur-sm" />
                  )}
                  <span className="relative">{item.icon(isActive)}</span>
                  {!item.special && (
                    <span className="relative text-[10px] mt-1">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
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
