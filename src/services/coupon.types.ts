/**
 * Coupon Management Types
 * 
 * Type definitions for coupon management API responses and data structures
 */

/**
 * Coupon status enum
 */
export type CouponStatus = 'active' | 'expired' | 'upcoming' | 'deactivated';

/**
 * Coupon type enum
 */
export type CouponType = 'flat' | 'percentage';

/**
 * Coupon entity interface
 */
export interface ICoupon {
  id: string;
  code: string;
  type?: CouponType;
  discount_type?: CouponType; // Snake case version from API
  value?: number;
  discount_value?: number; // Snake case version from API
  expiry?: string;
  expiry_date?: string; // Snake case version from API
  expires_at?: string; // Alternative field name
  usageCount?: number;
  usage_count?: number; // Snake case version from API
  maxUsage?: number;
  max_usage?: number; // Snake case version from API
  status: CouponStatus;
  createdAt?: string;
  created_at?: string; // Snake case version from API
  revenueImpact?: number;
  revenue_impact?: number; // Snake case version from API
  redemptions?: number;
  // Additional fields that might come from API
  public_id?: string;
  description?: string;
  min_order_amount?: number;
  minOrderAmount?: number;
  is_active?: boolean;
  updated_at?: string;
  is_deleted?: boolean;
}

/**
 * Query parameters for fetching coupons
 */
export interface IGetCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * Pagination metadata
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * API response structure for get coupons endpoint
 */
export interface IGetCouponsResponse {
  success: boolean;
  data: {
    coupons?: ICoupon[]; // CamelCase version
    coupon?: ICoupon[]; // Alternative field name
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * Error response structure
 */
export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

