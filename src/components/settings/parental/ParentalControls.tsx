'use client';

interface ToggleSettingProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

export function ToggleSetting({ title, description, enabled, onToggle }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-500' : 'bg-white/20'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  );
}

interface ButtonGroupProps<T extends string | number | null> {
  title: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}

export function ButtonGroup<T extends string | number | null>({ title, options, selected, onSelect }: ButtonGroupProps<T>) {
  return (
    <div className="p-4 bg-white/5 rounded-xl">
      <p className="text-white font-medium mb-3">{title}</p>
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={String(option.value)}
            onClick={() => onSelect(option.value)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              selected === option.value ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface PINSetupModalProps {
  isOpen: boolean;
  newPIN: string;
  confirmPIN: string;
  error: string;
  onNewPINChange: (value: string) => void;
  onConfirmPINChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function PINSetupModal({ isOpen, newPIN, confirmPIN, error, onNewPINChange, onConfirmPINChange, onCancel, onSubmit }: PINSetupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Set PIN</h3>
        <div className="space-y-4">
          <PINInput label="Enter 4-digit PIN" value={newPIN} onChange={onNewPINChange} />
          <PINInput label="Confirm PIN" value={confirmPIN} onChange={onConfirmPINChange} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 bg-white/10 text-white rounded-xl">Cancel</button>
            <button onClick={onSubmit} className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium">Set PIN</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PINInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-white/50 text-sm">{label}</label>
      <input
        type="password"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        className="w-full mt-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest"
        placeholder="••••"
      />
    </div>
  );
}

interface PINSectionProps {
  isActive: boolean;
  onSetPIN: () => void;
  onRemovePIN: () => void;
}

export function PINSection({ isActive, onSetPIN, onRemovePIN }: PINSectionProps) {
  return (
    <div className="p-4 bg-white/5 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white font-medium">PIN Protection</p>
          <p className="text-white/50 text-sm">Require PIN to change settings</p>
        </div>
        {isActive ? (
          <span className="text-green-400 text-sm">Active</span>
        ) : (
          <span className="text-white/40 text-sm">Not Set</span>
        )}
      </div>
      {isActive ? (
        <button onClick={onRemovePIN} className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg font-medium">Remove PIN</button>
      ) : (
        <button onClick={onSetPIN} className="w-full py-2 bg-purple-500 text-white rounded-lg font-medium">Set PIN</button>
      )}
    </div>
  );
}
