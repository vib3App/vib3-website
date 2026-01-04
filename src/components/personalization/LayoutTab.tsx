'use client';

import { motion } from 'framer-motion';
import type { ProfileStyle } from './ProfileCustomizerTypes';

interface LayoutTabProps {
  style: ProfileStyle;
  updateStyle: <K extends keyof ProfileStyle>(key: K, value: ProfileStyle[K]) => void;
}

export function LayoutTab({ style, updateStyle }: LayoutTabProps) {
  return (
    <motion.div
      key="layout"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Layout Density */}
      <div>
        <label className="text-white/50 text-sm block mb-2">Content Density</label>
        <div className="grid grid-cols-3 gap-2">
          {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
            <motion.button
              key={density}
              className={`p-3 rounded-xl text-center capitalize ${
                style.layoutDensity === density
                  ? 'bg-purple-500/30 border border-purple-500/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => updateStyle('layoutDensity', density)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-white/70 text-sm">{density}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid Preview */}
      <div>
        <label className="text-white/50 text-sm block mb-2">Grid Preview</label>
        <div
          className={`grid gap-1 ${
            style.layoutDensity === 'compact'
              ? 'grid-cols-4'
              : style.layoutDensity === 'spacious'
                ? 'grid-cols-2'
                : 'grid-cols-3'
          }`}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
