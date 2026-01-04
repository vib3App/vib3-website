'use client';

import { useState, useEffect, useCallback } from 'react';
import { TopNav } from '@/components/ui/TopNav';
import { shopApi } from '@/services/api';
import { ShopHero, CategoryTabs, ProductCard, CartSidebar } from '@/components/shop';
import type { Product, ProductCategory, CartItem } from '@/types/shop';

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
      setProducts(reset ? response.products : (prev) => [...prev, ...response.products]);
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
    const debounce = setTimeout(() => fetchProducts(true), searchQuery ? 300 : 0);
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
          setError('Stripe payment integration coming soon. Please use VIB3 coins for now.');
        } else {
          setCart([]);
          setShowCart(false);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to complete checkout. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        <ShopHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartCount={cart.length}
          onCartClick={() => setShowCart(true)}
        />

        <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

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
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
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

        {showCart && (
          <CartSidebar
            cart={cart}
            onClose={() => setShowCart(false)}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
            checkingOut={checkingOut}
          />
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
