/**
 * Category Management Hooks
 * 
 * Custom React hooks for category management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult } from 'react-query';
import { categoryService } from './category.service';
import type {
  IGetCategoriesParams,
  IGetCategoriesResponse,
  ICategory,
  IPaginationMeta,
} from './category.types';

/**
 * Hook return type for better type safety
 */
export interface IUseCategoriesReturn {
  categories: ICategory[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch categories with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Categories data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { categories, pagination, isLoading, isError, error, refetch } = useCategories({
 *   page: 1,
 *   limit: 10,
 *   status: 'active',
 *   search: 'electrical'
 * });
 * ```
 */
export const useCategories = (
  params: IGetCategoriesParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseCategoriesReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    search = '',
  } = params;

  // Build params object, excluding empty strings
  const queryParams: IGetCategoriesParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetCategoriesResponse, Error> = useQuery(
    ['categories', page, limit, status, search],
    () => categoryService.getCategories(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  // Normalize categories data - convert snake_case to camelCase
  const normalizedCategories = (queryResult.data?.data?.categories || []).map((category) => ({
    ...category,
    displayOrder: category.displayOrder ?? category.display_order ?? undefined,
    iconUrl: category.iconUrl ?? category.icon_url ?? undefined,
  }));

  return {
    categories: normalizedCategories,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

