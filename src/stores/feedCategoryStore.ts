/**
 * Feed Category Store
 * Manages feed categories state using Zustand
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { feedCategoryApi } from '@/services/api';
import type { FeedCategory, FeedCategorySettings } from '@/types';
import { getDefaultCategories, MAX_CUSTOM_CATEGORIES, isAssignableCategory } from '@/types';

interface FeedCategoryState {
  categories: FeedCategory[];
  selectedCategory: FeedCategory | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  categoryCounts: Record<string, number>;

  // Actions
  initialize: () => Promise<void>;
  loadCategories: (forceRefresh?: boolean) => Promise<void>;
  selectCategory: (category: FeedCategory) => void;
  createCategory: (name: string, icon?: string, color?: string) => Promise<FeedCategory | null>;
  updateCategory: (id: string, updates: Partial<FeedCategory>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  reorderCategories: (categoryIds: string[]) => Promise<boolean>;
  updateCategorySettings: (id: string, settings: Partial<FeedCategorySettings>) => Promise<boolean>;

  // User assignment actions
  assignUserToCategories: (userId: string, categoryIds: string[]) => Promise<boolean>;
  addUserToCategory: (categoryId: string, userId: string) => Promise<boolean>;
  removeUserFromCategory: (categoryId: string, userId: string) => Promise<boolean>;
  getUserCategories: (userId: string) => Promise<string[]>;

  // Helpers
  getCategoryById: (id: string) => FeedCategory | undefined;
  getAssignableCategories: () => FeedCategory[];
  getCustomCategories: () => FeedCategory[];
  canCreateMore: () => boolean;
}

export const useFeedCategoryStore = create<FeedCategoryState>()(
  persist(
    (set, get) => ({
      categories: getDefaultCategories(),
      selectedCategory: getDefaultCategories()[0], // Default to "For You"
      isLoading: false,
      isInitialized: false,
      error: null,
      categoryCounts: {},

      initialize: async () => {
        // Prevent duplicate initialization - use synchronous check
        const state = get();
        if (state.isInitialized || state.isLoading) return;

        // Set initialized FIRST to prevent race conditions
        // This ensures no other initialize() calls proceed
        set({ isInitialized: true, isLoading: true });

        const { categories, selectedCategory } = state;
        // Only set default selection if not already set
        if (!selectedCategory && categories.length > 0) {
          set({ selectedCategory: categories[0] });
        }

        // Load categories (already marked as loading)
        try {
          const newCategories = await feedCategoryApi.getCategories(false);

          let counts: Record<string, number> = {};
          try {
            const stats = await feedCategoryApi.getCategoryStats();
            if (stats?.categories) {
              stats.categories.forEach(c => {
                counts[c.categoryId] = c.userCount;
              });
            }
          } catch {
            // Stats failed (likely auth issue) - continue with empty counts
          }

          const currentSelected = get().selectedCategory;
          const selectedStillExists = currentSelected && newCategories.find(c => c.id === currentSelected.id);

          set({
            categories: newCategories,
            categoryCounts: counts,
            isLoading: false,
            // Only update selected if it was deleted
            ...(selectedStillExists ? {} : { selectedCategory: newCategories[0] }),
          });
        } catch (error) {
          console.error('Failed to load categories:', error);
          set({ error: 'Failed to load categories', isLoading: false });
        }
      },

      loadCategories: async (forceRefresh = false) => {
        // Prevent concurrent loads
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true, error: null });
        try {
          const categories = await feedCategoryApi.getCategories(forceRefresh);

          // Try to get stats but don't fail if it errors (e.g., 401)
          let counts: Record<string, number> = {};
          try {
            const stats = await feedCategoryApi.getCategoryStats();
            if (stats?.categories) {
              stats.categories.forEach(c => {
                counts[c.categoryId] = c.userCount;
              });
            }
          } catch {
            // Stats failed (likely auth issue) - continue with empty counts
          }

          // Check if selected category still exists before updating state
          const currentSelected = get().selectedCategory;
          const selectedStillExists = currentSelected && categories.find(c => c.id === currentSelected.id);

          // Update all state in one call to minimize re-renders
          set({
            categories,
            categoryCounts: counts,
            isLoading: false,
            // Only update selected if it was deleted
            ...(selectedStillExists ? {} : { selectedCategory: categories[0] }),
          });
        } catch (error) {
          console.error('Failed to load categories:', error);
          set({ error: 'Failed to load categories', isLoading: false });
        }
      },

      selectCategory: (category) => {
        set({ selectedCategory: category });
      },

      createCategory: async (name, icon, color) => {
        if (!get().canCreateMore()) {
          set({ error: `Maximum ${MAX_CUSTOM_CATEGORIES} custom categories allowed` });
          return null;
        }

        set({ isLoading: true, error: null });
        try {
          const category = await feedCategoryApi.createCategory(name, icon, color);
          if (category) {
            set(state => ({
              categories: [...state.categories, category].sort((a, b) => a.order - b.order),
              isLoading: false,
            }));
            return category;
          }
          set({ error: 'Failed to create category', isLoading: false });
          return null;
        } catch (error) {
          console.error('Failed to create category:', error);
          set({ error: 'Failed to create category', isLoading: false });
          return null;
        }
      },

      updateCategory: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await feedCategoryApi.updateCategory(id, updates);
          if (updated) {
            set(state => ({
              categories: state.categories.map(c => (c.id === id ? { ...c, ...updated } : c)),
              selectedCategory:
                state.selectedCategory?.id === id
                  ? { ...state.selectedCategory, ...updated }
                  : state.selectedCategory,
              isLoading: false,
            }));
            return true;
          }
          set({ error: 'Failed to update category', isLoading: false });
          return false;
        } catch (error) {
          console.error('Failed to update category:', error);
          set({ error: 'Failed to update category', isLoading: false });
          return false;
        }
      },

      deleteCategory: async (id) => {
        const category = get().getCategoryById(id);
        if (!category?.isDeletable) {
          set({ error: 'Cannot delete this category' });
          return false;
        }

        set({ isLoading: true, error: null });
        try {
          const success = await feedCategoryApi.deleteCategory(id);
          if (success) {
            set(state => {
              const newCategories = state.categories.filter(c => c.id !== id);
              const newSelected =
                state.selectedCategory?.id === id ? newCategories[0] : state.selectedCategory;
              return {
                categories: newCategories,
                selectedCategory: newSelected,
                isLoading: false,
              };
            });
            return true;
          }
          set({ error: 'Failed to delete category', isLoading: false });
          return false;
        } catch (error) {
          console.error('Failed to delete category:', error);
          set({ error: 'Failed to delete category', isLoading: false });
          return false;
        }
      },

      reorderCategories: async (categoryIds) => {
        const success = await feedCategoryApi.reorderCategories(categoryIds);
        if (success) {
          await get().loadCategories(true);
        }
        return !!success;
      },

      updateCategorySettings: async (id, settings) => {
        const category = get().getCategoryById(id);
        if (!category) return false;

        return get().updateCategory(id, {
          settings: { ...category.settings, ...settings },
        });
      },

      // User assignment
      assignUserToCategories: async (userId, categoryIds) => {
        const success = await feedCategoryApi.assignUserToCategories(userId, categoryIds);
        if (success) {
          await get().loadCategories(true);
        }
        return success;
      },

      addUserToCategory: async (categoryId, userId) => {
        const success = await feedCategoryApi.addUserToCategory(categoryId, userId);
        if (success) {
          set(state => ({
            categoryCounts: {
              ...state.categoryCounts,
              [categoryId]: (state.categoryCounts[categoryId] || 0) + 1,
            },
          }));
        }
        return success;
      },

      removeUserFromCategory: async (categoryId, userId) => {
        const success = await feedCategoryApi.removeUserFromCategory(categoryId, userId);
        if (success) {
          set(state => ({
            categoryCounts: {
              ...state.categoryCounts,
              [categoryId]: Math.max((state.categoryCounts[categoryId] || 0) - 1, 0),
            },
          }));
        }
        return success;
      },

      getUserCategories: async (userId) => {
        return feedCategoryApi.getUserCategories(userId);
      },

      // Helpers
      getCategoryById: (id) => {
        return get().categories.find(c => c.id === id);
      },

      getAssignableCategories: () => {
        return get().categories.filter(isAssignableCategory);
      },

      getCustomCategories: () => {
        return get().categories.filter(c => c.type === 'custom');
      },

      canCreateMore: () => {
        return get().getCustomCategories().length < MAX_CUSTOM_CATEGORIES;
      },
    }),
    {
      name: 'feed-category-store',
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);
