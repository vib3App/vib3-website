'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import { useAuthStore } from '@/stores/authStore';
import type { FeedCategory } from '@/types';
import { RESERVED_NAMES, MAX_CUSTOM_CATEGORIES } from '@/types';

export default function ManageCategoriesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    categories,
    isLoading,
    error,
    loadCategories,
    createCategory,
    deleteCategory,
    canCreateMore,
    getCustomCategories,
  } = useFeedCategoryStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCategories(true);
  }, [loadCategories]);

  const handleCreate = async () => {
    const name = newCategoryName.trim();

    if (!name) {
      setCreateError('Please enter a category name');
      return;
    }

    if (name.length > 30) {
      setCreateError('Name must be 30 characters or less');
      return;
    }

    if (RESERVED_NAMES.includes(name.toLowerCase())) {
      setCreateError('This name is reserved');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    const result = await createCategory(name);
    setIsCreating(false);

    if (result) {
      setShowCreateModal(false);
      setNewCategoryName('');
    } else {
      setCreateError('Failed to create category');
    }
  };

  const handleDelete = async (category: FeedCategory) => {
    if (!category.isDeletable) return;

    const confirmed = window.confirm(`Delete "${category.name}"? Users in this category will be moved to Following.`);
    if (!confirmed) return;

    await deleteCategory(category.id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg">
        <TopNav />
        <main className="pt-20 px-4 max-w-2xl mx-auto">
          <div className="glass-card p-8 rounded-2xl text-center">
            <p className="text-white/70 mb-4">Sign in to manage your feed categories</p>
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

  const customCategories = getCustomCategories();

  return (
    <div className="min-h-screen aurora-bg">
      <AuroraBackground intensity={15} />
      <TopNav />

      <main className="pt-20 pb-8 px-4 max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Feed Categories</h1>
            <p className="text-white/50 text-sm mt-1">
              Organize who you follow into custom feeds
            </p>
          </div>
          {canCreateMore() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New</span>
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Categories list */}
        {!isLoading && (
          <div className="space-y-3">
            {/* System categories */}
            <div className="mb-6">
              <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3 px-1">System</h2>
              {categories
                .filter(c => c.type === 'system')
                .map(category => (
                  <CategoryRow key={category.id} category={category} />
                ))}
            </div>

            {/* Default categories */}
            <div className="mb-6">
              <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3 px-1">Default</h2>
              {categories
                .filter(c => c.type === 'default')
                .map(category => (
                  <CategoryRow key={category.id} category={category} />
                ))}
            </div>

            {/* Custom categories */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-white/50 text-xs uppercase tracking-wider">
                  Custom ({customCategories.length}/{MAX_CUSTOM_CATEGORIES})
                </h2>
              </div>
              {customCategories.length === 0 ? (
                <div className="glass-card p-6 rounded-xl text-center">
                  <p className="text-white/50 mb-4">No custom categories yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Create your first category
                  </button>
                </div>
              ) : (
                customCategories.map(category => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onDelete={() => handleDelete(category)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-white mb-4">Create Category</h2>

              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                maxLength={30}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 mb-2"
                autoFocus
              />
              <div className="flex justify-between text-xs text-white/40 mb-4">
                <span>{createError && <span className="text-red-400">{createError}</span>}</span>
                <span>{newCategoryName.length}/30</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCategoryName('');
                    setCreateError(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !newCategoryName.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  onDelete,
}: {
  category: FeedCategory;
  onDelete?: () => void;
}) {
  return (
    <div className="glass-card flex items-center gap-4 p-4 rounded-xl mb-2">
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {category.icon}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{category.name}</span>
          {category.type === 'custom' && (
            <span className="px-2 py-0.5 text-[10px] uppercase text-purple-400 bg-purple-500/20 rounded-full">
              Custom
            </span>
          )}
        </div>
        <span className="text-white/40 text-sm capitalize">{category.type}</span>
      </div>

      {/* Delete button for custom categories */}
      {category.isDeletable && onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
