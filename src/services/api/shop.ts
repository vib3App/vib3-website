/**
 * Shop API service
 */
import { apiClient } from './client';
import type {
  Product,
  ProductListResponse,
  ProductCategory,
  Order,
  DigitalPurchase,
  CategoryInfo,
  CheckoutInput,
  CheckoutResponse,
} from '@/types/shop';

export const shopApi = {
  /**
   * Get list of products with optional filters
   */
  async getProducts(options?: {
    category?: ProductCategory | 'all';
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'popular' | 'newest' | 'price_low' | 'price_high';
    page?: number;
    limit?: number;
  }): Promise<ProductListResponse> {
    const { data } = await apiClient.get<ProductListResponse>('/shop/products', {
      params: {
        category: options?.category === 'all' ? undefined : options?.category,
        search: options?.search,
        minPrice: options?.minPrice,
        maxPrice: options?.maxPrice,
        sort: options?.sort || 'popular',
        page: options?.page || 1,
        limit: options?.limit || 20,
      },
    });
    return data;
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const { data } = await apiClient.get<{ products: Product[] }>('/shop/products/featured');
    return data.products;
  },

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<{ product: Product; hasPurchased: boolean }> {
    const { data } = await apiClient.get<{ product: Product; hasPurchased: boolean }>(
      `/shop/products/${productId}`
    );
    return data;
  },

  /**
   * Get product categories with counts
   */
  async getCategories(): Promise<CategoryInfo[]> {
    const { data } = await apiClient.get<{ categories: CategoryInfo[] }>('/shop/categories');
    return data.categories;
  },

  /**
   * Checkout cart
   */
  async checkout(input: CheckoutInput): Promise<CheckoutResponse> {
    const { data } = await apiClient.post<CheckoutResponse>('/shop/cart/checkout', input);
    return data;
  },

  /**
   * Complete an order (after Stripe payment)
   */
  async completeOrder(orderId: string, paymentIntentId: string): Promise<{ success: boolean; order: Order }> {
    const { data } = await apiClient.post<{ success: boolean; order: Order }>(
      `/shop/orders/${orderId}/complete`,
      { paymentIntentId }
    );
    return data;
  },

  /**
   * Get user's orders
   */
  async getOrders(options?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number; hasMore: boolean }> {
    const { data } = await apiClient.get<{ orders: Order[]; total: number; hasMore: boolean }>('/shop/orders', {
      params: options,
    });
    return data;
  },

  /**
   * Get a single order
   */
  async getOrder(orderId: string): Promise<Order> {
    const { data } = await apiClient.get<{ order: Order }>(`/shop/orders/${orderId}`);
    return data.order;
  },

  /**
   * Get user's digital purchases
   */
  async getPurchases(): Promise<DigitalPurchase[]> {
    const { data } = await apiClient.get<{ purchases: DigitalPurchase[] }>('/shop/purchases');
    return data.purchases;
  },
};
