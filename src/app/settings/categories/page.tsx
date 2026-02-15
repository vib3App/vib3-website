'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import { useAuthStore } from '@/stores/authStore';
import { useConfirmStore } from '@/stores/confirmStore';
import { CategoryRow, CreateCategoryModal } from '@/components/settings/categories';
import type { FeedCategory } from '@/types';
import { RESERVED_NAMES, MAX_CUSTOM_CATEGORIES } from '@/types';

export default function ManageCategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const {
    categories, categoryCounts, isLoading, error,
    loadCategories, createCategory, deleteCategory, canCreateMore, getCustomCategories,
  } = useFeedCategoryStore();

  const confirmDialog = useConfirmStore(s => s.show);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { loadCategories(true); }, [loadCategories]);

  const handleCreate = async () => {
    const name = newCategoryName.trim();
    if (!name) { setCreateError('Please enter a category name'); return; }
    if (name.length > 30) { setCreateError('Name must be 30 characters or less'); return; }
    if (RESERVED_NAMES.includes(name.toLowerCase())) { setCreateError('This name is reserved'); return; }

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
    const ok = await confirmDialog({ title: 'Delete Category', message: `Delete "${category.name}"? Users in this category will be moved to Following.`, variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    await deleteCategory(category.id);
  };

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/settings/categories');
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const customCategories = getCustomCategories();

  return (
    <div className="min-h-screen aurora-bg">
      <AuroraBackground intensity={15} />
      <TopNav />

      <main className="pt-20 pb-8 px-4 max-w-2xl mx-auto relative z-10">
        <PageHeader canCreateMore={canCreateMore()} onCreateClick={() => setShowCreateModal(true)} onBack={() => router.back()} />
        <StatsBar total={categories.length} custom={customCategories.length} available={MAX_CUSTOM_CATEGORIES - customCategories.length} />

        {error && <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">{error}</div>}
        {isLoading && <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>}

        {!isLoading && (
          <div className="space-y-3">
            <CategoryGroup title="System" categories={categories.filter(c => c.type === 'system')} categoryCounts={categoryCounts} onCategoryClick={(id) => router.push(`/settings/categories/${id}`)} />
            <CategoryGroup title="Default" categories={categories.filter(c => c.type === 'default')} categoryCounts={categoryCounts} onCategoryClick={(id) => router.push(`/settings/categories/${id}`)} />
            <CustomCategoryGroup categories={customCategories} categoryCounts={categoryCounts} onCategoryClick={(id) => router.push(`/settings/categories/${id}`)} onDelete={handleDelete} onCreateClick={() => setShowCreateModal(true)} />
          </div>
        )}
      </main>

      <CreateCategoryModal
        isOpen={showCreateModal}
        name={newCategoryName}
        error={createError}
        isCreating={isCreating}
        onNameChange={setNewCategoryName}
        onClose={() => { setShowCreateModal(false); setNewCategoryName(''); setCreateError(null); }}
        onCreate={handleCreate}
      />
    </div>
  );
}

function PageHeader({ canCreateMore, onCreateClick, onBack }: { canCreateMore: boolean; onCreateClick: () => void; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={onBack} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Go back">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <div className="flex-1">
        <h1 className="text-xl font-bold text-white">Feed Categories</h1>
        <p className="text-white/50 text-sm">Organize who you follow</p>
      </div>
      {canCreateMore && (
        <button onClick={onCreateClick} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>New</span>
        </button>
      )}
    </div>
  );
}

function StatsBar({ total, custom, available }: { total: number; custom: number; available: number }) {
  return (
    <div className="glass-card p-4 rounded-xl mb-6">
      <div className="flex items-center justify-around text-center">
        <div><div className="text-2xl font-bold text-white">{total}</div><div className="text-white/40 text-xs uppercase tracking-wider">Categories</div></div>
        <div className="h-8 w-px bg-white/10" />
        <div><div className="text-2xl font-bold text-white">{custom}</div><div className="text-white/40 text-xs uppercase tracking-wider">Custom</div></div>
        <div className="h-8 w-px bg-white/10" />
        <div><div className="text-2xl font-bold text-white">{available}</div><div className="text-white/40 text-xs uppercase tracking-wider">Available</div></div>
      </div>
    </div>
  );
}

function CategoryGroup({ title, categories, categoryCounts, onCategoryClick }: { title: string; categories: FeedCategory[]; categoryCounts: Record<string, number>; onCategoryClick: (id: string) => void }) {
  return (
    <div className="mb-6">
      <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3 px-1">{title}</h2>
      {categories.map(category => (
        <CategoryRow key={category.id} category={category} userCount={categoryCounts[category.id] || 0} onClick={() => onCategoryClick(category.id)} />
      ))}
    </div>
  );
}

function CustomCategoryGroup({ categories, categoryCounts, onCategoryClick, onDelete, onCreateClick }: { categories: FeedCategory[]; categoryCounts: Record<string, number>; onCategoryClick: (id: string) => void; onDelete: (cat: FeedCategory) => void; onCreateClick: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-white/50 text-xs uppercase tracking-wider">Custom ({categories.length}/{MAX_CUSTOM_CATEGORIES})</h2>
      </div>
      {categories.length === 0 ? (
        <div className="glass-card p-6 rounded-xl text-center">
          <p className="text-white/50 mb-4">No custom categories yet</p>
          <button onClick={onCreateClick} className="text-purple-400 hover:text-purple-300 transition-colors">Create your first category</button>
        </div>
      ) : (
        categories.map(category => (
          <CategoryRow key={category.id} category={category} userCount={categoryCounts[category.id] || 0} onClick={() => onCategoryClick(category.id)} onDelete={() => onDelete(category)} />
        ))
      )}
    </div>
  );
}
