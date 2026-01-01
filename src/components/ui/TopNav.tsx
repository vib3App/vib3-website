'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import { authApi } from '@/services/api';
import { ThemeToggle } from '@/components/personalization';
import { SoundToggle } from '@/components/audio';
import type { FeedCategory } from '@/types';

interface DropdownItem {
  href: string;
  label: string;
  icon?: string;
  description?: string;
}

interface DropdownConfig {
  id: string;
  label: string;
  items: DropdownItem[];
}

const DROPDOWNS: DropdownConfig[] = [
  {
    id: 'create',
    label: 'Create',
    items: [
      { href: '/upload', label: 'Upload', icon: '📤', description: 'Upload a video' },
      { href: '/camera', label: 'Camera', icon: '📸', description: 'Record now' },
      { href: '/creator', label: 'Creator Studio', icon: '🎬', description: 'Manage your content' },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    items: [
      { href: '/collab', label: 'Collab Rooms', icon: '🤝', description: 'Create together' },
      { href: '/watch-party', label: 'Watch Party', icon: '🎉', description: 'Watch with friends' },
      { href: '/challenges', label: 'Challenges', icon: '🏆', description: 'Join trending challenges' },
    ],
  },
  {
    id: 'library',
    label: 'Library',
    items: [
      { href: '/collections', label: 'Collections', icon: '📁', description: 'Your saved playlists' },
      { href: '/liked', label: 'Liked Videos', icon: '❤️', description: 'Videos you loved' },
      { href: '/history', label: 'Watch History', icon: '🕐', description: 'Recently watched' },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    items: [
      { href: '/messages', label: 'Messages', icon: '💬', description: 'Direct messages' },
      { href: '/capsule', label: 'Time Capsules', icon: '⏰', description: 'Messages to the future' },
      { href: '/alerts', label: 'Alerts', icon: '🔔', description: 'System notifications' },
    ],
  },
  {
    id: 'earn',
    label: 'Earn',
    items: [
      { href: '/coins', label: 'VIB3 Coins', icon: '🪙', description: 'Your coin balance' },
      { href: '/creator-fund', label: 'Creator Fund', icon: '💰', description: 'Monetization' },
      { href: '/shop', label: 'Shop', icon: '🛍️', description: 'Buy and sell' },
      { href: '/analytics', label: 'Analytics', icon: '📊', description: 'Your stats' },
    ],
  },
];

function Dropdown({ config, isOpen, onToggle }: {
  config: DropdownConfig;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isActive = config.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive || isOpen
            ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white border border-white/20'
            : 'glass text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span>{config.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[220px] glass-heavy rounded-2xl border border-white/10 shadow-xl overflow-hidden z-[100] animate-in">
          <div className="py-2">
            {config.items.map((item) => {
              const isItemActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block w-full px-4 py-3 transition-colors cursor-pointer ${
                    isItemActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-white/40">{item.description}</div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedCategoryDropdown({ isOpen, onToggle, onClose }: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    categories,
    selectedCategory,
    selectCategory,
    categoryCounts,
    initialize,
  } = useFeedCategoryStore();

  // Initialize categories on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const isActive = pathname === '/feed' || pathname.startsWith('/feed/');

  const handleSelectCategory = (category: FeedCategory) => {
    selectCategory(category);
    onClose();
    // Navigate to feed if not already there
    if (pathname !== '/feed') {
      router.push('/feed');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive || isOpen
            ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white border border-white/20'
            : 'glass text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span>{selectedCategory?.icon || '✨'}</span>
        <span>Feed</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] glass-heavy rounded-2xl border border-white/10 shadow-xl overflow-hidden z-[100] animate-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-white/50 text-xs uppercase tracking-wider">Feed Categories</span>
            <a
              href="/settings/categories"
              className="text-purple-400 text-xs hover:text-purple-300 transition-colors"
            >
              Manage
            </a>
          </div>

          {/* Categories list */}
          <div className="py-2 max-h-[400px] overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategory?.id === category.id;
              const userCount = categoryCounts[category.id] || 0;

              return (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Icon with category color */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>

                  {/* Category info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {category.name}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {/* Description based on category type */}
                    <span className="text-white/40 text-xs">
                      {category.id === 'foryou' && 'Personalized for you'}
                      {category.id === 'following' && 'Everyone you follow'}
                      {category.id === 'friends' && 'Mutual follows only'}
                      {(category.type === 'default' || category.type === 'custom') && category.id !== 'friends' && (
                        `${userCount} ${userCount === 1 ? 'person' : 'people'}`
                      )}
                    </span>
                  </div>

                  {/* Custom badge */}
                  {category.type === 'custom' && (
                    <span className="px-2 py-0.5 text-[10px] uppercase text-purple-400 bg-purple-500/20 rounded-full flex-shrink-0">
                      Custom
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider and extra links */}
          <div className="border-t border-white/10 py-2">
            <a
              href="/discover"
              className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🔍</span>
                <div>
                  <div className="font-medium">Discover</div>
                  <div className="text-xs text-white/40">Explore trending content</div>
                </div>
              </div>
            </a>
            <a
              href="/live"
              className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📡</span>
                <div>
                  <div className="font-medium">LIVE</div>
                  <div className="text-xs text-white/40">Watch live streams</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ isOpen, onToggle }: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isAdmin = user?.isAdmin || user?.role === 'admin';

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`w-10 h-10 rounded-full overflow-hidden transition-all duration-200 cursor-pointer ${
          isOpen ? 'ring-2 ring-purple-500' : 'hover:ring-2 hover:ring-white/30'
        }`}
      >
        {isAuthenticated && user?.profilePicture ? (
          <Image src={user.profilePicture} alt={user.username} width={40} height={40} className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold">
            {isAuthenticated && user?.username ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[220px] glass-heavy rounded-2xl border border-white/10 shadow-xl overflow-hidden z-[100] animate-in">
          {isAuthenticated && user ? (
            <>
              <div className="p-4 border-b border-white/10">
                <div className="text-white font-semibold">{user.username}</div>
                <div className="text-white/50 text-sm">{user.email}</div>
              </div>
              <div className="py-2">
                <a href="/profile" className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <div className="flex items-center gap-3">
                    <span>👤</span>
                    <span>Your Profile</span>
                  </div>
                </a>
                <a href="/settings" className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <div className="flex items-center gap-3">
                    <span>⚙️</span>
                    <span>Settings</span>
                  </div>
                </a>
                <a href="/notifications" className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <div className="flex items-center gap-3">
                    <span>🔔</span>
                    <span>Notifications</span>
                  </div>
                </a>
                {isAdmin && (
                  <a href="/admin" className="block w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <span>🛡️</span>
                      <span>Admin Dashboard</span>
                    </div>
                  </a>
                )}
                <div className="h-px bg-white/10 my-2" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-left">
                  <span>🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-white/50 text-sm mb-3">Sign in to access your account</p>
              <a
                href="/login"
                className="inline-block w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white text-sm font-medium text-center"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TopNav() {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdown when clicking outside the nav
  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };

    // Use click event (not mousedown) so links navigate first
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const handleToggle = (id: string) => {
    setOpenDropdown(prev => prev === id ? null : id);
  };

  const handleClose = () => {
    setOpenDropdown(null);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="Go Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
            <Image
              src="/vib3-logo.png"
              alt="VIB3"
              fill
              className="object-contain"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))'
              }}
              priority
            />
          </div>
        </Link>

        {/* Dropdown Nav - Desktop */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          {/* Feed Category Dropdown - first */}
          <FeedCategoryDropdown
            isOpen={openDropdown === 'feed'}
            onToggle={() => handleToggle('feed')}
            onClose={handleClose}
          />
          {DROPDOWNS.map((config) => (
            <Dropdown
              key={config.id}
              config={config}
              isOpen={openDropdown === config.id}
              onToggle={() => handleToggle(config.id)}
              onClose={handleClose}
            />
          ))}
        </div>

        {/* Quick Actions + Profile */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SoundToggle />
          <ProfileDropdown
            isOpen={openDropdown === 'profile'}
            onToggle={() => handleToggle('profile')}
            onClose={handleClose}
          />
        </div>
      </div>

      {/* Mobile Nav - Scrollable */}
      <div className="md:hidden overflow-x-auto scrollbar-hide border-t border-white/5">
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Feed Category Dropdown - first */}
          <FeedCategoryDropdown
            isOpen={openDropdown === 'feed'}
            onToggle={() => handleToggle('feed')}
            onClose={handleClose}
          />
          {DROPDOWNS.map((config) => (
            <Dropdown
              key={config.id}
              config={config}
              isOpen={openDropdown === config.id}
              onToggle={() => handleToggle(config.id)}
              onClose={handleClose}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
