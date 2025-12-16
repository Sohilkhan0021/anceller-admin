/**
 * User Management Hooks
 * 
 * Custom React hooks for user management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult } from 'react-query';
import { userService } from './user.service';
import type {
  IGetUsersParams,
  IGetUsersResponse,
  IUser,
  IPaginationMeta,
} from './user.types';

/**
 * Hook return type for better type safety
 */
export interface IUseUsersReturn {
  users: IUser[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch users with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Users data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { users, pagination, isLoading, isError, error, refetch } = useUsers({
 *   page: 1,
 *   limit: 10,
 *   status: 'active',
 *   search: 'john'
 * });
 * ```
 */
export const useUsers = (
  params: IGetUsersParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseUsersReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    search = '',
  } = params;

  const queryResult: UseQueryResult<IGetUsersResponse, Error> = useQuery(
    ['users', page, limit, status, search],
    () => userService.getUsers({ page, limit, status, search }),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  return {
    users: queryResult.data?.data?.users || [],
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

