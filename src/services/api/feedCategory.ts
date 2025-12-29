/**
 * Feed Category API service
 * Handles category CRUD and user assignments
 */
import { apiClient } from './client';
import type { FeedCategory, FeedCategorySettings } from '@/types';
import { getDefaultCategories, DEFAULT_CATEGORY_SETTINGS } from '@/types';

interface CategoryApiResponse {
  _id: string;
  userId: string;
  name: string;
  type: 'system' | 'default' | 'custom';
  icon?: string;
  color?: string;
  order: number;
  isDeletable: boolean;
  settings?: FeedCategorySettings;
  userCount?: number;
}

interface CategoryStatsResponse {
  categories: Array<{
    categoryId: string;
    userCount: number;
  }>;
  totalFollowing: number;
}

// In-memory cache with 2-minute TTL
let categoriesCache: FeedCategory[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function transformCategory(data: CategoryApiResponse): FeedCategory {
  return {
    id: data._id,
    name: data.name,
    type: data.type,
    icon: data.icon || '📁',
    color: data.color || '#8B5CF6',
    order: data.order,
    isDeletable: data.isDeletable,
    settings: data.settings || DEFAULT_CATEGORY_SETTINGS,
    userCount: data.userCount,
  };
}

function clearCache() {
  categoriesCache = null;
  cacheTimestamp = 0;
}

export const feedCategoryApi = {
  /**
   * Get all categories for the current user
   */
  async getCategories(forceRefresh = false): Promise<FeedCategory[]> {
    // Return cached if valid
    if (!forceRefresh && categoriesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
      return categoriesCache;
    }

    try {
      const { data } = await apiClient.get<{ categories: CategoryApiResponse[] }>('/feed-categories');
      const categories = data.categories?.map(transformCategory) || [];

      // Merge with default categories if backend doesn't return them
      const defaults = getDefaultCategories();
      const merged = [...defaults];

      // Add any custom categories from backend
      categories.forEach(cat => {
        if (cat.type === 'custom') {
          merged.push(cat);
        }
      });

      // Sort by order
      merged.sort((a, b) => a.order - b.order);

      categoriesCache = merged;
      cacheTimestamp = Date.now();
      return merged;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return defaults on error
      return getDefaultCategories();
    }
  },

  /**
   * Get a single category by ID
   */
  async getCategory(categoryId: string): Promise<FeedCategory | null> {
    try {
      const { data } = await apiClient.get<CategoryApiResponse>(`/feed-categories/${categoryId}`);
      return transformCategory(data);
    } catch {
      return null;
    }
  },

  /**
   * Create a new custom category
   */
  async createCategory(
    name: string,
    icon?: string,
    color?: string,
    settings?: Partial<FeedCategorySettings>
  ): Promise<FeedCategory | null> {
    try {
      const { data } = await apiClient.post<CategoryApiResponse>('/feed-categories', {
        name,
        icon: icon || '📁',
        color: color || '#8B5CF6',
        settings: { ...DEFAULT_CATEGORY_SETTINGS, ...settings },
      });
      clearCache();
      return transformCategory(data);
    } catch (error) {
      console.error('Failed to create category:', error);
      return null;
    }
  },

  /**
   * Update a category
   */
  async updateCategory(
    categoryId: string,
    updates: {
      name?: string;
      icon?: string;
      color?: string;
      settings?: Partial<FeedCategorySettings>;
    }
  ): Promise<FeedCategory | null> {
    try {
      const { data } = await apiClient.put<CategoryApiResponse>(`/feed-categories/${categoryId}`, updates);
      clearCache();
      return transformCategory(data);
    } catch (error) {
      console.error('Failed to update category:', error);
      return null;
    }
  },

  /**
   * Delete a custom category
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/feed-categories/${categoryId}`);
      clearCache();
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    }
  },

  /**
   * Reorder categories
   */
  async reorderCategories(categoryIds: string[]): Promise<FeedCategory[] | null> {
    try {
      const { data } = await apiClient.put<{ categories: CategoryApiResponse[] }>('/feed-categories/reorder', {
        categoryIds,
      });
      clearCache();
      return data.categories?.map(transformCategory) || null;
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      return null;
    }
  },

  /**
   * Get category statistics (user counts)
   */
  async getCategoryStats(): Promise<CategoryStatsResponse | null> {
    try {
      const { data } = await apiClient.get<CategoryStatsResponse>('/feed-categories/stats');
      return data;
    } catch (error) {
      console.error('Failed to get category stats:', error);
      return null;
    }
  },

  // User assignment methods

  /**
   * Get categories a followed user is assigned to
   */
  async getUserCategories(followedUserId: string): Promise<string[]> {
    try {
      const { data } = await apiClient.get<{ categoryIds: string[] }>(`/feed-categories/user/${followedUserId}`);
      return data.categoryIds || [];
    } catch {
      return [];
    }
  },

  /**
   * Assign a user to multiple categories at once
   */
  async assignUserToCategories(followedUserId: string, categoryIds: string[]): Promise<boolean> {
    try {
      await apiClient.post('/feed-categories/assign', {
        followedUserId,
        categoryIds,
      });
      clearCache();
      return true;
    } catch (error) {
      console.error('Failed to assign user to categories:', error);
      return false;
    }
  },

  /**
   * Add a user to a single category
   */
  async addUserToCategory(categoryId: string, followedUserId: string): Promise<boolean> {
    try {
      await apiClient.post(`/feed-categories/${categoryId}/add-user`, {
        userId: followedUserId,
      });
      clearCache();
      return true;
    } catch (error) {
      console.error('Failed to add user to category:', error);
      return false;
    }
  },

  /**
   * Remove a user from a category
   */
  async removeUserFromCategory(categoryId: string, followedUserId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/feed-categories/${categoryId}/remove-user/${followedUserId}`);
      clearCache();
      return true;
    } catch (error) {
      console.error('Failed to remove user from category:', error);
      return false;
    }
  },

  /**
   * Get users in a category
   */
  async getCategoryUsers(categoryId: string): Promise<Array<{ userId: string; username: string; avatar?: string }>> {
    try {
      const { data } = await apiClient.get<{ users: Array<{ userId: string; username: string; avatar?: string }> }>(
        `/feed-categories/${categoryId}/users`
      );
      return data.users || [];
    } catch {
      return [];
    }
  },

  /**
   * Clear the cache (call after mutations)
   */
  clearCache,
};
