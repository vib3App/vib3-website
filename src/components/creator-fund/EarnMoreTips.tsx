'use client';

const TIPS = [
  {
    emoji: '📈',
    title: 'Post Consistently',
    description: 'Upload at least 3-5 videos per week to maintain engagement and grow your audience.',
  },
  {
    emoji: '🎯',
    title: 'Join Challenges',
    description: 'Participate in trending challenges to increase your visibility and reach new audiences.',
  },
  {
    emoji: '💬',
    title: 'Engage with Community',
    description: 'Reply to comments and collaborate with other creators to build stronger connections.',
  },
];

export function EarnMoreTips() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Tips to Earn More</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIPS.map((tip) => (
          <div key={tip.title} className="glass-card p-6 hover:border-green-500/30">
            <div className="text-3xl mb-3">{tip.emoji}</div>
            <h3 className="text-white font-semibold mb-2">{tip.title}</h3>
            <p className="text-white/50 text-sm">{tip.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
