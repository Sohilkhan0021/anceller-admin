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
  IBooking,
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

  const queryResult: UseQueryResult<IGetBookingsResponse, Error> = useQuery(
    ['bookings', page, limit, status, payment_status, start_date, end_date, search],
    () => bookingService.getBookings(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  return {
    bookings: queryResult.data?.data?.bookings || [],
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

