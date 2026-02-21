'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

export default function NotificationsPage() {
  const n = useNotifications();

  // Show loading while auth is being verified
  if (!n.isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  // Redirect if not authenticated (hook handles the redirect via useEffect)
  if (!n.isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy mx-4 rounded-2xl">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            {n.unreadCount > 0 && (
              <button
                onClick={n.handleMarkAllRead}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Desktop notification prompt */}
          {n.permissionStatus === 'default' && n.isNotificationsAvailable && (
            <div className="px-4 pb-3">
              <button
                onClick={n.handleEnableNotifications}
                className="w-full glass text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Enable desktop notifications
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1.5 p-2 overflow-x-auto scrollbar-hide">
            {([
              { id: 'all', label: 'All' },
              { id: 'likes', label: 'Likes' },
              { id: 'comments', label: 'Comments' },
              { id: 'follows', label: 'Follows' },
              { id: 'mentions', label: 'Mentions' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => n.setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  n.activeTab === tab.id
                    ? 'glass-heavy text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Notifications List */}
        <div className="divide-y divide-white/5">
          {n.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : n.notifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-white/50">No notifications yet</p>
              <p className="text-white/30 text-sm mt-1">
                When you get notifications, they&apos;ll show up here
              </p>
            </div>
          ) : (
            <>
              {n.notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={n.handleMarkRead}
                />
              ))}

              {n.hasMore && (
                <button
                  onClick={n.loadMore}
                  className="w-full py-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  Load more
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
