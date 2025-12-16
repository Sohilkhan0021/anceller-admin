/**
 * Add-On Management Hooks
 * 
 * Custom React hooks for add-on management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult } from 'react-query';
import { addonService } from './addon.service';
import type {
  IGetAddOnsParams,
  IGetAddOnsResponse,
  IAddOn,
  IPaginationMeta,
} from './addon.types';

/**
 * Hook return type for better type safety
 */
export interface IUseAddOnsReturn {
  addOns: IAddOn[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch add-ons with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Add-ons data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { addOns, pagination, isLoading, isError, error, refetch } = useAddOns({
 *   page: 1,
 *   limit: 20,
 *   status: 'active',
 *   search: 'outlet'
 * });
 * ```
 */
export const useAddOns = (
  params: IGetAddOnsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseAddOnsReturn => {
  const {
    page = 1,
    limit = 20,
    status = '',
    search = '',
  } = params;

  // Build params object, excluding empty strings
  const queryParams: IGetAddOnsParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetAddOnsResponse, Error> = useQuery(
    ['addOns', page, limit, status, search],
    () => addonService.getAddOns(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  // Normalize add-ons data - convert snake_case to camelCase
  // Handle both camelCase and snake_case response formats
  const rawAddOns = queryResult.data?.data?.addOns || 
                    queryResult.data?.data?.add_ons || 
                    [];
  
  const normalizedAddOns = rawAddOns.map((addOn) => ({
    ...addOn,
    price: addOn.price ?? addOn.price_per_unit ?? undefined,
    isPerUnit: addOn.isPerUnit ?? addOn.is_per_unit ?? false,
    appliesTo: addOn.appliesTo ?? addOn.applies_to ?? addOn.service_ids ?? [],
  }));

  return {
    addOns: normalizedAddOns,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

