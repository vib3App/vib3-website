/**
 * Landing page hero section
 * Main headline, description, CTA buttons
 */
'use client';

import { AppStoreButtons } from './AppStoreButtons';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1F2E] rounded-full border border-white/10 mb-8">
          <span className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse" />
          <span className="text-sm text-white/70">The future of social video</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="text-white">Create. Share.</span>
          <br />
          <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#14B8A6] bg-clip-text text-transparent">
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
          <button className="px-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-[#6366F1]/30 hover:scale-105">
            Start Creating
          </button>
          <button className="px-8 py-4 bg-[#1A1F2E] border border-white/10 hover:border-[#6366F1]/50 rounded-xl font-semibold text-lg transition-all hover:bg-[#1A1F2E]/80">
            Watch Demo
          </button>
        </div>

        {/* App Store Buttons */}
        <AppStoreButtons />

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-16 pt-16 border-t border-white/5">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">
              10M+
            </div>
            <div className="text-white/50 text-sm mt-1">Active Creators</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">
              500M+
            </div>
            <div className="text-white/50 text-sm mt-1">Videos Shared</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">
              $50M+
            </div>
            <div className="text-white/50 text-sm mt-1">Paid to Creators</div>
          </div>
        </div>
      </div>
    </section>
  );
}
