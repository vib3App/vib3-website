'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { ScheduledPostCard } from '@/components/scheduled/ScheduledPostCard';
import { RescheduleDialog } from '@/components/scheduled/RescheduleDialog';
import type { ScheduledPost } from '@/types/upload';

function Banner({ text, tone, onDismiss }: { text: string; tone: 'success' | 'error'; onDismiss: () => void }) {
  const color = tone === 'success' ? 'bg-teal-500/20 text-teal-200 border-teal-500/30' : 'bg-red-500/20 text-red-200 border-red-500/30';
  return (
    <div className={`mb-4 rounded-xl px-4 py-2 border ${color} flex justify-between items-center`}>
      <span className="text-sm">{text}</span>
      <button onClick={onDismiss} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
    </div>
  );
}

function CancelConfirmDialog({
  post,
  onClose,
  onConfirm,
}: {
  post: ScheduledPost | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!post) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="glass-heavy rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">Cancel scheduled post?</h2>
        <p className="text-sm text-white/70 mb-5">
          This permanently deletes the queued video. You can re-upload to schedule again.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-white/60 hover:text-white">Keep</button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
          >
            Cancel post
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScheduledPostsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const { posts, loading, busyId, banner, clearBanner, refresh, publishNow, reschedule, cancel } = useScheduledPosts();

  const [rescheduling, setRescheduling] = useState<ScheduledPost | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    if (isAuthVerified && !isAuthenticated) {
      router.push('/login?redirect=/creator/scheduled');
    }
  }, [isAuthenticated, isAuthVerified, router]);

  if (!isAuthVerified) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 backdrop-blur bg-black/60 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-white/60 hover:text-white"
              aria-label="Back"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Scheduled posts</h1>
          </div>
          <button
            onClick={() => void refresh()}
            className="text-white/60 hover:text-white p-1"
            aria-label="Refresh"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {banner && <Banner text={banner.text} tone={banner.tone} onDismiss={clearBanner} />}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex w-14 h-14 mb-3 rounded-full bg-white/5 items-center justify-center text-white/30">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-lg text-white/80 mb-1">Nothing scheduled</h2>
            <p className="text-sm text-white/40 max-w-xs mx-auto">
              Schedule a post from the share screen and it will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <ScheduledPostCard
                key={post.id}
                post={post}
                busy={busyId === post.id}
                onPublishNow={() => void publishNow(post)}
                onReschedule={() => setRescheduling(post)}
                onCancel={() => setConfirmingCancel(post)}
              />
            ))}
          </div>
        )}
      </div>

      {rescheduling && (
        <RescheduleDialog
          key={rescheduling.id}
          post={rescheduling}
          onClose={() => setRescheduling(null)}
          onConfirm={(when) => {
            const target = rescheduling;
            setRescheduling(null);
            void reschedule(target, when);
          }}
        />
      )}

      <CancelConfirmDialog
        post={confirmingCancel}
        onClose={() => setConfirmingCancel(null)}
        onConfirm={() => {
          const target = confirmingCancel;
          setConfirmingCancel(null);
          if (target) void cancel(target);
        }}
      />
    </main>
  );
}
