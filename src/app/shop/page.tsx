'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { shopApi } from '@/services/api';
import type { Product, ProductCategory, CartItem } from '@/types/shop';

const categories = [
  { id: 'all', label: 'All', icon: '🛍️' },
  { id: 'effects', label: 'Effects & Filters', icon: '✨' },
  { id: 'digital', label: 'Digital Items', icon: '💎' },
  { id: 'creator', label: 'Creator Tools', icon: '🎬' },
  { id: 'merch', label: 'Merchandise', icon: '👕' },
];

const categoryIcons: Record<string, string> = {
  effects: '✨',
  digital: '💎',
  creator: '🎬',
  merch: '👕',
  subscription: '🔄',
  bundle: '📦',
};

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchProducts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = reset ? 1 : page;
      const response = await shopApi.getProducts({
        category: activeCategory,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 20,
      });
      if (reset) {
        setProducts(response.products);
      } else {
        setProducts((prev) => [...prev, ...response.products]);
      }
      setHasMore(response.hasMore);
      if (reset) setPage(1);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, page]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts(true);
    }, searchQuery ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    setActiveCategory(category);
    setPage(1);
  };

  const loadMore = () => {
    setPage((p) => p + 1);
    fetchProducts(false);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product._id, product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  const cartCoinTotal = cart.reduce(
    (total, item) => total + (item.product?.coinPrice || 0) * item.quantity,
    0
  );

  const handleCheckout = async (paymentMethod: 'stripe' | 'coins') => {
    if (cart.length === 0) return;
    try {
      setCheckingOut(true);
      const response = await shopApi.checkout({
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod,
      });
      if (response.success) {
        if (response.requiresPayment) {
          // TODO: Integrate Stripe payment flow
          alert('Stripe payment integration coming soon!');
        } else {
          alert(`Order placed successfully! Order #: ${response.order.orderNumber}`);
          setCart([]);
          setShowCart(false);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to complete checkout. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const canPayWithCoins = cart.every((item) => item.product?.coinPrice);

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        {/* Hero Header - Liquid Glass */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 via-pink-500/50 to-teal-400/50" />
          <div className="absolute inset-0 backdrop-blur-3xl" />
          {/* Back Button */}
          <Link
            href="/feed"
            className="absolute top-4 left-4 z-10 p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeftIcon className="w-5 h-5 text-white" />
          </Link>
          <div className="relative px-6 py-16 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              VIB3 Shop
            </h1>
            <p className="text-xl text-white/80 mb-8">Exclusive items, effects, and creator tools</p>

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
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="absolute top-4 right-4 glass px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-white hover:bg-white/20 transition"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="px-2 py-0.5 bg-purple-500 rounded-full text-sm">{cart.length}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs - Glass Pills */}
        <div className="flex gap-2 px-6 py-4 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as ProductCategory | 'all')}
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

        {/* Content */}
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchProducts(true)}
              className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-xl font-semibold text-white mb-2">No products found</h2>
            <p className="text-white/60">
              {searchQuery ? 'Try adjusting your search' : 'Check back soon for new items!'}
            </p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product._id} className="glass-card hover:border-purple-500/30 transition-all group">
                  {/* Product Image */}
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

                  {/* Product Info */}
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
                        onClick={() => addToCart(product)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-xl hover:opacity-90 transition-opacity"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-4 text-center pb-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
            <div className="relative w-full max-w-md bg-gray-900 h-full overflow-y-auto">
              {/* Cart Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <ShoppingCartIcon className="w-16 h-16 text-white/30 mb-4" />
                  <p className="text-white/60">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="p-4 space-y-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-3 glass rounded-xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          {item.product?.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            categoryIcons[item.product?.category || 'digital']
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm line-clamp-1">{item.product?.name}</h3>
                          <p className="text-white/60 text-sm">${item.product?.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-white/40 hover:text-red-400 transition"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cart Footer */}
                  <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-4 space-y-4">
                    <div className="flex justify-between text-white">
                      <span>Total</span>
                      <span className="font-bold">${cartTotal.toFixed(2)}</span>
                    </div>
                    {canPayWithCoins && cartCoinTotal > 0 && (
                      <div className="flex justify-between text-amber-500 text-sm">
                        <span>Or pay with coins</span>
                        <span>{cartCoinTotal} V3 Coins</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCheckout('stripe')}
                        disabled={checkingOut}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {checkingOut ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                      </button>
                      {canPayWithCoins && cartCoinTotal > 0 && (
                        <button
                          onClick={() => handleCheckout('coins')}
                          disabled={checkingOut}
                          className="w-full bg-amber-500/20 text-amber-500 font-semibold py-3 rounded-xl hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                        >
                          Pay with {cartCoinTotal} Coins
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
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
