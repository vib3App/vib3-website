'use client';

import Image from 'next/image';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { CartItem } from '@/types/shop';
import { categoryIcons } from './shopConfig';

interface CartSidebarProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: (method: 'stripe' | 'coins') => void;
  checkingOut: boolean;
}

export function CartSidebar({
  cart,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  checkingOut,
}: CartSidebarProps) {
  const cartTotal = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  const cartCoinTotal = cart.reduce(
    (total, item) => total + (item.product?.coinPrice || 0) * item.quantity,
    0
  );

  const canPayWithCoins = cart.every((item) => item.product?.coinPrice);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900 h-full overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
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
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(item.productId)}
                    className="text-white/40 hover:text-red-400 transition"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

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
                  onClick={() => onCheckout('stripe')}
                  disabled={checkingOut}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {checkingOut ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                </button>
                {canPayWithCoins && cartCoinTotal > 0 && (
                  <button
                    onClick={() => onCheckout('coins')}
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
  );
}
