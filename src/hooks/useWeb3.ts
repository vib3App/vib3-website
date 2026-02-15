'use client';

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/utils/logger';

interface WalletInfo {
  address: string;
  chainId: number;
  balance: string;
  isConnected: boolean;
}

interface NFT {
  id: string;
  name: string;
  image: string;
  collection: string;
  tokenId: string;
}

interface Web3Capabilities {
  hasMetaMask: boolean;
  hasWalletConnect: boolean;
  hasCoinbaseWallet: boolean;
  isWeb3Ready: boolean;
}

/**
 * Hook for Web3 wallet integration
 * Ready for NFT features and crypto payments
 */
export function useWeb3() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [capabilities, setCapabilities] = useState<Web3Capabilities>({
    hasMetaMask: false,
    hasWalletConnect: false,
    hasCoinbaseWallet: false,
    isWeb3Ready: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check Web3 capabilities
  useEffect(() => {
    const ethereum = (window as Window & { ethereum?: { isMetaMask?: boolean; isCoinbaseWallet?: boolean } }).ethereum;

    setCapabilities({
      hasMetaMask: !!ethereum?.isMetaMask,
      hasWalletConnect: true, // Always available via modal
      hasCoinbaseWallet: !!ethereum?.isCoinbaseWallet,
      isWeb3Ready: !!ethereum,
    });
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet(null);
  }, []);

  // Connect wallet
  const connect = useCallback(async (_provider: 'metamask' | 'walletconnect' | 'coinbase' = 'metamask') => {
    setIsConnecting(true);
    setError(null);

    try {
      const ethereum = (window as Window & { ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
        on: (event: string, handler: (...args: unknown[]) => void) => void;
      } }).ethereum;

      if (!ethereum) {
        throw new Error('No Web3 provider found. Please install MetaMask.');
      }

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' }) as unknown as string;

      // Get balance
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      }) as unknown as string;

      setWallet({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        balance: (parseInt(balance, 16) / 1e18).toFixed(4),
        isConnected: true,
      });

      // Listen for account changes
      ethereum.on('accountsChanged', (newAccounts: unknown) => {
        const accts = newAccounts as string[];
        if (accts.length === 0) {
          disconnect();
        } else {
          setWallet(prev => prev ? { ...prev, address: accts[0] } : null);
        }
      });

      // Listen for chain changes
      ethereum.on('chainChanged', (newChainId: unknown) => {
        setWallet(prev => prev ? { ...prev, chainId: parseInt(newChainId as string, 16) } : null);
      });

    } catch (e) {
      const error = e as Error;
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  }, [disconnect]);

  // Sign message (for authentication)
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!wallet) return null;

    try {
      const ethereum = (window as Window & { ethereum?: {
        request: (args: { method: string; params: unknown[] }) => Promise<string>;
      } }).ethereum;
      if (!ethereum) return null;

      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, wallet.address],
      });

      return signature;
    } catch (e) {
      const error = e as Error;
      setError(error.message);
      return null;
    }
  }, [wallet]);

  // Format address for display
  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return {
    wallet,
    capabilities,
    isConnecting,
    error,
    connect,
    disconnect,
    signMessage,
    formatAddress,
  };
}

/**
 * Hook for NFT-related functionality
 */
export function useNFT() {
  const { wallet } = useWeb3();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's NFTs
  const fetchNFTs = useCallback(async () => {
    if (!wallet?.address) return;

    setIsLoading(true);
    try {
      // NFT indexer integration not yet configured — feature-flagged off
      await new Promise(resolve => setTimeout(resolve, 500));
      setNfts([]);
    } catch {
      // Feature not available
    } finally {
      setIsLoading(false);
    }
  }, [wallet?.address]);

  // Set NFT as profile picture
  const setAsProfilePicture = useCallback(async (_nft: NFT) => {
    // NFT profile picture integration — feature-flagged off
  }, []);

  // Mint NFT (placeholder)
  const mintNFT = useCallback(async (_metadata: { name: string; description: string; image: string }) => {
    if (!wallet) throw new Error('Wallet not connected');
    throw new Error('NFT minting is not yet available');
  }, [wallet]);

  return {
    nfts,
    isLoading,
    fetchNFTs,
    setAsProfilePicture,
    mintNFT,
  };
}

/**
 * Hook for crypto tipping/payments
 */
export function useCryptoPayments() {
  const { wallet, signMessage: _signMessage } = useWeb3();
  const [isProcessing, setIsProcessing] = useState(false);

  // Send tip in ETH
  const sendTip = useCallback(async (
    recipientAddress: string,
    amountEth: string
  ): Promise<string | null> => {
    if (!wallet) return null;

    setIsProcessing(true);
    try {
      const ethereum = (window as Window & { ethereum?: {
        request: (args: { method: string; params: unknown[] }) => Promise<string>;
      } }).ethereum;
      if (!ethereum) return null;

      const amountWei = `0x${(parseFloat(amountEth) * 1e18).toString(16)}`;

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to: recipientAddress,
          value: amountWei,
        }],
      });

      return txHash;
    } catch (e) {
      logger.error('Transaction failed:', e);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [wallet]);

  return {
    sendTip,
    isProcessing,
    isReady: !!wallet,
  };
}

export default useWeb3;
