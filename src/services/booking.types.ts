/**
 * Booking Management Types
 * 
 * Type definitions for booking management API responses and data structures
 */

/**
 * Booking status enum
 */
export type BookingStatus = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'in-progress';

/**
 * Payment status enum
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially-paid';

/**
 * Booking entity interface
 */
export interface IBooking {
  id: string;
  userName: string;
  providerName: string;
  service: string;
  dateTime: string;
  status: BookingStatus;
  amount: number;
  paymentType?: string;
  paymentStatus?: PaymentStatus;
  address: string;
  phone: string;
  // Additional fields that might come from API
  userId?: string;
  providerId?: string;
  serviceId?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  rating?: number;
  review?: string;
}

/**
 * Query parameters for fetching bookings
 */
export interface IGetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
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
 * API response structure for get bookings endpoint
 */
export interface IGetBookingsResponse {
  success: boolean;
  data: {
    bookings: IBooking[];
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

