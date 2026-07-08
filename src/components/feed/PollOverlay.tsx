'use client';

import type { VideoInteraction } from '@/types/video';

/**
 * Read-only poll/quiz overlay for the web feed. The mobile app is interactive
 * (tap to vote); on web we show the poll statically with a "Vote in the app"
 * hint. The quiz answer is never in the payload (server-gated), so it can't leak
 * here. Positioned by normalized coords within the video container.
 */
export function PollOverlay({ interactions }: { interactions?: VideoInteraction[] }) {
  const polls = (interactions ?? []).filter(
    (i) => i.type === 'poll' || i.type === 'quiz'
  );
  if (polls.length === 0) return null;

  return (
    <>
      {polls.map((p) => (
        <div
          key={p.id}
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${(p.x ?? 0.5) * 100}%`,
            top: `${(p.y ?? 0.5) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 'min(80%, 320px)',
          }}
        >
          <div className="rounded-2xl border border-white/15 bg-black/55 p-3 backdrop-blur-sm">
            {p.question && (
              <p className="mb-2 line-clamp-3 text-sm font-semibold text-white">
                {p.question}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {p.options.map((opt, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-white/[0.12] px-3 py-2 text-sm text-white"
                >
                  {opt}
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-white/60">
              Vote in the VIB3 app
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
