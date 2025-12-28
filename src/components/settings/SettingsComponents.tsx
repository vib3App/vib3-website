'use client';

import { ReactNode } from 'react';

interface SettingsToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange?: () => void;
}

export function SettingsToggle({ label, description, enabled }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <span className="text-white block">{label}</span>
        {description && <span className="text-white/50 text-sm">{description}</span>}
      </div>
      <button className={`w-12 h-7 rounded-full relative ${enabled ? 'bg-purple-500' : 'bg-white/20'}`}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${enabled ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}

interface SettingsLinkProps {
  label: string;
  icon?: ReactNode;
  iconBg?: string;
  rightContent?: ReactNode;
  showArrow?: boolean;
  onClick?: () => void;
}

export function SettingsLink({ label, icon, iconBg, rightContent, showArrow = true }: SettingsLinkProps) {
  return (
    <button className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg || 'bg-white/10'}`}>
            {icon}
          </div>
        )}
        <span className="text-white">{label}</span>
      </div>
      {rightContent || (showArrow && (
        <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ))}
    </button>
  );
}

interface SettingsCardProps {
  children: ReactNode;
}

export function SettingsCard({ children }: SettingsCardProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
      {children}
    </div>
  );
}

interface SettingsSectionTitleProps {
  title: string;
}

export function SettingsSectionTitle({ title }: SettingsSectionTitleProps) {
  return <h3 className="text-white/50 text-sm font-medium px-1 mb-2">{title}</h3>;
}

interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}

export function SettingsSelect({ label, description, value, options }: SettingsSelectProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <span className="text-white block">{label}</span>
        {description && <span className="text-white/50 text-sm">{description}</span>}
      </div>
      <select className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm" value={value}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}
