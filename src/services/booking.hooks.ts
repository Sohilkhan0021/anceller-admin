/**
 * Booking Management Hooks
 * 
 * Custom React hooks for booking management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult } from 'react-query';
import { bookingService } from './booking.service';
import type {
  IGetBookingsParams,
  IGetBookingsResponse,
  IGetBookingDetailResponse,
  IBooking,
  IBookingDetail,
  IPaginationMeta,
} from './booking.types';

/**
 * Hook return type for better type safety
 */
export interface IUseBookingsReturn {
  bookings: IBooking[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch bookings with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Bookings data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { bookings, pagination, isLoading, isError, error, refetch } = useBookings({
 *   page: 1,
 *   limit: 10,
 *   status: 'pending',
 *   payment_status: 'paid',
 *   start_date: '2024-01-01',
 *   end_date: '2024-01-31',
 *   search: 'john'
 * });
 * ```
 */
export const useBookings = (
  params: IGetBookingsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseBookingsReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    payment_status = '',
    start_date = '',
    end_date = '',
    search = '',
    category_id = '',
  } = params;

  // Build params object, excluding empty strings
  const queryParams: IGetBookingsParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (payment_status && payment_status.trim() !== '') {
    queryParams.payment_status = payment_status;
  }
  if (start_date && start_date.trim() !== '') {
    queryParams.start_date = start_date;
  }
  if (end_date && end_date.trim() !== '') {
    queryParams.end_date = end_date;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }
  if (category_id && category_id.trim() !== '' && category_id !== 'all') {
    queryParams.category_id = category_id;
  }

  const queryResult: UseQueryResult<IGetBookingsResponse, Error> = useQuery(
    ['bookings', page, limit, status, payment_status, start_date, end_date, search, category_id],
    () => bookingService.getBookings(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  const paginationData = queryResult.data?.data?.pagination;
  
  // Normalize pagination to include hasNextPage and hasPreviousPage if missing
  const normalizedPagination = paginationData ? {
    ...paginationData,
    hasNextPage: paginationData.hasNextPage ?? (paginationData.page < paginationData.totalPages),
    hasPreviousPage: paginationData.hasPreviousPage ?? (paginationData.page > 1)
  } : null;

  return {
    bookings: queryResult.data?.data?.bookings || [],
    pagination: normalizedPagination,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to fetch booking details by ID
 * 
 * @param bookingId - ID of the booking to fetch
 * @param options - Additional React Query options
 * @returns Booking detail data, loading state, error state, and refetch function
 */
export const useBookingDetail = (
  bookingId: string | null,
  options?: {
    enabled?: boolean;
  }
): {
  booking: IBookingDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const queryResult: UseQueryResult<IGetBookingDetailResponse, Error> = useQuery(
    ['booking', bookingId],
    () => bookingService.getBookingDetail(bookingId!),
    {
      enabled: options?.enabled !== false && bookingId !== null && bookingId !== undefined,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  return {
    booking: queryResult.data?.data?.booking || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
};

