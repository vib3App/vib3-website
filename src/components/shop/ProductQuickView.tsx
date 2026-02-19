'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/shop';

interface ProductQuickViewProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductQuickView({ product, allProducts, onClose, onSelectProduct }: ProductQuickViewProps) {
  const imageUrl = product.images?.[0]?.url || product.imageUrl;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 rounded-t-3xl animate-slide-up max-h-[70vh] overflow-y-auto">
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="px-4 pb-6">
          <div className="flex gap-4 mb-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0 relative">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold">{product.name}</h3>
              <p className="text-white/50 text-sm line-clamp-2 mt-1">{product.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-white/30 text-sm line-through">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/shop?product=${product._id}`} className="flex-1 py-3 glass text-white text-sm font-medium rounded-xl text-center hover:bg-white/10 transition">
              View Details
            </Link>
            <button className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white text-sm font-semibold rounded-xl">
              Add to Cart
            </button>
          </div>

          {allProducts.length > 1 && (
            <div className="mt-4">
              <h4 className="text-white/50 text-sm mb-2">More products in this video</h4>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {allProducts.map(p => (
                  <button key={p._id} onClick={() => onSelectProduct(p)} className={`shrink-0 w-20 text-center ${p._id === product._id ? 'opacity-50' : ''}`}>
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 relative mb-1">
                      {(p.images?.[0]?.url || p.imageUrl) ? (
                        <Image src={p.images?.[0]?.url || p.imageUrl || ''} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                      )}
                    </div>
                    <span className="text-white/60 text-xs truncate block">${p.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
