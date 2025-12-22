/**
 * Payment Management Hooks
 * 
 * Custom React hooks for payment management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult, useMutation, UseMutationResult } from 'react-query';
import { paymentService } from './payment.service';
import type {
  IGetPaymentTransactionsParams,
  IGetPaymentTransactionsResponse,
  IPaymentTransaction,
  IPaymentDetail,
  IGetPaymentDetailResponse,
  IPaginationMeta,
  IRevenueStats,
  IRevenueByGateway,
} from './payment.types';

/**
 * Hook return type for better type safety
 */
export interface IUsePaymentTransactionsReturn {
  transactions: IPaymentTransaction[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch payment transactions with filters
 */
export const usePaymentTransactions = (
  params: IGetPaymentTransactionsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUsePaymentTransactionsReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    gateway = '',
    start_date = '',
    end_date = '',
    search = '',
  } = params;

  const queryParams: IGetPaymentTransactionsParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (gateway && gateway.trim() !== '') {
    queryParams.gateway = gateway;
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

  const queryResult: UseQueryResult<IGetPaymentTransactionsResponse['data'], Error> = useQuery(
    ['payment-transactions', page, limit, status, gateway, start_date, end_date, search],
    () => paymentService.getPaymentTransactions(queryParams),
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
    transactions: queryResult.data?.transactions || [],
    pagination: normalizedPagination,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to fetch payment detail by ID
 */
export const usePaymentDetail = (
  transactionId: string | null,
  options?: {
    enabled?: boolean;
  }
): {
  transaction: IPaymentDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const queryResult: UseQueryResult<IGetPaymentDetailResponse['data'], Error> = useQuery(
    ['payment-detail', transactionId],
    () => paymentService.getPaymentDetail(transactionId!),
    {
      enabled: options?.enabled !== false && transactionId !== null && transactionId !== undefined,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  return {
    transaction: queryResult.data?.transaction || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
};

/**
 * Custom hook to fetch revenue statistics
 */
export const useRevenueStats = (
  startDate?: string,
  endDate?: string,
  options?: {
    enabled?: boolean;
  }
): {
  stats: IRevenueStats | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const queryResult = useQuery(
    ['revenue-stats', startDate, endDate],
    () => paymentService.getRevenueStats(startDate, endDate),
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

/**
 * Custom hook to fetch revenue by gateway
 */
export const useRevenueByGateway = (
  startDate?: string,
  endDate?: string,
  options?: {
    enabled?: boolean;
  }
): {
  revenue: IRevenueByGateway[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const queryResult = useQuery(
    ['revenue-by-gateway', startDate, endDate],
    () => paymentService.getRevenueByGateway(startDate, endDate),
    {
      enabled: options?.enabled !== false,
      staleTime: 60000,
      cacheTime: 300000,
    }
  );

  return {
    revenue: queryResult.data || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: (queryResult.error instanceof Error ? queryResult.error : null) || null,
    refetch: queryResult.refetch,
  };
};

/**
 * Custom hook to export payment data
 */
export const useExportPaymentData = (): UseMutationResult<any[], Error, IGetPaymentTransactionsParams> => {
  return useMutation(
    (filters: IGetPaymentTransactionsParams) => paymentService.exportPaymentData(filters),
    {
      onError: (error: Error) => {
        console.error('Error exporting payment data:', error);
      },
    }
  );
};

