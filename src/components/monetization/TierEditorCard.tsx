'use client';

import { TrashIcon } from '@heroicons/react/24/outline';

export interface TierEditor {
  id: string;
  name: string;
  price: string;
  benefits: string[];
  isNew?: boolean;
}

interface TierEditorCardProps {
  tier: TierEditor;
  index: number;
  onUpdate: (field: 'name' | 'price', value: string) => void;
  onRemove: () => void;
  onAddBenefit: () => void;
  onRemoveBenefit: (benefitIndex: number) => void;
}

export function TierEditorCard({
  tier,
  index,
  onUpdate,
  onRemove,
  onAddBenefit,
  onRemoveBenefit,
}: TierEditorCardProps) {
  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-sm">Tier {index + 1}</span>
        <button onClick={onRemove} className="p-1 hover:bg-red-500/20 rounded transition">
          <TrashIcon className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Tier Name</label>
          <input
            type="text"
            value={tier.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="e.g., Supporter"
            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Monthly Price (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
            <input
              type="number"
              step="0.01"
              min="0.50"
              value={tier.price}
              onChange={(e) => onUpdate('price', e.target.value)}
              placeholder="4.99"
              className="w-full pl-7 pr-3 py-2 bg-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-white/50 text-xs mb-2 block">Benefits</label>
        <div className="flex flex-wrap gap-2">
          {tier.benefits.map((benefit, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-white text-xs"
            >
              {benefit}
              <button onClick={() => onRemoveBenefit(i)} className="ml-1 hover:text-red-400">
                &times;
              </button>
            </span>
          ))}
          <button
            onClick={onAddBenefit}
            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs hover:bg-purple-500/30 transition"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
