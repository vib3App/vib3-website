'use client';

import { useState } from 'react';

const vibes = [
  { name: 'Energetic', emoji: '⚡' },
  { name: 'Chill', emoji: '😌' },
  { name: 'Creative', emoji: '🎨' },
  { name: 'Social', emoji: '🎉' },
  { name: 'Romantic', emoji: '💕' },
  { name: 'Funny', emoji: '😂' },
  { name: 'Inspirational', emoji: '✨' },
];

interface VideoDetailsFormProps {
  caption: string;
  onCaptionChange: (caption: string) => void;
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  selectedVibe: string | null;
  onVibeChange: (vibe: string | null) => void;
  visibility: 'public' | 'followers' | 'private';
  onVisibilityChange: (visibility: 'public' | 'followers' | 'private') => void;
  allowComments: boolean;
  onAllowCommentsChange: (allow: boolean) => void;
  allowDuet: boolean;
  onAllowDuetChange: (allow: boolean) => void;
  allowStitch: boolean;
  onAllowStitchChange: (allow: boolean) => void;
  showSchedule: boolean;
  onShowScheduleChange: (show: boolean) => void;
  scheduleDate: string;
  onScheduleDateChange: (date: string) => void;
  scheduleTime: string;
  onScheduleTimeChange: (time: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSavingDraft: boolean;
}

export function VideoDetailsForm({
  caption,
  onCaptionChange,
  hashtags,
  onHashtagsChange,
  selectedVibe,
  onVibeChange,
  visibility,
  onVisibilityChange,
  allowComments,
  onAllowCommentsChange,
  allowDuet,
  onAllowDuetChange,
  allowStitch,
  onAllowStitchChange,
  showSchedule,
  onShowScheduleChange,
  scheduleDate,
  onScheduleDateChange,
  scheduleTime,
  onScheduleTimeChange,
  onSaveDraft,
  onPublish,
  isSavingDraft,
}: VideoDetailsFormProps) {
  const [hashtagInput, setHashtagInput] = useState('');

  const handleHashtagAdd = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      onHashtagsChange([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Caption */}
      <div>
        <label className="block text-white font-medium mb-2">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Write a caption..."
          maxLength={2200}
          rows={4}
          className="w-full bg-[#1A1F2E] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 resize-none focus:ring-2 focus:ring-[#6366F1]"
        />
        <div className="text-right text-white/30 text-sm mt-1">
          {caption.length}/2200
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-white font-medium mb-2">Hashtags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[#6366F1]/20 text-[#6366F1] rounded-full text-sm flex items-center gap-1"
            >
              #{tag}
              <button
                onClick={() => onHashtagsChange(hashtags.filter(t => t !== tag))}
                className="hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleHashtagAdd())}
            placeholder="Add hashtag..."
            className="flex-1 bg-[#1A1F2E] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1]"
          />
          <button
            onClick={handleHashtagAdd}
            className="px-4 py-3 bg-[#1A1F2E] text-white rounded-xl hover:bg-[#252A3E]"
          >
            Add
          </button>
        </div>
      </div>

      {/* Vibe */}
      <div>
        <label className="block text-white font-medium mb-2">Vibe</label>
        <div className="flex flex-wrap gap-2">
          {vibes.map((vibe) => (
            <button
              key={vibe.name}
              onClick={() => onVibeChange(selectedVibe === vibe.name ? null : vibe.name)}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 transition-colors ${
                selectedVibe === vibe.name
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-[#1A1F2E] text-white/70 hover:bg-[#252A3E]'
              }`}
            >
              <span>{vibe.emoji}</span>
              <span>{vibe.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-white font-medium mb-2">Who can watch</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'public', label: 'Everyone', icon: '🌍' },
            { value: 'followers', label: 'Followers', icon: '👥' },
            { value: 'private', label: 'Only Me', icon: '🔒' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onVisibilityChange(option.value as typeof visibility)}
              className={`p-4 rounded-xl text-center transition-colors ${
                visibility === option.value
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-[#1A1F2E] text-white/70 hover:bg-[#252A3E]'
              }`}
            >
              <span className="text-2xl block mb-1">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <ToggleRow label="Allow comments" enabled={allowComments} onChange={onAllowCommentsChange} />
        <ToggleRow label="Allow Duet & Echo" enabled={allowDuet} onChange={onAllowDuetChange} />
        <ToggleRow label="Allow Stitch" enabled={allowStitch} onChange={onAllowStitchChange} />
      </div>

      {/* Schedule */}
      <div className="p-4 bg-[#1A1F2E] rounded-xl">
        <button
          onClick={() => onShowScheduleChange(!showSchedule)}
          className="w-full flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Schedule for later</span>
          </div>
          <svg className={`w-5 h-5 transition-transform ${showSchedule ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSchedule && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-2">Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => onScheduleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#0A0E1A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-2">Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => onScheduleTimeChange(e.target.value)}
                className="w-full bg-[#0A0E1A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onSaveDraft}
          disabled={isSavingDraft}
          className="flex-1 py-4 bg-[#1A1F2E] text-white font-semibold rounded-full hover:bg-[#252A3E] transition-colors disabled:opacity-50"
        >
          {isSavingDraft ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={onPublish}
          className="flex-1 py-4 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          {showSchedule && scheduleDate && scheduleTime ? 'Schedule' : 'Post'}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#1A1F2E] rounded-xl">
      <span className="text-white">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-[#6366F1]' : 'bg-white/20'
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}
