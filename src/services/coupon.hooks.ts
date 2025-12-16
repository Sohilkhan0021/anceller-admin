/**
 * Coupon Management Hooks
 * 
 * Custom React hooks for coupon management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult } from 'react-query';
import { couponService } from './coupon.service';
import type {
  IGetCouponsParams,
  IGetCouponsResponse,
  ICoupon,
  IPaginationMeta,
} from './coupon.types';

/**
 * Hook return type for better type safety
 */
export interface IUseCouponsReturn {
  coupons: ICoupon[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch coupons with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Coupons data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { coupons, pagination, isLoading, isError, error, refetch } = useCoupons({
 *   page: 1,
 *   limit: 20,
 *   status: 'active',
 *   search: 'WELCOME'
 * });
 * ```
 */
export const useCoupons = (
  params: IGetCouponsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseCouponsReturn => {
  const {
    page = 1,
    limit = 20,
    status = '',
    search = '',
  } = params;

  // Build params object, excluding empty strings
  const queryParams: IGetCouponsParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetCouponsResponse, Error> = useQuery(
    ['coupons', page, limit, status, search],
    () => couponService.getCoupons(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  // Normalize coupons data - convert snake_case to camelCase
  // Handle both camelCase and snake_case response formats
  const rawCoupons = queryResult.data?.data?.coupons || 
                     queryResult.data?.data?.coupon || 
                     [];
  
  const normalizedCoupons = rawCoupons.map((coupon) => ({
    ...coupon,
    type: coupon.type ?? coupon.discount_type ?? 'flat',
    value: coupon.value ?? coupon.discount_value ?? 0,
    expiry: coupon.expiry ?? coupon.expiry_date ?? coupon.expires_at ?? undefined,
    usageCount: coupon.usageCount ?? coupon.usage_count ?? 0,
    maxUsage: coupon.maxUsage ?? coupon.max_usage ?? 0,
    createdAt: coupon.createdAt ?? coupon.created_at ?? undefined,
    revenueImpact: coupon.revenueImpact ?? coupon.revenue_impact ?? 0,
    redemptions: coupon.redemptions ?? coupon.usageCount ?? coupon.usage_count ?? 0,
    minOrderAmount: coupon.minOrderAmount ?? coupon.min_order_amount ?? undefined,
  }));

  return {
    coupons: normalizedCoupons,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

