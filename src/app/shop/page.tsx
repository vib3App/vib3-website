'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TopNav } from '@/components/ui/TopNav';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: 'merch' | 'digital' | 'creator' | 'effects';
  badge?: string;
  coinPrice?: number;
}

const products: Product[] = [
  {
    id: '1',
    name: 'VIB3 Premium Effects Pack',
    description: 'Unlock 50+ exclusive video effects and filters',
    price: 9.99,
    coinPrice: 1000,
    category: 'effects',
    badge: 'Popular',
  },
  {
    id: '2',
    name: 'Creator Starter Bundle',
    description: 'Everything you need to start creating amazing content',
    price: 19.99,
    originalPrice: 29.99,
    category: 'digital',
    badge: 'Sale',
  },
  {
    id: '3',
    name: 'VIB3 Hoodie',
    description: 'Premium quality hoodie with embroidered VIB3 logo',
    price: 49.99,
    category: 'merch',
  },
  {
    id: '4',
    name: 'Profile Badge: Verified Creator',
    description: 'Show off your verified creator status',
    price: 4.99,
    coinPrice: 500,
    category: 'digital',
  },
  {
    id: '5',
    name: 'Custom Intro Animation',
    description: 'Personalized video intro with your branding',
    price: 14.99,
    category: 'creator',
  },
  {
    id: '6',
    name: 'VIB3 T-Shirt',
    description: 'Soft cotton t-shirt with VIB3 print',
    price: 24.99,
    category: 'merch',
  },
  {
    id: '7',
    name: 'AR Filters Pack',
    description: '25 unique AR filters for your videos',
    price: 7.99,
    coinPrice: 750,
    category: 'effects',
    badge: 'New',
  },
  {
    id: '8',
    name: 'Music License Bundle',
    description: 'Access to 1000+ royalty-free tracks',
    price: 29.99,
    originalPrice: 49.99,
    category: 'creator',
    badge: 'Best Value',
  },
];

const categories = [
  { id: 'all', label: 'All', icon: '🛍️' },
  { id: 'effects', label: 'Effects & Filters', icon: '✨' },
  { id: 'digital', label: 'Digital Items', icon: '💎' },
  { id: 'creator', label: 'Creator Tools', icon: '🎬' },
  { id: 'merch', label: 'Merchandise', icon: '👕' },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<string[]>([]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId: string) => {
    setCartItems((prev) => [...prev, productId]);
  };

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        {/* Hero Header - Liquid Glass */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 via-pink-500/50 to-teal-400/50" />
          <div className="absolute inset-0 backdrop-blur-3xl" />
          <div className="relative px-6 py-16 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              VIB3 Shop
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Exclusive items, effects, and creator tools
            </p>

            {/* Search - Glass Style */}
            <div className="max-w-md mx-auto relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full glass-heavy rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Cart indicator - Glass */}
            {cartItems.length > 0 && (
              <div className="absolute top-4 right-4 glass px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="px-2 py-0.5 bg-purple-500 rounded-full text-sm">{cartItems.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs - Glass Pills */}
        <div className="flex gap-2 px-6 py-4 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-white/20 shadow-lg shadow-purple-500/20'
                  : 'glass text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glass-card hover:border-purple-500/30 transition-all group"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {product.category === 'effects' && '✨'}
                    {product.category === 'digital' && '💎'}
                    {product.category === 'creator' && '🎬'}
                    {product.category === 'merch' && '👕'}
                  </div>
                )}
                {product.badge && (
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${
                      product.badge === 'Sale'
                        ? 'bg-red-500 text-white'
                        : product.badge === 'New'
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 text-white'
                    }`}
                  >
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-white/50 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-white/40 line-through text-sm">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    {product.coinPrice && (
                      <div className="text-amber-500 text-sm">
                        or {product.coinPrice} V3 Coins
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white text-xl font-semibold mb-2">No products found</h3>
            <p className="text-white/50">Try adjusting your search or filter</p>
          </div>
        )}
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
