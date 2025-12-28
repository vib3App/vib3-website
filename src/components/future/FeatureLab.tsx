'use client';

import { motion } from 'framer-motion';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface FeatureLabProps {
  className?: string;
}

const stageColors = {
  alpha: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300' },
  beta: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-300' },
  stable: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-300' },
};

/**
 * Feature Lab - Experimental features panel
 */
export function FeatureLab({ className = '' }: FeatureLabProps) {
  const { getAllFlags, toggleFlag } = useFeatureFlags();
  const flags = getAllFlags();

  const groupedFlags = {
    visual: flags.filter(f => ['liquidGlass', 'depthEffects', 'motionAnimations', 'particleEffects', 'cursorEffects'].includes(f.id)),
    audio: flags.filter(f => ['spatialAudio', 'ambientSounds', 'hapticFeedback'].includes(f.id)),
    ai: flags.filter(f => ['aiRecommendations', 'moodDetection', 'trendPrediction', 'videoSummaries'].includes(f.id)),
    personalization: flags.filter(f => ['customThemes', 'profileBadges', 'preferenceSync'].includes(f.id)),
    future: flags.filter(f => ['arFilters', 'web3Integration', 'nftProfiles', 'cryptoPayments'].includes(f.id)),
    experimental: flags.filter(f => ['voiceCommands', 'gestureNavigation', 'watchParty'].includes(f.id)),
  };

  const renderGroup = (title: string, icon: string, groupFlags: typeof flags) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h4 className="text-white font-medium">{title}</h4>
      </div>

      <div className="space-y-2">
        {groupFlags.map((flag, index) => (
          <motion.div
            key={flag.id}
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <motion.button
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  flag.enabled ? 'bg-purple-500' : 'bg-white/10'
                }`}
                onClick={() => toggleFlag(flag.id as keyof ReturnType<typeof useFeatureFlags>['flags'])}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full"
                  animate={{ x: flag.enabled ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>

              <div>
                <div className="text-white text-sm">{flag.name}</div>
                <div className="text-white/40 text-xs">{flag.description}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${stageColors[flag.stage].bg} ${stageColors[flag.stage].border} ${stageColors[flag.stage].text} border`}
              >
                {flag.stage}
              </span>
              {flag.rolloutPercentage < 100 && (
                <span className="text-white/40 text-xs">{flag.rolloutPercentage}%</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      className={`glass-card p-6 rounded-2xl space-y-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium text-lg">Feature Lab</h3>
          <p className="text-white/50 text-sm">Toggle experimental features</p>
        </div>
        <motion.div
          className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full
                     text-purple-300 text-xs flex items-center gap-1"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>🧪</span>
          <span>Experimental</span>
        </motion.div>
      </div>

      {/* Stage legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${stageColors.alpha.bg}`} />
          <span className="text-white/50">Alpha - Testing</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${stageColors.beta.bg}`} />
          <span className="text-white/50">Beta - Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${stageColors.stable.bg}`} />
          <span className="text-white/50">Stable - Ready</span>
        </div>
      </div>

      {renderGroup('Visual Effects', '✨', groupedFlags.visual)}
      {renderGroup('Audio & Haptics', '🔊', groupedFlags.audio)}
      {renderGroup('AI Features', '🤖', groupedFlags.ai)}
      {renderGroup('Personalization', '🎨', groupedFlags.personalization)}
      {renderGroup('Future Tech', '🚀', groupedFlags.future)}
      {renderGroup('Experimental', '🧪', groupedFlags.experimental)}

      {/* Warning */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <div className="flex items-start gap-2">
          <span className="text-yellow-400">⚠️</span>
          <div>
            <div className="text-yellow-300 text-sm font-medium">Heads up</div>
            <div className="text-yellow-300/70 text-xs">
              Alpha and beta features may be unstable. Some features require
              additional hardware or browser support.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Feature flag badge for indicating beta/alpha status
 */
export function FeatureBadge({ stage }: { stage: 'alpha' | 'beta' | 'stable' }) {
  if (stage === 'stable') return null;

  return (
    <motion.span
      className={`px-2 py-0.5 rounded-full text-xs ${stageColors[stage].bg} ${stageColors[stage].border} ${stageColors[stage].text} border`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      {stage.toUpperCase()}
    </motion.span>
  );
}

export default FeatureLab;
