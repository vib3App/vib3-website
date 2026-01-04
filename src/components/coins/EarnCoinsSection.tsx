'use client';

interface EarnOption {
  icon: string;
  gradient: string;
  borderHover: string;
  title: string;
  description: string;
  reward: string;
}

const EARN_OPTIONS: EarnOption[] = [
  {
    icon: '📹',
    gradient: 'from-pink-500 to-purple-500',
    borderHover: 'hover:border-pink-500/30',
    title: 'Create Viral Content',
    description: 'Earn up to 1000 coins per viral video',
    reward: '+1000',
  },
  {
    icon: '👥',
    gradient: 'from-blue-500 to-cyan-500',
    borderHover: 'hover:border-cyan-500/30',
    title: 'Invite Friends',
    description: 'Get 50 coins for each friend who joins',
    reward: '+50',
  },
  {
    icon: '✅',
    gradient: 'from-green-500 to-emerald-500',
    borderHover: 'hover:border-green-500/30',
    title: 'Daily Check-in',
    description: 'Earn 5-25 coins daily just for opening the app',
    reward: '+5-25',
  },
  {
    icon: '🏆',
    gradient: 'from-amber-500 to-orange-500',
    borderHover: 'hover:border-amber-500/30',
    title: 'Complete Challenges',
    description: 'Participate in weekly challenges for coins',
    reward: '+100-500',
  },
];

export function EarnCoinsSection() {
  return (
    <div className="space-y-4">
      {EARN_OPTIONS.map((option) => (
        <div key={option.title} className={`glass-card p-6 ${option.borderHover}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center text-2xl`}>
              {option.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{option.title}</h3>
              <p className="text-white/50">{option.description}</p>
            </div>
            <div className="ml-auto px-3 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-full">
              {option.reward}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
