'use client';

import { StarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { StepCard } from './StepCard';
import { TierEditorCard, type TierEditor } from './TierEditorCard';

interface SubscriptionTiersEditorProps {
  tiers: TierEditor[];
  isSaving: boolean;
  onAddTier: () => void;
  onUpdateTier: (index: number, field: 'name' | 'price', value: string) => void;
  onRemoveTier: (index: number) => void;
  onAddBenefit: (tierIndex: number) => void;
  onRemoveBenefit: (tierIndex: number, benefitIndex: number) => void;
  onSave: () => void;
}

export function SubscriptionTiersEditor({
  tiers,
  isSaving,
  onAddTier,
  onUpdateTier,
  onRemoveTier,
  onAddBenefit,
  onRemoveBenefit,
  onSave,
}: SubscriptionTiersEditorProps) {
  return (
    <StepCard
      title="Subscription Tiers"
      subtitle={`${tiers.length} tier(s) configured`}
      icon={StarIcon}
      iconColor="bg-purple-500/30"
    >
      <div className="space-y-4">
        <p className="text-white/70 text-sm">
          Set up subscription tiers for your fans. They&apos;ll be charged monthly.
        </p>

        {/* Tier list */}
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <TierEditorCard
              key={tier.id}
              tier={tier}
              index={index}
              onUpdate={(field, value) => onUpdateTier(index, field, value)}
              onRemove={() => onRemoveTier(index)}
              onAddBenefit={() => onAddBenefit(index)}
              onRemoveBenefit={(benefitIndex) => onRemoveBenefit(index, benefitIndex)}
            />
          ))}
        </div>

        {/* Add tier button */}
        {tiers.length < 3 && (
          <button
            onClick={onAddTier}
            className="w-full py-2 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:border-white/40 transition flex items-center justify-center gap-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Tier
          </button>
        )}

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={tiers.length === 0 || isSaving}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Subscription Tiers'
          )}
        </button>
      </div>
    </StepCard>
  );
}
