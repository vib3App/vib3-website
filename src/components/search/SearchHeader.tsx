'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { SearchSuggestion } from '@/services/api';
import { formatCount } from '@/utils/format';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  suggestionsRef: React.RefObject<HTMLDivElement | null>;
}

export function SearchHeader({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  suggestions,
  showSuggestions,
  onShowSuggestionsChange,
  onSuggestionClick,
  inputRef,
  suggestionsRef,
}: SearchHeaderProps) {
  const router = useRouter();

  return (
    <div className="px-4 py-4">
      <div ref={suggestionsRef} className="relative">
        <form onSubmit={onSearch}>
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value);
              onShowSuggestionsChange(true);
            }}
            onFocus={() => onShowSuggestionsChange(true)}
            placeholder="Search videos, users, sounds..."
            autoFocus
            className="w-full bg-[#1A1F2E] text-white px-12 py-3 rounded-full outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1]"
          />
          <svg
            className="absolute left-4 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 hidden md:block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1F2E] rounded-xl shadow-xl overflow-hidden z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <SuggestionIcon suggestion={suggestion} />
                  <div>
                    <p className="text-white">{suggestion.text}</p>
                    {suggestion.subtext && (
                      <p className="text-white/50 text-sm">{suggestion.subtext}</p>
                    )}
                  </div>
                  {suggestion.count !== undefined && (
                    <span className="ml-auto text-white/30 text-sm">{formatCount(suggestion.count)}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function SuggestionIcon({ suggestion }: { suggestion: SearchSuggestion }) {
  if (suggestion.type === 'user' && suggestion.avatar) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0A0E1A]">
        <Image src={suggestion.avatar} alt="" width={32} height={32} className="object-cover" />
      </div>
    );
  }
  if (suggestion.type === 'hashtag') {
    return (
      <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
        <span className="text-[#6366F1]">#</span>
      </div>
    );
  }
  if (suggestion.type === 'sound') {
    return (
      <div className="w-8 h-8 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
        <svg className="w-4 h-4 text-[#14B8A6]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
    );
  }
  return (
    <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
