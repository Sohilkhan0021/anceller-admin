/**
 * Payout Management Hooks
 * 
 * Custom React hooks for payout management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult } from 'react-query';
import { payoutService } from './payout.service';
import type {
  IGetPayoutsParams,
  IGetPayoutsResponse,
  IPayout,
  IPaginationMeta,
  IPayoutStats,
} from './payout.types';

/**
 * Hook return type for better type safety
 */
export interface IUsePayoutsReturn {
  payouts: IPayout[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch payouts with filters
 */
export const usePayouts = (
  params: IGetPayoutsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUsePayoutsReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    search = '',
  } = params;

  const queryParams: IGetPayoutsParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetPayoutsResponse['data'], Error> = useQuery(
    ['payouts', page, limit, status, search],
    () => payoutService.getPayouts(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  const paginationData = queryResult.data?.pagination;
  
  const normalizedPagination = paginationData ? {
    ...paginationData,
    hasNextPage: paginationData.hasNextPage ?? (paginationData.page < paginationData.totalPages),
    hasPreviousPage: paginationData.hasPreviousPage ?? (paginationData.page > 1)
  } : null;

  return {
    payouts: queryResult.data?.payouts || [],
    pagination: normalizedPagination,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to fetch payout statistics
 */
export const usePayoutStats = (
  options?: {
    enabled?: boolean;
  }
): {
  stats: IPayoutStats | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const queryResult = useQuery(
    ['payout-stats'],
    () => payoutService.getPayoutStats(),
    {
      enabled: options?.enabled !== false,
      staleTime: 60000,
      cacheTime: 300000,
    }
  );

  return {
    stats: queryResult.data || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: (queryResult.error instanceof Error ? queryResult.error : null) || null,
    refetch: queryResult.refetch,
  };
};

