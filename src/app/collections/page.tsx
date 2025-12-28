'use client';

import Link from 'next/link';
import { useCollections } from '@/hooks/useCollections';
import { CollectionCard, CreatePlaylistModal, CollectionTabs } from '@/components/collections-list';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';

export default function CollectionsPage() {
  const c = useCollections();

  if (!c.isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen aurora-bg">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy mx-4 mt-3 rounded-2xl">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-white">Collections</h1>
            {c.activeTab === 'playlists' && (
              <button
                onClick={() => c.setShowCreateModal(true)}
                className="p-2 text-purple-400 hover:text-purple-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          <CollectionTabs activeTab={c.activeTab} onTabChange={c.setActiveTab} />
        </header>

        {/* Content */}
        <div className="p-4">
          {c.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : c.activeTab === 'playlists' ? (
            c.playlists.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                </svg>
                <p className="text-white/50">No playlists yet</p>
                <button
                  onClick={() => c.setShowCreateModal(true)}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full hover:opacity-90 transition-opacity"
                >
                  Create your first playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {c.playlists.map((playlist) => (
                  <CollectionCard
                    key={playlist.id}
                    collection={playlist}
                    onDelete={c.handleDelete}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-white/50">
                {c.activeTab === 'saved' && 'No saved videos yet'}
                {c.activeTab === 'liked' && 'No liked videos yet'}
                {c.activeTab === 'history' && 'No watch history yet'}
              </p>
              <Link
                href="/feed"
                className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full hover:opacity-90 transition-opacity"
              >
                Browse videos
              </Link>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
      <CreatePlaylistModal
        isOpen={c.showCreateModal}
        onClose={() => c.setShowCreateModal(false)}
        onCreated={c.handleCreated}
      />
    </div>
  );
}
