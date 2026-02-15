'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import type { FeedCategory } from '@/types';

interface FollowCategoryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  followedUserId: string;
  followedUsername: string;
  followedAvatar?: string;
}

export function FollowCategoryPicker({
  isOpen,
  onClose,
  followedUserId,
  followedUsername,
  followedAvatar,
}: FollowCategoryPickerProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const {
    categories: _categories,
    getAssignableCategories,
    getUserCategories,
    addUserToCategory,
    removeUserFromCategory,
  } = useFeedCategoryStore();

  // Load user's current categories
  useEffect(() => {
    if (!isOpen || !followedUserId) return;

    const loadUserCategories = async () => {
      setIsLoading(true);
      try {
        const userCategoryIds = await getUserCategories(followedUserId);
        setSelectedCategories(new Set(userCategoryIds));
      } catch (error) {
        console.error('Failed to load user categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserCategories();
  }, [isOpen, followedUserId, getUserCategories]);

  const assignableCategories = getAssignableCategories();

  const handleToggleCategory = async (category: FeedCategory) => {
    const isSelected = selectedCategories.has(category.id);

    // Optimistic update
    setLoadingCategories(prev => new Set(prev).add(category.id));

    try {
      let success: boolean;
      if (isSelected) {
        success = await removeUserFromCategory(category.id, followedUserId);
      } else {
        success = await addUserToCategory(category.id, followedUserId);
      }

      if (success) {
        setSelectedCategories(prev => {
          const newSet = new Set(prev);
          if (isSelected) {
            newSet.delete(category.id);
          } else {
            newSet.add(category.id);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to toggle category:', error);
    } finally {
      setLoadingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(category.id);
        return newSet;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 max-h-[70vh] overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-4">
              {/* User avatar */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-purple-500/50">
                  {followedAvatar ? (
                    <Image
                      src={followedAvatar}
                      alt={followedUsername}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                      {followedUsername[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                {/* Checkmark badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-black">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg">
                  You followed @{followedUsername}
                </h3>
                <p className="text-white/50 text-sm">
                  Add them to categories to organize your feed
                </p>
              </div>
            </div>
          </div>

          {/* Categories list */}
          <div className="px-4 pb-6 max-h-[40vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {assignableCategories.map((category) => {
                  const isSelected = selectedCategories.has(category.id);
                  const isLoadingThis = loadingCategories.has(category.id);

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleToggleCategory(category)}
                      disabled={isLoadingThis}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 ring-1 ring-purple-500/30'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {/* Category icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${category.color}30` }}
                      >
                        {category.icon}
                      </div>

                      {/* Category info */}
                      <div className="flex-1 text-left">
                        <span className="text-white font-medium">{category.name}</span>
                        {category.type === 'custom' && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] uppercase text-purple-400 bg-purple-500/20 rounded-full">
                            Custom
                          </span>
                        )}
                      </div>

                      {/* Checkbox */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-500 to-teal-500'
                            : 'border-2 border-white/30'
                        }`}
                      >
                        {isLoadingThis ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isSelected ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {assignableCategories.length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    <p>No categories available</p>
                    <p className="text-sm mt-1">Create categories in Settings</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-8 pt-2 border-t border-white/10">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FollowCategoryPicker;
