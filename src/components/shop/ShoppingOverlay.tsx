'use client';

import { useState } from 'react';
import { useVideoShopping } from '@/hooks/useVideoShopping';
import { ProductQuickView } from './ProductQuickView';
import type { Product } from '@/types/shop';

interface ShoppingOverlayProps {
  videoId: string;
}

export function ShoppingOverlay({ videoId }: ShoppingOverlayProps) {
  const { products } = useVideoShopping(videoId);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (products.length === 0) return null;

  return (
    <>
      <div className="absolute bottom-36 md:bottom-24 left-4 z-20">
        <button
          onClick={() => setSelectedProduct(products[0])}
          className="flex items-center gap-2 glass px-3 py-2 rounded-full hover:bg-white/10 transition-all group"
        >
          <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-white/80 text-xs font-medium group-hover:text-white">
            {products[0].name}
          </span>
          {products.length > 1 && (
            <span className="text-white/40 text-xs">+{products.length - 1}</span>
          )}
        </button>
      </div>

      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={setSelectedProduct}
        />
      )}
    </>
  );
}
