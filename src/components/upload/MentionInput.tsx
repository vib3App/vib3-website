'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { userApi } from '@/services/api';

interface MentionInputProps {
  mentions: string[];
  onMentionsChange: (mentions: string[]) => void;
}

interface UserSuggestion {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export function MentionInput({ mentions, onMentionsChange }: MentionInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setIsSearching(true);
    try {
      const results = await userApi.searchUsers(q);
      setSuggestions(results.slice(0, 8).map((u) => ({
        id: u._id,
        username: u.username,
        displayName: u.displayName || u.username,
        avatarUrl: u.profilePicture,
      })));
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(value), 300);
  }, [searchUsers]);

  const addMention = useCallback((username: string) => {
    if (!mentions.includes(username)) {
      onMentionsChange([...mentions, username]);
    }
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, [mentions, onMentionsChange]);

  const removeMention = useCallback((username: string) => {
    onMentionsChange(mentions.filter(m => m !== username));
  }, [mentions, onMentionsChange]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div>
      <label className="block text-white font-medium mb-2">@Mentions</label>
      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {mentions.map(m => (
            <span key={m} className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm flex items-center gap-1">
              @{m}
              <button onClick={() => removeMention(m)} className="hover:text-white">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="@username..."
          className="w-full glass text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/40 focus:ring-2 focus:ring-purple-500/50"
        />
        {showSuggestions && (suggestions.length > 0 || isSearching) && (
          <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-white/40 text-sm text-center">Searching...</div>
            ) : (
              suggestions.map(u => (
                <button
                  key={u.id}
                  onMouseDown={e => { e.preventDefault(); addMention(u.username); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">@{u.username}</div>
                    <div className="text-white/40 text-xs">{u.displayName}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
