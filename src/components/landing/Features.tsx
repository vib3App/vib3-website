/**
 * Landing page features section
 * Grid of feature cards with 3D effects and scroll animations
 */
'use client';

import { CardElevated } from '@/components/ui/Card3D';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/motion';

const features = [
  {
    icon: '🎬',
    title: 'Create Videos',
    description: 'Powerful editing tools, AR filters, music library, and effects to make your content stand out.',
    gradient: 'from-purple-500 to-purple-400',
  },
  {
    icon: '📡',
    title: 'Go Live',
    description: 'Stream to your followers in real-time. Receive gifts, interact with comments, and grow your audience.',
    gradient: 'from-teal-500 to-cyan-400',
  },
  {
    icon: '🎵',
    title: 'Echo & Remix',
    description: 'React to videos with Echo or create Remixes using other creators\' content with proper attribution.',
    gradient: 'from-[#F97316] to-[#FB923C]',
  },
  {
    icon: '💰',
    title: 'Creator Fund (Coming Soon)',
    description: 'Monetize your content through tips, subscriptions, and the VIB3 Creator Fund.',
    gradient: 'from-[#10B981] to-[#34D399]',
  },
  {
    icon: '🤝',
    title: 'Collaborate',
    description: 'Join collaboration rooms, create content together, and build connections with creators worldwide.',
    gradient: 'from-[#EC4899] to-[#F472B6]',
  },
  {
    icon: '🔒',
    title: 'Safe & Secure',
    description: 'Your privacy matters. Enhanced safety features, parental controls, and COPPA compliance.',
    gradient: 'from-[#8B5CF6] to-[#A78BFA]',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Everything you need to </span>
              <span className="bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">
                go viral
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              From powerful creation tools to real monetization, VIB3 gives creators everything they need to succeed.
            </p>
          </div>
        </FadeUp>

        {/* Features grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <CardElevated
                glowColor={index % 3 === 0 ? 'purple' : index % 3 === 1 ? 'teal' : 'orange'}
                className="group p-8 h-full"
              >
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg float-bob`} style={{ animationDelay: `${index * 0.2}s` }}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </CardElevated>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
