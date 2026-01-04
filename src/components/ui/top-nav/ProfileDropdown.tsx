'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

interface ProfileDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ProfileDropdown({ isOpen, onToggle }: ProfileDropdownProps) {
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
                  <div className="flex items-center gap-3"><span>👤</span><span>Your Profile</span></div>
                </a>
                <a href="/settings" className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <div className="flex items-center gap-3"><span>⚙️</span><span>Settings</span></div>
                </a>
                <a href="/notifications" className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <div className="flex items-center gap-3"><span>🔔</span><span>Notifications</span></div>
                </a>
                {isAdmin && (
                  <a href="/admin" className="block w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                    <div className="flex items-center gap-3"><span>🛡️</span><span>Admin Dashboard</span></div>
                  </a>
                )}
                <div className="h-px bg-white/10 my-2" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-left">
                  <span>🚪</span><span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-white/50 text-sm mb-3">Sign in to access your account</p>
              <a href="/login" className="inline-block w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white text-sm font-medium text-center">
                Sign In
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
