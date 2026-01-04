'use client';

import { motion } from 'framer-motion';

export function HashtagSuggestions({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`glass-card p-4 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Smart Hashtags</h3>
          <p className="text-white/50 text-sm">AI-powered suggestions</p>
        </div>
        <div className="text-2xl">#️⃣</div>
      </div>

      <div className="text-center py-6">
        <p className="text-white/40 text-sm">
          AI hashtag suggestions will appear after you upload your video
        </p>
      </div>
    </motion.div>
  );
}

export default HashtagSuggestions;
