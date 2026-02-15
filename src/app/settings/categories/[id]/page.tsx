'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import { useAuthStore } from '@/stores/authStore';
import { useConfirmStore } from '@/stores/confirmStore';
import { ToggleSwitch, SettingsSection, FeedOrderSection, CategoryNameInput } from '@/components/settings/categories';
import type { FeedCategory, FeedOrder } from '@/types';

export default function CategorySettingsPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const confirmDialog = useConfirmStore(s => s.show);
  const { getCategoryById, updateCategory, deleteCategory, loadCategories } = useFeedCategoryStore();

  const [category, setCategory] = useState<FeedCategory | null>(null);
  const [name, setName] = useState('');
  const [feedOrder, setFeedOrder] = useState<FeedOrder>('chronological');
  const [notifications, setNotifications] = useState(true);
  const [vibeMeter, setVibeMeter] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleSave = async () => {
    if (!category || isSaving) return;
    setIsSaving(true);
    setError(null);

    const updates: Partial<FeedCategory> = { settings: { feedOrder, notifications, vibeMeter } };
    if (category.type === 'custom') updates.name = name.trim();

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
    const ok = await confirmDialog({ title: 'Delete Category', message: `Delete "${category.name}"? Users in this category will be moved back to Following.`, variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    const success = await deleteCategory(category.id);
    if (success) router.push('/settings/categories');
    else setError('Failed to delete category');
  };

  const markChanged = () => { if (!hasChanges) setHasChanges(true); };

  if (!isAuthVerified) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/settings/categories/' + categoryId);
    return <LoadingState />;
  }

  if (!category) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen aurora-bg">
      <AuroraBackground intensity={15} />
      <TopNav />

      <main className="pt-20 pb-8 px-4 max-w-2xl mx-auto relative z-10">
        <PageHeader category={category} hasChanges={hasChanges} isSaving={isSaving} onBack={() => router.back()} onSave={handleSave} />
        {error && <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">{error}</div>}

        <div className="space-y-6">
          {category.type === 'custom' && <CategoryNameInput name={name} onChange={(v) => { setName(v); markChanged(); }} />}
          <FeedOrderSection feedOrder={feedOrder} onChange={(v) => { setFeedOrder(v); markChanged(); }} />
          {category.type !== 'system' && (
            <SettingsSection title="Notifications">
              <ToggleSwitch enabled={notifications} onToggle={() => { setNotifications(!notifications); markChanged(); }} title="Push notifications" description="Get notified when users in this category post" />
            </SettingsSection>
          )}
          <SettingsSection title="Vibe Meter">
            <ToggleSwitch enabled={vibeMeter} onToggle={() => { setVibeMeter(!vibeMeter); markChanged(); }} title="Show vibe meter" description="Display engagement indicator on videos" />
          </SettingsSection>
          {category.isDeletable && <DeleteSection onDelete={handleDelete} />}
        </div>
      </main>
    </div>
  );
}

function PageHeader({ category, hasChanges, isSaving, onBack, onSave }: { category: FeedCategory; hasChanges: boolean; isSaving: boolean; onBack: () => void; onSave: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Go back">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{category.name}</h1>
          <p className="text-white/50 text-sm">Category Settings</p>
        </div>
      </div>
      {hasChanges && (
        <button onClick={onSave} disabled={isSaving} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      )}
    </div>
  );
}

function DeleteSection({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="pt-4">
      <button onClick={onDelete} className="w-full py-4 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors">
        Delete Category
      </button>
      <p className="text-white/30 text-xs text-center mt-2">Users in this category will be moved to Following</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </main>
    </div>
  );
}
