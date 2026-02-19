'use client';

import Link from 'next/link';
import { PlusIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCapsules } from '@/hooks/useCapsules';
import { useCapsuleDelivery } from '@/hooks/useCapsuleDelivery';
import { CapsuleCard, CapsuleTabs } from '@/components/capsules';

export default function CapsulePage() {
  const c = useCapsules();
  const delivery = useCapsuleDelivery();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <ClockIcon className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold">Time Capsules</h1>
          </div>
          <Link
            href="/capsule/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium text-sm hover:opacity-90 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Create Capsule
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Gap #81: Delivery notifications */}
        {delivery.readyCount > 0 && (
          <div className="mb-4 space-y-2">
            {delivery.notifications.filter(n => n.status === 'ready').map(n => (
              <div key={n.capsuleId} className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl animate-pulse">
                <ClockIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-medium">"{n.title}" is ready to open!</p>
                  <p className="text-white/60 text-sm">From @{n.creatorUsername}</p>
                </div>
                <Link
                  href={`/capsule/${n.capsuleId}`}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition"
                >
                  Open Capsule
                </Link>
                <button onClick={() => delivery.dismissNotification(n.capsuleId)} className="text-white/40 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Gap #81: Upcoming countdown banners */}
        {delivery.upcomingCount > 0 && (
          <div className="mb-4">
            <h3 className="text-white/50 text-sm font-medium mb-2">Upcoming Reveals</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {delivery.notifications.filter(n => n.status === 'upcoming').slice(0, 5).map(n => (
                <div key={n.capsuleId} className="flex-shrink-0 px-4 py-2 glass-card rounded-xl min-w-[160px]">
                  <p className="text-white text-sm font-medium truncate">{n.title}</p>
                  <p className="text-purple-400 text-xs font-mono">{n.timeRemaining}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl">
          <h2 className="text-2xl font-bold mb-2">Create moments for the future</h2>
          <p className="text-gray-400 max-w-xl">
            Time Capsules let you create videos that unlock at a future date. Perfect for birthday
            surprises, anniversary messages, or predictions for your future self.
          </p>
        </div>

        <CapsuleTabs activeTab={c.tab} onTabChange={c.setTab} />

        {c.loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : c.capsules.length === 0 ? (
          <div className="text-center py-20">
            <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">
              {c.tab === 'my' ? 'No capsules created yet' :
               c.tab === 'received' ? 'No capsules received' :
               c.tab === 'unlocked' ? 'No unlocked capsules' :
               'No upcoming capsules'}
            </h2>
            <p className="text-gray-400 mb-6">
              {c.tab === 'my' ? 'Create your first time capsule!' : 'Check back later for new reveals'}
            </p>
            {c.tab === 'my' && (
              <Link
                href="/capsule/create"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium hover:opacity-90 transition"
              >
                Create Capsule
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.capsules.map(capsule => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                isOwner={c.tab === 'my'}
                isSubscribed={c.isSubscribed(capsule.id)}
                onSubscribe={c.handleSubscribe}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
