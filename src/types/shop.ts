/**
 * Shop types - Products, orders, and cart
 */

export type ProductCategory = 'effects' | 'digital' | 'creator' | 'merch' | 'subscription' | 'bundle';

export type ProductType = 'physical' | 'digital' | 'subscription' | 'service';

export type DigitalContentType =
  | 'effect_pack'
  | 'filter_pack'
  | 'ar_filter'
  | 'sound_pack'
  | 'music_license'
  | 'badge'
  | 'intro_template'
  | 'other';

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface ProductDigital {
  contentType?: DigitalContentType;
  itemCount?: number;
  contentId?: string;
  duration?: number; // 0 = permanent
}

export interface ProductStats {
  purchaseCount: number;
  viewCount: number;
  rating: number;
  reviewCount: number;
}

export interface ProductCreator {
  _id: string;
  username: string;
  avatar?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: ProductCategory;
  productType: ProductType;
  price: number;
  originalPrice?: number;
  coinPrice?: number;
  currency: string;
  images?: ProductImage[];
  imageUrl?: string;
  badge?: string;
  stock: number;
  digital?: ProductDigital;
  tags?: string[];
  creatorId?: string | ProductCreator;
  isFeatured: boolean;
  isActive: boolean;
  stats: ProductStats;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CartItem {
  productId: string;
  product?: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'stripe' | 'coins' | 'free';

export interface OrderItem {
  productId: string | Product;
  name: string;
  quantity: number;
  price: number;
  coinPrice?: number;
  category: string;
  productType: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  payment: {
    status: string;
    amountCents?: number;
    coinAmount?: number;
    currency: string;
    paidAt?: string;
  };
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface DigitalPurchase {
  orderId: string;
  orderNumber: string;
  product: Product;
  purchasedAt: string;
  contentId?: string;
  expiresAt?: string;
}

export interface CategoryInfo {
  id: string;
  label: string;
  count: number;
}

export interface CheckoutInput {
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  shippingAddress?: ShippingAddress;
}

export interface CheckoutResponse {
  success: boolean;
  order: {
    _id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
  };
  requiresPayment?: boolean;
  amountCents?: number;
  message?: string;
}
