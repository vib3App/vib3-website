'use client';

import Image from 'next/image';
import type { Product } from '@/types/shop';
import { categoryIcons } from './shopConfig';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="glass-card hover:border-purple-500/30 transition-all group">
      <div className="relative aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        {product.imageUrl || product.images?.[0]?.url ? (
          <Image
            src={product.imageUrl || product.images![0].url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {categoryIcons[product.category] || '🛍️'}
          </div>
        )}
        {product.badge && (
          <div
            className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${
              product.badge.toLowerCase() === 'sale'
                ? 'bg-red-500 text-white'
                : product.badge.toLowerCase() === 'new'
                ? 'bg-green-500 text-white'
                : 'bg-purple-500 text-white'
            }`}
          >
            {product.badge}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-white/50 text-sm mb-3 line-clamp-2">
          {product.shortDescription || product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-white/40 line-through text-sm">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.coinPrice && (
              <div className="text-amber-500 text-sm">or {product.coinPrice} V3 Coins</div>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
