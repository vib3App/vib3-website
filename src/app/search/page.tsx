'use client';

import { Suspense } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import {
  SearchHeader,
  SearchTabs,
  SearchFiltersPanel,
  EmptySearchState,
  SearchResults,
  NoResults,
} from '@/components/search';

function SearchLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
}

function SearchContent() {
  const search = useSearch();

  const hasResults =
    search.users.length > 0 ||
    search.videos.length > 0 ||
    search.hashtags.length > 0 ||
    search.sounds.length > 0 ||
    search.transcriptMatches.length > 0;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
        <SearchHeader
          searchQuery={search.searchQuery}
          onSearchQueryChange={search.setSearchQuery}
          onSearch={search.handleSearch}
          suggestions={search.suggestions}
          showSuggestions={search.showSuggestions}
          onShowSuggestionsChange={search.setShowSuggestions}
          onSuggestionClick={search.handleSuggestionClick}
          inputRef={search.inputRef}
          suggestionsRef={search.suggestionsRef}
        />

        {search.query && (
          <SearchTabs
            activeTab={search.activeTab}
            onTabChange={search.setActiveTab}
            showFilters={search.showFilters}
            onShowFiltersChange={search.setShowFilters}
          />
        )}

        {search.showFilters && search.query && (
          <SearchFiltersPanel
            filters={search.filters}
            onFilterChange={search.handleFilterChange}
          />
        )}
      </header>

      <div className="px-4 py-6">
        {!search.query && (
          <EmptySearchState
            recentSearches={search.recentSearches}
            trendingSearches={search.trendingSearches}
            onClearRecent={search.clearRecentSearches}
          />
        )}

        {search.isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {search.query && !search.isLoading && (
          <>
            {hasResults ? (
              <SearchResults
                activeTab={search.activeTab}
                users={search.users}
                videos={search.videos}
                hashtags={search.hashtags}
                sounds={search.sounds}
                transcriptMatches={search.transcriptMatches}
                onTabChange={search.setActiveTab}
              />
            ) : (
              <NoResults query={search.query} />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Suspense fallback={<SearchLoading />}>
          <SearchContent />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  );
}
