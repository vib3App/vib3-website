'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import { useAuthStore } from '@/stores/authStore';
import type { FeedCategory, FeedOrder } from '@/types';

export default function CategorySettingsPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const {
    getCategoryById,
    updateCategory,
    deleteCategory,
    loadCategories,
  } = useFeedCategoryStore();

  const [category, setCategory] = useState<FeedCategory | null>(null);
  const [name, setName] = useState('');
  const [feedOrder, setFeedOrder] = useState<FeedOrder>('chronological');
  const [notifications, setNotifications] = useState(true);
  const [vibeMeter, setVibeMeter] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load category data - only run when categoryId changes
  useEffect(() => {
    let mounted = true;

    loadCategories().then(() => {
      if (!mounted) return;
      const cat = getCategoryById(categoryId);
      if (cat) {
        setCategory(cat);
        setName(cat.name);
        setFeedOrder(cat.settings.feedOrder);
        setNotifications(cat.settings.notifications);
        setVibeMeter(cat.settings.vibeMeter);
      }
    });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleSave = async () => {
    if (!category || isSaving) return;

    setIsSaving(true);
    setError(null);

    const updates: Partial<FeedCategory> = {
      settings: {
        feedOrder,
        notifications,
        vibeMeter,
      },
    };

    // Only include name for custom categories
    if (category.type === 'custom') {
      updates.name = name.trim();
    }

    const success = await updateCategory(category.id, updates);
    setIsSaving(false);

    if (success) {
      setHasChanges(false);
      router.back();
    } else {
      setError('Failed to save settings');
    }
  };

  const handleDelete = async () => {
    if (!category || !category.isDeletable) return;

    const confirmed = window.confirm(
      `Delete "${category.name}"? Users in this category will be moved back to Following.`
    );
    if (!confirmed) return;

    const success = await deleteCategory(category.id);
    if (success) {
      router.push('/settings/categories');
    } else {
      setError('Failed to delete category');
    }
  };

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg">
        <TopNav />
        <main className="pt-20 px-4 max-w-2xl mx-auto">
          <div className="glass-card p-8 rounded-2xl text-center">
            <p className="text-white/70 mb-4">Sign in to manage category settings</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white font-medium"
            >
              Sign In
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen aurora-bg">
        <TopNav />
        <main className="pt-20 px-4 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const isCustom = category.type === 'custom';
  const isSystem = category.type === 'system';

  return (
    <div className="min-h-screen aurora-bg">
      <AuroraBackground intensity={15} />
      <TopNav />

      <main className="pt-20 pb-8 px-4 max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{category.name}</h1>
              <p className="text-white/50 text-sm">Category Settings</p>
            </div>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Category Name (only for custom categories) */}
          {isCustom && (
            <div className="glass-card p-4 rounded-xl">
              <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">Category Name</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  markChanged();
                }}
                maxLength={30}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
              />
              <p className="text-white/30 text-xs mt-2">{name.length}/30</p>
            </div>
          )}

          {/* Feed Order */}
          <div className="glass-card p-4 rounded-xl">
            <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">Feed Order</h2>

            <label
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${
                feedOrder === 'chronological' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              onClick={() => {
                setFeedOrder('chronological');
                markChanged();
              }}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  feedOrder === 'chronological' ? 'border-purple-500' : 'border-white/30'
                }`}
              >
                {feedOrder === 'chronological' && (
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Chronological</div>
                <div className="text-white/40 text-sm">Newest posts first</div>
              </div>
            </label>

            <label
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${
                feedOrder === 'algorithmic' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              onClick={() => {
                setFeedOrder('algorithmic');
                markChanged();
              }}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  feedOrder === 'algorithmic' ? 'border-purple-500' : 'border-white/30'
                }`}
              >
                {feedOrder === 'algorithmic' && (
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Algorithmic</div>
                <div className="text-white/40 text-sm">Personalized based on your interests</div>
              </div>
            </label>
          </div>

          {/* Notifications (not for system categories) */}
          {!isSystem && (
            <div className="glass-card p-4 rounded-xl">
              <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">Notifications</h2>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Push notifications</div>
                  <div className="text-white/40 text-sm">Get notified when users in this category post</div>
                </div>
                <button
                  onClick={() => {
                    setNotifications(!notifications);
                    markChanged();
                  }}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Vibe Meter */}
          <div className="glass-card p-4 rounded-xl">
            <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">Vibe Meter</h2>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Show vibe meter</div>
                <div className="text-white/40 text-sm">Display engagement indicator on videos</div>
              </div>
              <button
                onClick={() => {
                  setVibeMeter(!vibeMeter);
                  markChanged();
                }}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  vibeMeter ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    vibeMeter ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Delete Category (only for custom/deletable categories) */}
          {category.isDeletable && (
            <div className="pt-4">
              <button
                onClick={handleDelete}
                className="w-full py-4 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
              >
                Delete Category
              </button>
              <p className="text-white/30 text-xs text-center mt-2">
                Users in this category will be moved to Following
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
