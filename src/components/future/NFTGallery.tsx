'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWeb3, useNFT } from '@/hooks/useWeb3';

interface NFTGalleryProps {
  className?: string;
}

export function NFTGallery({ className = '' }: NFTGalleryProps) {
  const { wallet } = useWeb3();
  const { nfts, isLoading, fetchNFTs, setAsProfilePicture } = useNFT();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);

  if (!wallet) {
    return (
      <div className={`text-center p-8 glass-card rounded-2xl ${className}`}>
        <span className="text-4xl mb-4 block">🖼️</span>
        <p className="text-white/70">Connect your wallet to view NFTs</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`glass-card p-6 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Your NFTs</h3>
        <motion.button
          className="text-purple-400 text-sm"
          onClick={fetchNFTs}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </motion.button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          No NFTs found. Click Refresh to load.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {nfts.map((nft) => (
            <motion.button
              key={nft.id}
              className={`aspect-square rounded-xl overflow-hidden relative ${
                selectedNFT === nft.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedNFT(nft.id === selectedNFT ? null : nft.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                <span className="text-3xl">🖼️</span>
                <span className="text-white text-xs mt-2 truncate w-full text-center">
                  {nft.name}
                </span>
              </div>

              {selectedNFT === nft.id && (
                <motion.div
                  className="absolute inset-0 bg-black/60 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.button
                    className="px-3 py-1 bg-purple-500 rounded-lg text-white text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAsProfilePicture(nft);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Set as PFP
                  </motion.button>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default NFTGallery;
