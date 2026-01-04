/**
 * Landing page hero section
 * Main headline, description, CTA buttons with Framer Motion
 */
'use client';

import { AppStoreButtons } from './AppStoreButtons';
import { FadeUp, AnimatedButton, AnimatedStat, ScaleUp, StaggerContainer } from '@/components/motion';
import { ParticleField } from '@/components/3d';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { MoodIndicator } from '@/components/ai';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* 3D Particle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleField count={50} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Animated Logo */}
        <ScaleUp>
          <div className="w-32 h-32 mx-auto mb-8">
            <AnimatedLogo size={128} />
          </div>
        </ScaleUp>

        {/* Badge with Mood Indicator */}
        <FadeUp delay={0.1}>
          <div className="inline-flex items-center gap-4 px-4 py-2 glass rounded-full border border-white/10 mb-8 float-gentle">
            <MoodIndicator showLabel={false} />
            <span className="text-sm text-white/70">The future of social video</span>
            <span className="w-2 h-2 bg-teal-400 rounded-full breathe" />
          </div>
        </FadeUp>

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

        {/* CTA Button */}
        <FadeUp delay={0.2}>
          <div className="flex items-center justify-center mb-12">
            <AnimatedButton variant="primary" className="px-10 py-4 text-lg glow-pulse">
              Start Creating
            </AnimatedButton>
          </div>
        </FadeUp>

        {/* App Store Buttons */}
        <AppStoreButtons />

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-16 pt-16 border-t border-white/5">
          <AnimatedStat value={10000000} suffix="+" label="Active Creators" className="float-gentle" />
          <AnimatedStat value={500000000} suffix="+" label="Videos Shared" className="float-gentle" />
          <AnimatedStat value={50000000} prefix="$" suffix="+" label="Paid to Creators" className="float-gentle" />
        </div>
      </div>
    </section>
  );
}
