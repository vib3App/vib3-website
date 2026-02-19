'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/types/shop';
import { logger } from '@/utils/logger';

export function useVideoShopping(videoId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await (await import('@/services/api/client')).apiClient.get(`/videos/${videoId}/products`);
        if (!cancelled) setProducts(data.products || data || []);
      } catch (err) {
        logger.error('Failed to load video products:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [videoId]);

  return { products, isLoading };
}
