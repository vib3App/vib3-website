/**
 * Landing page footer
 * Links, legal, copyright
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-white/5 aurora-bg">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative w-14 h-14 group-hover:scale-105 transition-transform">
                <Image
                  src="/vib3-logo.png"
                  alt="VIB3"
                  fill
                  className="object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))'
                  }}
                />
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Built for creators, by a creator. Where your voice matters.
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
                <span className="text-white/40 text-sm">Download App <span className="text-purple-400 text-xs">(Coming Soon)</span></span>
              </li>
              <li>
                <span className="text-white/40 text-sm">Creator Fund <span className="text-purple-400 text-xs">(Coming Soon)</span></span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="text-white/40 hover:text-white text-sm transition-colors">Community Guidelines</Link>
              </li>
              <li>
                <Link href="/dmca" className="text-white/40 hover:text-white text-sm transition-colors">DMCA</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-white/40 hover:text-white text-sm transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/help" className="text-white/40 hover:text-white text-sm transition-colors">Help Center</Link>
              </li>
              <li>
                <Link href="/safety" className="text-white/40 hover:text-white text-sm transition-colors">Safety Center</Link>
              </li>
              <li>
                <a href="mailto:vibe@docsmarketplacellc.com" className="text-white/40 hover:text-white text-sm transition-colors">vibe@docsmarketplacellc.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            &copy; 2025 Docs Marketplace LLC. All rights reserved.
          </p>

          {/* Social links - Coming Soon */}
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <span>Follow us</span>
            <span className="text-purple-400 text-xs">(Coming Soon)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
