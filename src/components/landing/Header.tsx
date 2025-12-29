/**
 * Landing page header component
 * Logo + navigation
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SoundToggle } from '@/components/audio';
import { ThemeToggle } from '@/components/personalization';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-12 h-12 group-hover:scale-105 transition-transform">
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

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#creators" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Creators
          </a>
          <a href="https://vib3app.net/community-guidelines.html" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Guidelines
          </a>
          <a href="https://vib3app.net/contact.html" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Contact
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SoundToggle />
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-500 hover:to-teal-400 rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            Sign In
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
