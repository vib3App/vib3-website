/**
 * Landing page hero section
 * Main headline, description, CTA buttons
 */
'use client';

import { AppStoreButtons } from './AppStoreButtons';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10 mb-8 float-gentle">
          <span className="w-2 h-2 bg-teal-400 rounded-full breathe" />
          <span className="text-sm text-white/70">The future of social video</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="text-white">Create. Share.</span>
          <br />
          <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-teal-400 bg-clip-text text-transparent">
            Go Viral.
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          The next-generation platform where creators thrive.
          Powerful tools, real monetization, and a community that celebrates authenticity.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-teal-400 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 glow-pulse btn-magnetic">
            Start Creating
          </button>
          <button className="px-8 py-4 glass border border-white/10 hover:border-purple-500/50 rounded-xl font-semibold text-lg transition-all hover:bg-white/10 btn-magnetic">
            Watch Demo
          </button>
        </div>

        {/* App Store Buttons */}
        <AppStoreButtons />

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-16 pt-16 border-t border-white/5">
          <div className="text-center float-gentle" style={{ animationDelay: '0s' }}>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent breathe-glow">
              10M+
            </div>
            <div className="text-white/50 text-sm mt-1">Active Creators</div>
          </div>
          <div className="text-center float-gentle" style={{ animationDelay: '0.5s' }}>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent breathe-glow">
              500M+
            </div>
            <div className="text-white/50 text-sm mt-1">Videos Shared</div>
          </div>
          <div className="text-center float-gentle" style={{ animationDelay: '1s' }}>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent breathe-glow">
              $50M+
            </div>
            <div className="text-white/50 text-sm mt-1">Paid to Creators</div>
          </div>
        </div>
      </div>
    </section>
  );
}
