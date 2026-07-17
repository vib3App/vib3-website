'use client';

import { useState } from 'react';
import type { VideoOutlinePlan } from '@/services/api/ai';

/**
 * AI Video Outline — the web port of the app editor's real outline tool.
 *
 * History matters here: this component used to render six HARDCODED fake
 * "scene analysis" results behind a setTimeout ("Simulate AI analysis with
 * mock data"). It now calls the real backend (/api/ai/outline), which runs the
 * same prompt the app's editor uses, and it is honest about what the feature
 * is: a PLANNING tool that builds a hook/script/caption from a topic — it does
 * not analyze the uploaded video frames.
 */
interface AIVideoOutlineProps {
  /** Prefill for the topic box (usually the caption the creator typed). */
  defaultTopic?: string;
  outline: VideoOutlinePlan | null;
  isGenerating: boolean;
  error: string | null;
  onGenerate: (topic: string) => void;
}

export function AIVideoOutline({ defaultTopic, outline, isGenerating, error, onGenerate }: AIVideoOutlineProps) {
  const [topic, setTopic] = useState(defaultTopic ?? '');

  const canGenerate = topic.trim().length > 2 && !isGenerating;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-white font-medium text-sm">AI Video Outline</h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What's this video about?"
          maxLength={300}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
        />
        <button
          onClick={() => canGenerate && onGenerate(topic.trim())}
          disabled={!canGenerate}
          className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full hover:opacity-90 transition disabled:opacity-40"
        >
          {outline ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-purple-500 animate-spin" />
          <p className="text-white/50 text-sm">Building your outline…</p>
        </div>
      )}

      {error && !isGenerating && (
        <p className="text-red-400/80 text-sm">{error}</p>
      )}

      {outline && !isGenerating && (
        <div className="space-y-4">
          <div>
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Hook</p>
            <p className="text-white text-sm">{outline.hook}</p>
          </div>

          {outline.script.length > 0 && (
            <div>
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-2">Script</p>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {outline.script.map((seg, i) => (
                  <div key={i} className="flex gap-3 p-2 aurora-bg rounded-lg">
                    <span className="text-purple-400 font-mono text-xs bg-purple-500/20 px-2 py-0.5 rounded whitespace-nowrap h-fit">
                      {seg.timestamp}
                    </span>
                    <p className="text-white/80 text-sm">{seg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {outline.caption && (
            <div>
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Caption</p>
              <p className="text-white/80 text-sm">{outline.caption}</p>
            </div>
          )}

          {outline.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {outline.hashtags.map((tag, i) => (
                <span key={i} className="text-teal-300 text-xs bg-teal-400/10 rounded-full px-2.5 py-1">{tag}</span>
              ))}
            </div>
          )}

          {outline.tips.length > 0 && (
            <div>
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Filming tips</p>
              <ul className="list-disc list-inside space-y-1">
                {outline.tips.map((tip, i) => (
                  <li key={i} className="text-white/70 text-sm">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
