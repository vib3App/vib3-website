'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';

interface Web3ConnectProps {
  className?: string;
}

/**
 * Web3 wallet connection component
 */
export function Web3Connect({ className = '' }: Web3ConnectProps) {
  const {
    wallet,
    capabilities,
    isConnecting,
    error,
    connect,
    disconnect,
    formatAddress,
  } = useWeb3();

  const [showModal, setShowModal] = useState(false);

  if (!capabilities.isWeb3Ready) {
    return (
      <motion.button
        className={`px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl
                   text-orange-300 text-sm ${className}`}
        onClick={() => window.open('https://metamask.io', '_blank')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Install Wallet
      </motion.button>
    );
  }

  if (wallet) {
    return (
      <div className={`relative ${className}`}>
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30
                     rounded-xl text-green-300"
          onClick={() => setShowModal(!showModal)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm font-mono">{formatAddress(wallet.address)}</span>
          <span className="text-xs text-green-400/70">{wallet.balance} ETH</span>
        </motion.button>

        <AnimatePresence>
          {showModal && (
            <motion.div
              className="absolute top-full right-0 mt-2 w-64 p-4 glass-card rounded-xl z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
            >
              <div className="space-y-4">
                <div>
                  <div className="text-white/50 text-xs">Connected Wallet</div>
                  <div className="text-white font-mono text-sm break-all">
                    {wallet.address}
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Balance</span>
                  <span className="text-white">{wallet.balance} ETH</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Network</span>
                  <span className="text-white">
                    {wallet.chainId === 1 ? 'Ethereum' : `Chain ${wallet.chainId}`}
                  </span>
                </div>

                <motion.button
                  className="w-full py-2 bg-red-500/20 border border-red-500/30 rounded-lg
                           text-red-300 text-sm"
                  onClick={() => {
                    disconnect();
                    setShowModal(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Disconnect
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.button
        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30
                   rounded-xl text-purple-300"
        onClick={() => setShowModal(true)}
        disabled={isConnecting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isConnecting ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-sm">Connecting...</span>
          </>
        ) : (
          <>
            <span>🔗</span>
            <span className="text-sm">Connect Wallet</span>
          </>
        )}
      </motion.button>

      {/* Wallet selection modal */}
      <AnimatePresence>
        {showModal && !wallet && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         w-80 p-6 glass-card rounded-2xl z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="text-white font-medium text-lg mb-4">Connect Wallet</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg
                               text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {capabilities.hasMetaMask && (
                  <motion.button
                    className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl
                               hover:bg-white/10 transition-colors"
                    onClick={() => {
                      connect('metamask');
                      setShowModal(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">🦊</span>
                    <span className="text-white">MetaMask</span>
                  </motion.button>
                )}

                <motion.button
                  className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl
                             hover:bg-white/10 transition-colors"
                  onClick={() => {
                    connect('walletconnect');
                    setShowModal(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">🔵</span>
                  <span className="text-white">WalletConnect</span>
                </motion.button>

                {capabilities.hasCoinbaseWallet && (
                  <motion.button
                    className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl
                               hover:bg-white/10 transition-colors"
                    onClick={() => {
                      connect('coinbase');
                      setShowModal(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">💰</span>
                    <span className="text-white">Coinbase Wallet</span>
                  </motion.button>
                )}
              </div>

              <motion.button
                className="w-full mt-4 py-2 text-white/50 text-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Web3Connect;
