'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';
import { SidebarSearch } from './SidebarSearch';
import { FollowingAccounts } from './FollowingAccounts';
import { EnergyMeter } from './EnergyMeter';
import { ThemeToggle } from '@/components/personalization';
import { NavIcon, mainNavItems, featureNavItems, creatorNavItems, moreNavItems } from './side-nav';

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showMore, setShowMore] = useState(false);
  const [showEnergyMeter, setShowEnergyMeter] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/');
  };

  const handleLogoClick = () => {
    if (pathname === '/feed') {
      window.location.reload();
    } else {
      router.push('/feed');
    }
  };

  const renderNavItem = (item: typeof mainNavItems[0], isActive: boolean, gradientClass = 'from-purple-500/20 to-teal-500/20') => (
    <Link
      key={item.href}
      href={item.href}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
        isActive ? 'text-white font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {isActive && <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-xl border border-white/10`} />}
      <span className="relative"><NavIcon name={item.icon} active={isActive} /></span>
      <span className="relative">{item.label}</span>
      {item.badge && (
        <span className="relative ml-auto px-2 py-0.5 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full animate-pulse">LIVE</span>
      )}
    </Link>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass-heavy border-r border-white/10 overflow-y-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div onClick={handleLogoClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLogoClick(); } }} className="relative flex items-center gap-3 px-6 py-5 mb-2 cursor-pointer group">
          <div className="relative w-12 h-12 group-hover:scale-105 transition-transform">
            <Image src="/vib3-logo.png" alt="VIB3" fill className="object-contain" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 24px rgba(34, 211, 238, 0.2))' }} priority />
          </div>
        </div>

        <SidebarSearch />

        <nav className="relative flex-1 px-3 space-y-1">
          {mainNavItems.map((item) => renderNavItem(item, pathname === item.href))}

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />
          <div className="px-3 py-1 text-xs text-white/30 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />Features
          </div>
          {featureNavItems.map((item) => renderNavItem(item, pathname === item.href || pathname.startsWith(item.href + '/'), 'from-purple-500/15 to-teal-500/15'))}

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />
          <div className="px-3 py-1 text-xs text-white/30 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50" />Create
          </div>
          {creatorNavItems.map((item) => (
            <Link key={item.href} href={isAuthenticated ? item.href : '/login'} className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${pathname === item.href ? 'text-white font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              {pathname === item.href && <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 to-purple-500/15 rounded-xl border border-white/10" />}
              <span className="relative"><NavIcon name={item.icon} active={pathname === item.href} /></span>
              <span className="relative text-sm">{item.label}</span>
            </Link>
          ))}

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

          <button onClick={() => setShowMore(!showMore)} className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all">
            <div className="flex items-center gap-3"><NavIcon name="more" active={false} /><span className="text-sm">More</span></div>
            <svg className={`w-4 h-4 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMore && (
            <div className="pl-3 space-y-1">
              {moreNavItems.map((item) => (
                <Link key={item.href} href={isAuthenticated ? item.href : '/login'} className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${pathname === item.href ? 'text-white font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                  {pathname === item.href && <div className="absolute inset-0 bg-white/10 rounded-xl border border-white/10" />}
                  <span className="relative"><NavIcon name={item.icon} active={pathname === item.href} /></span>
                  <span className="relative text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          <button onClick={() => setShowEnergyMeter(true)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all w-full group">
            <NavIcon name="energy" active={false} />
            <span className="text-sm">Energy Meter</span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-teal-400 animate-pulse" />
              <span className="text-xs text-green-400/70 group-hover:text-green-400">Active</span>
            </div>
          </button>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />
          <FollowingAccounts />
        </nav>

        <div className="relative px-3 py-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              <span>Theme</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="relative p-3 border-t border-white/10">
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <Link href="/profile" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-teal-500 p-0.5">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-neutral-900">
                      {user.profilePicture ? (
                        <Image src={user.profilePicture} alt={user.username} width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">{(user.username || 'U').charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{user.username}</div>
                  <div className="text-white/40 text-sm truncate group-hover:text-purple-400 transition-colors">View profile</div>
                </div>
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="relative flex items-center justify-center gap-2 p-3 rounded-xl overflow-hidden group glow-button">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-white font-semibold">Log in</span>
            </Link>
          )}
        </div>
      </aside>

      <EnergyMeter isOpen={showEnergyMeter} onClose={() => setShowEnergyMeter(false)} />
    </>
  );
}
