'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

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
    id: 'feed',
    label: 'Feed',
    items: [
      { href: '/feed', label: 'For You', icon: '✨', description: 'Personalized for you' },
      { href: '/following', label: 'Following', icon: '👥', description: 'From people you follow' },
      { href: '/discover', label: 'Discover', icon: '🔍', description: 'Explore trending content' },
      { href: '/live', label: 'LIVE', icon: '📡', description: 'Watch live streams' },
    ],
  },
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

function Dropdown({ config, isOpen, onToggle, onClose }: {
  config: DropdownConfig;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isActive = config.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleItemClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div ref={dropdownRef} className="relative">
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
                <button
                  key={item.href}
                  onClick={() => handleItemClick(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                    isItemActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-white/40">{item.description}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FollowingDropdown({ isOpen, onToggle, onClose }: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  // TODO: Load actual following list
  const following = [
    { id: '1', username: 'creator1', avatar: null },
    { id: '2', username: 'creator2', avatar: null },
    { id: '3', username: 'creator3', avatar: null },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white border border-white/20'
            : 'glass text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span>Following</span>
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
          <div className="p-3 border-b border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider">People you follow</div>
          </div>
          {!isAuthenticated ? (
            <div className="p-4 text-center">
              <p className="text-white/50 text-sm mb-3">Sign in to see who you follow</p>
              <button
                onClick={() => handleNavigate('/login')}
                className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white text-sm font-medium"
              >
                Sign In
              </button>
            </div>
          ) : following.length === 0 ? (
            <div className="p-4 text-center text-white/50 text-sm">
              You're not following anyone yet
            </div>
          ) : (
            <div className="py-2 max-h-[300px] overflow-y-auto">
              {following.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleNavigate(`/profile/${user.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.username} width={40} height={40} className="rounded-full" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-white font-medium">@{user.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ isOpen, onToggle, onClose }: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/');
    onClose();
  };

  return (
    <div ref={dropdownRef} className="relative">
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
            {isAuthenticated && user ? user.username.charAt(0).toUpperCase() : '?'}
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
                <button onClick={() => { onClose(); router.push('/profile'); }} className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-left">
                  <span>👤</span>
                  <span>Your Profile</span>
                </button>
                <button onClick={() => { onClose(); router.push('/settings'); }} className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-left">
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
                <button onClick={() => { onClose(); router.push('/notifications'); }} className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-left">
                  <span>🔔</span>
                  <span>Notifications</span>
                </button>
                <div className="h-px bg-white/10 my-2" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors">
                  <span>🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-white/50 text-sm mb-3">Sign in to access your account</p>
              <Link
                href="/login"
                onClick={onClose}
                className="inline-block w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white text-sm font-medium text-center"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TopNav() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenDropdown(prev => prev === id ? null : id);
  };

  const handleClose = () => {
    setOpenDropdown(null);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
            V
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent hidden sm:block">
            VIB3
          </span>
        </Link>

        {/* Dropdown Nav - Desktop */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          {DROPDOWNS.map((config) => (
            <Dropdown
              key={config.id}
              config={config}
              isOpen={openDropdown === config.id}
              onToggle={() => handleToggle(config.id)}
              onClose={handleClose}
            />
          ))}
          <FollowingDropdown
            isOpen={openDropdown === 'following'}
            onToggle={() => handleToggle('following')}
            onClose={handleClose}
          />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3">
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
          {DROPDOWNS.map((config) => (
            <Dropdown
              key={config.id}
              config={config}
              isOpen={openDropdown === config.id}
              onToggle={() => handleToggle(config.id)}
              onClose={handleClose}
            />
          ))}
          <FollowingDropdown
            isOpen={openDropdown === 'following'}
            onToggle={() => handleToggle('following')}
            onClose={handleClose}
          />
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
