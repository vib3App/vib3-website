'use client';

import type { FeedOrder } from '@/types';

interface RadioOptionProps {
  value: string;
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}

export function RadioOption({ value: _value, selected, title, description, onSelect }: RadioOptionProps) {
  return (
    <label
      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${
        selected ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
      onClick={onSelect}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-purple-500' : 'border-white/30'}`}>
        {selected && <div className="w-3 h-3 rounded-full bg-purple-500" />}
      </div>
      <div className="flex-1">
        <div className="text-white font-medium">{title}</div>
        <div className="text-white/40 text-sm">{description}</div>
      </div>
    </label>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  title: string;
  description: string;
}

export function ToggleSwitch({ enabled, onToggle, title, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white font-medium">{title}</div>
        <div className="text-white/40 text-sm">{description}</div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-purple-500' : 'bg-white/20'}`}
      >
        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

interface FeedOrderSectionProps {
  feedOrder: FeedOrder;
  onChange: (order: FeedOrder) => void;
}

export function FeedOrderSection({ feedOrder, onChange }: FeedOrderSectionProps) {
  return (
    <SettingsSection title="Feed Order">
      <RadioOption
        value="chronological"
        selected={feedOrder === 'chronological'}
        title="Chronological"
        description="Newest posts first"
        onSelect={() => onChange('chronological')}
      />
      <RadioOption
        value="algorithmic"
        selected={feedOrder === 'algorithmic'}
        title="Algorithmic"
        description="Personalized based on your interests"
        onSelect={() => onChange('algorithmic')}
      />
    </SettingsSection>
  );
}

interface CategoryNameInputProps {
  name: string;
  onChange: (name: string) => void;
}

export function CategoryNameInput({ name, onChange }: CategoryNameInputProps) {
  return (
    <SettingsSection title="Category Name">
      <input
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        maxLength={30}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
      />
      <p className="text-white/30 text-xs mt-2">{name.length}/30</p>
    </SettingsSection>
  );
}
