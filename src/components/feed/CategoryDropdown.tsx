'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import type { FeedCategory } from '@/types';

interface CategoryDropdownProps {
  onCategoryChange?: (category: FeedCategory) => void;
}

export function CategoryDropdown({ onCategoryChange }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  const {
    categories,
    selectedCategory,
    selectCategory,
    categoryCounts,
    isLoading,
    initialize,
  } = useFeedCategoryStore();

  // Initialize categories on mount - use ref to guarantee once-only
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (category: FeedCategory) => {
    selectCategory(category);
    onCategoryChange?.(category);
    setIsOpen(false);
  };

  if (!selectedCategory) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative z-50">
      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 glass rounded-full hover:bg-white/10 transition-all"
      >
        <span className="text-lg">{selectedCategory.icon}</span>
        <span className="text-white font-medium">{selectedCategory.name}</span>
        <svg
          className={`w-4 h-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 glass-heavy rounded-2xl border border-white/10 shadow-xl overflow-hidden animate-in">
          {/* Categories header */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs uppercase tracking-wider">Feed Categories</span>
              <Link
                href="/settings/categories"
                className="text-purple-400 text-xs hover:text-purple-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Manage
              </Link>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="px-4 py-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Category list */}
          {!isLoading && (
            <div className="py-2 max-h-[400px] overflow-y-auto">
              {categories.map((category) => {
                const isSelected = selectedCategory?.id === category.id;
                const userCount = categoryCounts[category.id] || 0;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleSelect(category)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Icon with category color */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>

                    {/* Category info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                          {category.name}
                        </span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      {/* Show user count for assignable categories */}
                      {(category.type === 'default' || category.type === 'custom') && (
                        <span className="text-white/40 text-xs">
                          {userCount} {userCount === 1 ? 'person' : 'people'}
                        </span>
                      )}
                      {category.type === 'system' && category.id === 'foryou' && (
                        <span className="text-white/40 text-xs">Personalized for you</span>
                      )}
                      {category.type === 'system' && category.id === 'following' && (
                        <span className="text-white/40 text-xs">Everyone you follow</span>
                      )}
                    </div>

                    {/* Category type badge */}
                    {category.type === 'custom' && (
                      <span className="px-2 py-0.5 text-[10px] uppercase text-purple-400 bg-purple-500/20 rounded-full">
                        Custom
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Add category button */}
          <div className="px-4 py-3 border-t border-white/10">
            <Link
              href="/settings/categories"
              className="flex items-center gap-2 text-purple-400 text-sm hover:text-purple-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Category</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryDropdown;
