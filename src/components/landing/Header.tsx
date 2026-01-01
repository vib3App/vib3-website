/**
 * Landing page header component
 * Logo + navigation
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SoundToggle } from '@/components/audio';
import { ThemeToggle } from '@/components/personalization';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.isAdmin || user?.role === 'admin';

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#creators" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Creators
          </a>
          <Link href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Privacy
          </Link>
          <Link href="/terms" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Terms
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SoundToggle />
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/feed"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-500 hover:to-teal-400 rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              >
                Go to Feed
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-500 hover:to-teal-400 rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-neutral-900/95 backdrop-blur-lg border-t border-white/5">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            <a
              href="#features"
              className="text-white/60 hover:text-white transition-colors text-sm font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#creators"
              className="text-white/60 hover:text-white transition-colors text-sm font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Creators
            </a>
            <Link
              href="/privacy"
              className="text-white/60 hover:text-white transition-colors text-sm font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-white/60 hover:text-white transition-colors text-sm font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Terms
            </Link>
            <div className="flex items-center gap-4 py-2">
              <ThemeToggle />
              <SoundToggle />
            </div>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/feed"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-500 hover:to-teal-400 rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Go to Feed
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-500 hover:to-teal-400 rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
