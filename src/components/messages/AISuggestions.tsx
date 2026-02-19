'use client';

import { useState, useEffect, useCallback } from 'react';
import { aiApi } from '@/services/api';
import { logger } from '@/utils/logger';

interface AISuggestionsProps {
  lastMessageContent: string;
  lastMessageSenderId: string;
  currentUserId: string;
  onSelectSuggestion: (text: string) => void;
}

/** Shows AI-powered quick reply suggestions when a message is received */
export function AISuggestions({
  lastMessageContent,
  lastMessageSenderId,
  currentUserId,
  onSelectSuggestion,
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const generateSuggestions = useCallback(async (messageContent: string) => {
    setIsLoading(true);
    setDismissed(false);
    try {
      // Use the AI API's semantic search as a proxy for generating suggestions
      // In production, this would call a dedicated AI reply suggestion endpoint
      const contextPrompt = messageContent.slice(0, 200);
      const results = await aiApi.semanticSearch(`reply suggestions for: "${contextPrompt}"`, 3);

      // If the API returns results, extract useful text; otherwise use fallback
      if (results.length > 0) {
        setSuggestions(results.slice(0, 3).map((r) => r.title || 'Sounds good!'));
      } else {
        // Generate contextual fallback suggestions
        setSuggestions(generateFallbackSuggestions(messageContent));
      }
    } catch {
      // Silently fall back to contextual suggestions on API error
      logger.debug('AI suggestions fallback for:', messageContent);
      setSuggestions(generateFallbackSuggestions(messageContent));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only show suggestions for messages from the other user
    if (lastMessageSenderId === currentUserId || !lastMessageContent) {
      setSuggestions([]);
      return;
    }
    generateSuggestions(lastMessageContent);
  }, [lastMessageContent, lastMessageSenderId, currentUserId, generateSuggestions]);

  if (dismissed || (!isLoading && suggestions.length === 0)) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <div className="flex items-center gap-1 text-white/30 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-[10px]">AI</span>
      </div>
      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-20 glass rounded-full animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onSelectSuggestion(suggestion)}
              className="flex-shrink-0 px-3 py-1.5 glass rounded-full text-white/70 text-xs hover:bg-white/10 hover:text-white transition-colors border border-white/5"
            >
              {suggestion}
            </button>
          ))}
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-white/20 hover:text-white/40 px-1"
            title="Dismiss suggestions"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

/** Generate contextual fallback suggestions based on message content */
function generateFallbackSuggestions(content: string): string[] {
  const lower = content.toLowerCase();

  if (lower.includes('?')) {
    if (lower.includes('how') || lower.includes('what') || lower.includes('where')) {
      return ["Let me check!", "I'm not sure, let me find out", "Good question!"];
    }
    if (lower.includes('want') || lower.includes('like') || lower.includes('can')) {
      return ["Sure, sounds great!", "Maybe later", "Let me think about it"];
    }
    return ["Yes!", "No, sorry", "Maybe, let me check"];
  }

  if (lower.includes('thanks') || lower.includes('thank')) {
    return ["You're welcome!", "No problem!", "Anytime!"];
  }

  if (lower.includes('hey') || lower.includes('hi') || lower.includes('hello')) {
    return ["Hey! How's it going?", "What's up?", "Hey there!"];
  }

  if (lower.includes('lol') || lower.includes('haha') || lower.includes('funny')) {
    return ["Haha right?!", "So funny!", "I know right!"];
  }

  return ["That's cool!", "Nice!", "Got it!"];
}
