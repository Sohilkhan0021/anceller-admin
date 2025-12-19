/**
 * Coupon Management Hooks
 * 
 * Custom React hooks for coupon management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult, useMutation, UseMutationResult } from 'react-query';
import { couponService } from './coupon.service';
import type {
  IGetCouponsParams,
  IGetCouponsResponse,
  ICoupon,
  CouponType,
  IPaginationMeta,
  ICouponStatsResponse,
  ICouponStats,
  ICreateCouponRequest,
  ICreateCouponResponse,
  IGetCouponDetailResponse,
  IUpdateCouponRequest,
  IUpdateCouponResponse,
  IDeleteCouponResponse,
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

  const normalizedCoupons: ICoupon[] = rawCoupons.map((coupon: any) => ({
    ...coupon,
    id: coupon.id ?? coupon.coupon_id ?? coupon.public_id,
    type: (coupon.type ??
      (coupon.coupon_type === 'PERCENTAGE' ? 'percentage' :
        coupon.coupon_type === 'FLAT_AMOUNT' ? 'fixed' :
          coupon.discount_type ?? 'fixed')) as CouponType,
    value: coupon.value ?? coupon.discount_value ?? 0,
    expiry: coupon.expiry ?? coupon.expiry_date ?? coupon.expires_at ?? undefined,
    startDate: coupon.startDate ?? coupon.valid_from ?? coupon.start_date ?? undefined,
    endDate: coupon.endDate ?? coupon.valid_until ?? coupon.expiry_date ?? coupon.expires_at ?? undefined,
    isActive: coupon.isActive ?? (coupon.status === 'active'),
    usageCount: coupon.usageCount ?? coupon.usage_count ?? 0,
    usageLimit: coupon.usageLimit ?? coupon.max_usage ?? coupon.maxUsage ?? 0,
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

/**
 * Hook to fetch coupon stats
 */
export const useCouponStats = (options?: {
  enabled?: boolean;
}): {
  stats: ICouponStats | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const queryResult: UseQueryResult<ICouponStatsResponse, Error> = useQuery(
    ['coupon-stats'],
    () => couponService.getCouponStats(),
    {
      enabled: options?.enabled !== false,
      staleTime: 60000, // 1 minute
    }
  );

  return {
    stats: queryResult.data?.data || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
};

/**
 * Hook to create a new coupon
 */
export const useCreateCoupon = (options?: {
  onSuccess?: (data: ICreateCouponResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateCouponResponse, Error, ICreateCouponRequest> => {
  return useMutation(
    (data: ICreateCouponRequest) => couponService.createCoupon(data),
    {
      onSuccess: (data) => {
        if (options?.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        if (options?.onError) options.onError(error);
      },
    }
  );
};

/**
 * Hook to fetch coupon detail by ID
 */
export const useCouponDetail = (
  couponId: string,
  options?: { enabled?: boolean }
): {
  coupon: ICoupon | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} => {
  const queryResult: UseQueryResult<IGetCouponDetailResponse, Error> = useQuery(
    ['coupon-detail', couponId],
    () => couponService.getCouponById(couponId),
    {
      enabled: !!couponId && options?.enabled !== false,
      staleTime: 30000,
    }
  );

  // Normalize coupon data if needed
  const rawCoupon: any = queryResult.data?.data?.coupon || null;
  const normalizedCoupon = rawCoupon ? {
    ...rawCoupon,
    id: rawCoupon.id ?? rawCoupon.coupon_id ?? rawCoupon.public_id,
    type: (rawCoupon.type ??
      (rawCoupon.coupon_type === 'PERCENTAGE' ? 'percentage' :
        rawCoupon.coupon_type === 'FLAT_AMOUNT' ? 'fixed' :
          rawCoupon.discount_type ?? 'fixed')) as CouponType,
    value: rawCoupon.value ?? rawCoupon.discount_value ?? 0,
    expiry: rawCoupon.expiry ?? rawCoupon.expiry_date ?? rawCoupon.expires_at ?? undefined,
    startDate: rawCoupon.startDate ?? rawCoupon.valid_from ?? rawCoupon.start_date ?? undefined,
    endDate: rawCoupon.endDate ?? rawCoupon.valid_until ?? rawCoupon.expiry_date ?? rawCoupon.expires_at ?? undefined,
    isActive: rawCoupon.isActive ?? (rawCoupon.status === 'active'),
    usageCount: rawCoupon.usageCount ?? rawCoupon.usage_count ?? 0,
    usageLimit: rawCoupon.usageLimit ?? rawCoupon.max_usage ?? rawCoupon.maxUsage ?? 0,
    maxUsage: rawCoupon.maxUsage ?? rawCoupon.max_usage ?? 0,
  } : null;

  return {
    coupon: normalizedCoupon as ICoupon | null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
  };
};

/**
 * Hook to update an existing coupon
 */
export const useUpdateCoupon = (options?: {
  onSuccess?: (data: IUpdateCouponResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateCouponResponse, Error, { id: string; data: IUpdateCouponRequest }> => {
  return useMutation(
    ({ id, data }) => couponService.updateCoupon(id, data),
    {
      onSuccess: (data) => {
        if (options?.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        if (options?.onError) options.onError(error);
      },
    }
  );
};

/**
 * Hook to delete a coupon
 */
export const useDeleteCoupon = (options?: {
  onSuccess?: (data: IDeleteCouponResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteCouponResponse, Error, string> => {
  return useMutation(
    (id: string) => couponService.deleteCoupon(id),
    {
      onSuccess: (data) => {
        if (options?.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        if (options?.onError) options.onError(error);
      },
    }
  );
};

