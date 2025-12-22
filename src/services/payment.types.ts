/**
 * Payment Management Types
 * 
 * Type definitions for payment management API responses and data structures
 */

/**
 * Payment status enum
 */
export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

/**
 * Payment transaction interface
 */
export interface IPaymentTransaction {
  transaction_id: string;
  user: {
    user_id: string;
    name: string;
    phone: string;
  };
  order_id: string;
  amount: number;
  currency: string;
  payment_mode: string;
  payment_method_display: string;
  status: PaymentStatus;
  gateway: string;
  gateway_transaction_id: string | null;
  gateway_response: any;
  created_at: string;
  completed_at: string | null;
}

/**
 * Query parameters for fetching payment transactions
 */
export interface IGetPaymentTransactionsParams {
  page?: number;
  limit?: number;
  status?: string;
  gateway?: string;
  start_date?: string;
  end_date?: string;
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
 * API response structure for get payment transactions endpoint
 */
export interface IGetPaymentTransactionsResponse {
  success: boolean;
  data: {
    transactions: IPaymentTransaction[];
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * Payment detail interface
 */
export interface IPaymentDetail {
  transaction_id: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    phone: string;
  };
  order: {
    order_id: string;
    status: string;
    items: Array<{
      service_name: string;
      quantity: number;
      total_price: number;
    }>;
  };
  payment_details: {
    amount: number;
    currency: string;
    status: PaymentStatus;
    gateway: string;
    gateway_transaction_id: string | null;
    gateway_response: any;
    failure_reason: string | null;
  };
  payment_method: {
    type: string;
    display_name: string;
    last_four_digits: string | null;
  } | null;
  refund_info: {
    refund_amount: number;
    refund_status: string | null;
    refund_transaction_id: string | null;
  };
  transaction_history: Array<{
    transaction_id: string;
    transaction_type: string;
    gateway_transaction_id: string | null;
    amount: number;
    status: string;
    created_at: string;
  }>;
  timestamps: {
    initiated_at: string | null;
    completed_at: string | null;
    created_at: string;
  };
}

/**
 * API response structure for get payment detail endpoint
 */
export interface IGetPaymentDetailResponse {
  success: boolean;
  data: {
    transaction: IPaymentDetail;
  };
  message?: string;
}

/**
 * Revenue statistics interface
 */
export interface IRevenueStats {
  total_revenue: number;
  successful_payments: number;
  failed_payments: number;
  total_refunds: number;
  success_rate: number;
  message?: string;
}

/**
 * API response structure for revenue stats endpoint
 */
export interface IGetRevenueStatsResponse {
  success: boolean;
  data: IRevenueStats;
  message?: string;
}

/**
 * Revenue by gateway interface
 */
export interface IRevenueByGateway {
  gateway: string;
  revenue: number;
  transaction_count: number;
}

/**
 * API response structure for revenue by gateway endpoint
 */
export interface IGetRevenueByGatewayResponse {
  success: boolean;
  data: IRevenueByGateway[];
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

