'use client';

import { motion } from 'framer-motion';
import type { ProfileStyle } from './ProfileCustomizerTypes';
import { GRADIENT_PRESETS } from './ProfileCustomizerTypes';

interface StyleTabProps {
  style: ProfileStyle;
  updateStyle: <K extends keyof ProfileStyle>(key: K, value: ProfileStyle[K]) => void;
}

export function StyleTab({ style, updateStyle }: StyleTabProps) {
  return (
    <motion.div
      key="style"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header Gradient */}
      <div>
        <label className="text-white/50 text-sm block mb-2">Header Gradient</label>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((gradient, index) => (
            <motion.button
              key={index}
              className={`h-12 rounded-lg ${
                style.headerGradient[0] === gradient[0] ? 'ring-2 ring-white' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
              }}
              onClick={() => updateStyle('headerGradient', gradient)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>
      </div>

      {/* Card Style */}
      <div>
        <label className="text-white/50 text-sm block mb-2">Card Style</label>
        <div className="grid grid-cols-2 gap-2">
          {(['glass', 'solid', 'gradient', 'minimal'] as const).map((cardStyle) => (
            <motion.button
              key={cardStyle}
              className={`p-4 rounded-xl text-center capitalize ${
                style.cardStyle === cardStyle
                  ? 'bg-purple-500/30 border border-purple-500/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => updateStyle('cardStyle', cardStyle)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-white/70 text-sm">{cardStyle}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Font Style */}
      <div>
        <label className="text-white/50 text-sm block mb-2">Font Style</label>
        <div className="grid grid-cols-2 gap-2">
          {(['modern', 'classic', 'playful', 'elegant'] as const).map((font) => (
            <motion.button
              key={font}
              className={`p-3 rounded-xl text-center capitalize ${
                style.fontStyle === font
                  ? 'bg-purple-500/30 border border-purple-500/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => updateStyle('fontStyle', font)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-white/70 text-sm">{font}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
