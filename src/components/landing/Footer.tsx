/**
 * Landing page footer
 * Links, legal, copyright
 */
'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 aurora-bg">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center font-bold text-xl">
                V
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">
                VIB3
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              The next-generation social video platform where creators thrive.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-white/40 hover:text-white text-sm transition-colors">Features</a>
              </li>
              <li>
                <a href="#creators" className="text-white/40 hover:text-white text-sm transition-colors">For Creators</a>
              </li>
              <li>
                <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Download App</a>
              </li>
              <li>
                <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Creator Fund</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://vib3app.net/privacy.html" className="text-white/40 hover:text-white text-sm transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="https://vib3app.net/terms.html" className="text-white/40 hover:text-white text-sm transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="https://vib3app.net/community-guidelines.html" className="text-white/40 hover:text-white text-sm transition-colors">Community Guidelines</a>
              </li>
              <li>
                <a href="https://vib3app.net/dmca.html" className="text-white/40 hover:text-white text-sm transition-colors">DMCA</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://vib3app.net/contact.html" className="text-white/40 hover:text-white text-sm transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="https://vib3app.net/parental-consent.html" className="text-white/40 hover:text-white text-sm transition-colors">For Parents</a>
              </li>
              <li>
                <a href="https://vib3app.net/data-deletion.html" className="text-white/40 hover:text-white text-sm transition-colors">Data Deletion</a>
              </li>
              <li>
                <a href="mailto:support@vib3app.net" className="text-white/40 hover:text-white text-sm transition-colors">support@vib3app.net</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            &copy; 2025 Docs Marketplace LLC. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/40 hover:text-white hover:bg-purple-500/20 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/40 hover:text-white hover:bg-purple-500/20 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/40 hover:text-white hover:bg-purple-500/20 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
