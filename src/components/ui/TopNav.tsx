'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/personalization';
import { DROPDOWNS, Dropdown, FeedCategoryDropdown, Vib3MeterDropdown, ProfileDropdown } from './top-nav';

export function TopNav() {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const handleToggle = (id: string) => setOpenDropdown(prev => prev === id ? null : id);
  const handleClose = () => setOpenDropdown(null);
  const handleBack = () => router.back();

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Back Button */}
        <button onClick={handleBack} className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Go Back">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
            <Image src="/vib3-logo.png" alt="VIB3" fill className="object-contain" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))' }} priority />
          </div>
        </Link>

        {/* Dropdown Nav - Desktop */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <FeedCategoryDropdown isOpen={openDropdown === 'feed'} onToggle={() => handleToggle('feed')} onClose={handleClose} />
          <Vib3MeterDropdown isOpen={openDropdown === 'vib3meter'} onToggle={() => handleToggle('vib3meter')} onClose={handleClose} />
          {DROPDOWNS.map((config) => (
            <Dropdown key={config.id} config={config} isOpen={openDropdown === config.id} onToggle={() => handleToggle(config.id)} />
          ))}
        </div>

        {/* Quick Actions + Profile */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfileDropdown isOpen={openDropdown === 'profile'} onToggle={() => handleToggle('profile')} />
        </div>
      </div>

      {/* Mobile Nav - Scrollable */}
      <div className="md:hidden overflow-x-auto scrollbar-hide border-t border-white/5">
        <div className="flex items-center gap-2 px-4 py-2">
          <FeedCategoryDropdown isOpen={openDropdown === 'feed'} onToggle={() => handleToggle('feed')} onClose={handleClose} />
          <Vib3MeterDropdown isOpen={openDropdown === 'vib3meter'} onToggle={() => handleToggle('vib3meter')} onClose={handleClose} />
          {DROPDOWNS.map((config) => (
            <Dropdown key={config.id} config={config} isOpen={openDropdown === config.id} onToggle={() => handleToggle(config.id)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
