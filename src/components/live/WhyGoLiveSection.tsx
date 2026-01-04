'use client';

import type { ReactNode } from 'react';

const FEATURES = [
  { icon: 'users', color: 'purple', title: 'Multi-Guest Support', description: 'Invite up to 4 guests to join your live stream' },
  { icon: 'money', color: 'teal', title: 'Earn While You Stream', description: 'Receive virtual gifts from viewers' },
  { icon: 'chat', color: 'pink', title: 'Live Chat & Reactions', description: 'Engage with real-time chat and reactions' },
];

const ICONS: Record<string, ReactNode> = {
  users: (
    <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  money: (
    <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chat: (
    <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
};

const COLORS: Record<string, string> = {
  purple: 'bg-purple-500/20',
  teal: 'bg-teal-500/20',
  pink: 'bg-pink-500/20',
};

export function WhyGoLiveSection() {
  return (
    <section className="mt-12 pt-12 border-t border-white/5">
      <h2 className="text-white font-semibold text-lg mb-6 text-center">Why Go Live on VIB3?</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <div key={feature.icon} className="text-center p-6 glass-card rounded-2xl">
            <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${COLORS[feature.color]} flex items-center justify-center`}>
              {ICONS[feature.icon]}
            </div>
            <h3 className="text-white font-medium mb-2">{feature.title}</h3>
            <p className="text-white/50 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
