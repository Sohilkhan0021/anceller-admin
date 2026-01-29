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
export type CouponType = 'flat' | 'percentage' | 'fixed';

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
  coupon_type?: 'PERCENTAGE' | 'FLAT_AMOUNT'; // Backend version
  coupon_id?: string;
  name?: string;
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
 * Coupon stats interface
 */
export interface ICouponStats {
  total_redemptions: number;
  revenue_impact: number;
  active_coupons: number;
}

/**
 * API response structure for coupon stats
 */
export interface ICouponStatsResponse {
  status: number;
  message: string;
  data: ICouponStats;
}

/**
 * Create coupon request interface
 */
export interface ICreateCouponRequest {
  code: string;
  name: string;
  coupon_type: 'PERCENTAGE' | 'FLAT_AMOUNT';
  discount_value: number;
  max_usage: number;
  valid_until: string;
  description?: string;
  min_order_amount?: number;
}

/**
 * API response structure for create coupon
 */
export interface ICreateCouponResponse {
  status: number;
  message: string;
  data: {
    coupon_id: string;
  };
}

/**
 * API response structure for coupon details
 */
export interface IGetCouponDetailResponse {
  status: number;
  message: string;
  data: {
    coupon: ICoupon;
  };
}

/**
 * Update coupon request interface
 */
export interface IUpdateCouponRequest extends Partial<ICreateCouponRequest> {
  status?: CouponStatus;
  is_active?: boolean;
}

/**
 * API response structure for update coupon
 */
export interface IUpdateCouponResponse {
  status: number;
  message: string;
  data: {
    coupon_id: string;
  };
}

/**
 * API response structure for delete coupon
 */
export interface IDeleteCouponResponse {
  status: number;
  message: string;
  data: null;
}

/**
 * Error response structure
 */
export interface IApiError {
  status: number;
  message: string;
  error?: any;
}

