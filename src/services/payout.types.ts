/**
 * Payout Management Types
 * 
 * Type definitions for payout management API responses and data structures
 */

/**
 * Payout status enum
 */
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * Payout interface
 */
export interface IPayout {
  payout_id: string;
  provider: {
    provider_id: string;
    name: string;
    email: string;
    phone: string;
  };
  total_earnings: number;
  commission_deducted: number;
  net_amount: number;
  status: PayoutStatus;
  payout_date: string | null;
  processed_at: string | null;
  failure_reason: string | null;
  bank_account: string;
  ifsc_code: string;
  created_at: string;
}

/**
 * Query parameters for fetching payouts
 */
export interface IGetPayoutsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
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
 * API response structure for get payouts endpoint
 */
export interface IGetPayoutsResponse {
  success: boolean;
  data: {
    payouts: IPayout[];
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * Payout statistics interface
 */
export interface IPayoutStats {
  pending_amount: number;
  total_commission: number;
  total_payouts: number;
}

/**
 * API response structure for payout stats endpoint
 */
export interface IGetPayoutStatsResponse {
  success: boolean;
  data: IPayoutStats;
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

