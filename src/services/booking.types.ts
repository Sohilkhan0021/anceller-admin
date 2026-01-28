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
export type BookingPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially-paid';

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
  paymentStatus?: BookingPaymentStatus;
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
  category_id?: string;
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
 * Booking detail interface
 */
export interface IBookingDetail {
  booking_id: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    phone: string;
  };
  provider: {
    provider_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    assignment_status: string | null;
    assignment_id: string | null;
  } | null;
  address: any;
  scheduled_date: string | null;
  scheduled_time_start: string | null;
  scheduled_time_end: string | null;
  status: string;
  items: Array<{
    service_name: string;
    sub_service: {
      sub_service_id: string;
      name: string;
      category: string;
    } | null;
    bucket: {
      bucket_id: string;
      name: string;
    } | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  payment: {
    payment_id: string;
    status: string;
    gateway: string;
    amount: number;
  } | null;
  status_history: Array<{
    status: string;
    changed_at: string;
    changed_by: {
      name: string;
      role: string;
    } | null;
    reason: string | null;
  }>;
}

/**
 * API response structure for get booking detail endpoint
 */
export interface IGetBookingDetailResponse {
  success: boolean;
  data: {
    booking: IBookingDetail;
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

