'use client';

import {
  HeartIcon as HeartSolidIcon,
  FireIcon,
  HandThumbUpIcon,
  FaceSmileIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

interface FloatingReaction {
  id: string;
  type: string;
  x: number;
}

interface LiveFloatingReactionsProps {
  reactions: FloatingReaction[];
}

export function LiveFloatingReactions({ reactions }: LiveFloatingReactionsProps) {
  return (
    <div className="absolute bottom-20 right-4 w-16 h-64 pointer-events-none overflow-hidden">
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute animate-float-up"
          style={{ left: `${reaction.x}%`, bottom: 0 }}
        >
          <ReactionIcon type={reaction.type} />
        </div>
      ))}
    </div>
  );
}

function ReactionIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: typeof HeartSolidIcon | null; color: string; emoji?: string }> = {
    like: { icon: HandThumbUpIcon, color: 'text-blue-400' },
    heart: { icon: HeartSolidIcon, color: 'text-red-500' },
    fire: { icon: FireIcon, color: 'text-orange-500' },
    laugh: { icon: FaceSmileIcon, color: 'text-yellow-400' },
    wow: { icon: SparklesIcon, color: 'text-purple-400' },
    clap: { icon: null, color: '', emoji: '👏' },
  };

  const config = icons[type];
  if (!config) return null;

  if (config.emoji) {
    return <span className="text-2xl">{config.emoji}</span>;
  }

  const Icon = config.icon;
  if (!Icon) return null;
  return <Icon className={`w-6 h-6 ${config.color}`} />;
}
