/**
 * Sub-Service Management Hooks
 * 
 * Custom React hooks for sub-service management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from 'react-query';
import { subServiceService } from './subservice.service';
import type {
  IGetSubServicesParams,
  IGetSubServicesResponse,
  ISubService,
  IPaginationMeta,
  IDeleteSubServiceResponse,
} from './subservice.types';

/**
 * Hook return type for better type safety
 */
export interface IUseSubServicesReturn {
  subServices: ISubService[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch sub-services with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Sub-services data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { subServices, pagination, isLoading, isError, error, refetch } = useSubServices({
 *   page: 1,
 *   limit: 10,
 *   status: 'active',
 *   service_id: 'service-123',
 *   search: 'repair'
 * });
 * ```
 */
export const useSubServices = (
  params: IGetSubServicesParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseSubServicesReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    service_id = '',
    search = '',
  } = params;

  // Build params object, excluding empty strings
  const queryParams: IGetSubServicesParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (service_id && service_id.trim() !== '') {
    queryParams.service_id = service_id;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetSubServicesResponse, Error> = useQuery(
    ['sub-services', page, limit, status, service_id, search],
    () => subServiceService.getSubServices(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  // Normalize sub-services data - convert snake_case to camelCase and handle both response formats
  const rawSubServices = queryResult.data?.data?.subServices ||
    queryResult.data?.data?.sub_services ||
    [];

  const normalizedSubServices = rawSubServices.map((subService: any) => ({
    ...subService,
    id: subService.id || subService.public_id || subService.sub_service_id || subService.subServiceId,
    serviceId: subService.serviceId ?? subService.service_id ?? undefined,
    categoryId: subService.categoryId ?? subService.serviceId ?? subService.service_id ?? undefined, // For backward compatibility
    displayOrder: subService.displayOrder ?? subService.display_order ?? undefined,
    image: subService.image ?? subService.image_url ?? undefined,
  }));

  return {
    subServices: normalizedSubServices,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to delete a sub-service
 * 
 * @returns Mutation result for deleting a sub-service
 */
export const useDeleteSubService = (options?: {
  onSuccess?: (data: IDeleteSubServiceResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteSubServiceResponse, Error, string> => {
  return useMutation(
    (subServiceId: string) => subServiceService.deleteSubService(subServiceId),
    {
      onSuccess: (data) => {
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

