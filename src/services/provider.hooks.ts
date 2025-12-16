/**
 * Provider Management Hooks
 * 
 * Custom React hooks for provider management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult } from 'react-query';
import { providerService } from './provider.service';
import type {
  IGetProvidersParams,
  IGetProvidersResponse,
  IProvider,
  IPaginationMeta,
} from './provider.types';

/**
 * Hook return type for better type safety
 */
export interface IUseProvidersReturn {
  providers: IProvider[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch providers with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Providers data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { providers, pagination, isLoading, isError, error, refetch } = useProviders({
 *   page: 1,
 *   limit: 10,
 *   status: 'active',
 *   search: 'rajesh'
 * });
 * ```
 */
export const useProviders = (
  params: IGetProvidersParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseProvidersReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    search = '',
  } = params;

  const queryResult: UseQueryResult<IGetProvidersResponse, Error> = useQuery(
    ['providers', page, limit, status, search],
    () => providerService.getProviders({ page, limit, status, search }),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  return {
    providers: queryResult.data?.data?.providers || [],
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

