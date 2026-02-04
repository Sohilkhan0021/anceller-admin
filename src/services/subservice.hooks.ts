/**
 * Sub-Service Management Hooks
 * 
 * Custom React hooks for sub-service management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from 'react-query';
import { subServiceService, IGetSubServiceByIdResponse } from './subservice.service';
import type {
  IGetSubServicesParams,
  IGetSubServicesResponse,
  ISubService,
  IPaginationMeta,
  IDeleteSubServiceResponse,
  IUpdateSubServiceRequest,
  IUpdateSubServiceResponse,
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

  const normalizedSubServices = rawSubServices.map((subService: any) => {
    // Normalize status: handle 'Active'/'Inactive' (capitalized) or boolean is_active
    let normalizedStatus = 'inactive';
    if (subService.status) {
      normalizedStatus = subService.status.toLowerCase();
    } else if (subService.is_active === true || subService.is_active === 'true') {
      normalizedStatus = 'active';
    } else if (subService.is_active === false || subService.is_active === 'false') {
      normalizedStatus = 'inactive';
    }
    
    // Extract categoryId from nested service.category structure
    const categoryId = subService.categoryId 
      ?? subService.service?.category?.category_id 
      ?? subService.service?.category?.public_id 
      ?? subService.category?.category_id 
      ?? subService.category?.public_id 
      ?? undefined;
    
    return {
      ...subService,
      id: subService.id || subService.public_id || subService.sub_service_id || subService.subServiceId,
      serviceId: subService.serviceId ?? subService.service_id ?? subService.service?.service_id ?? undefined,
      categoryId: categoryId, // Extract from nested structure
      categoryName: subService.service?.category?.name ?? subService.category?.name ?? undefined, // Extract category name
      displayOrder: subService.displayOrder ?? subService.display_order ?? undefined,
      image: subService.image ?? subService.image_url ?? undefined,
      image_url: subService.image_url ?? null, // Preserve image_url from API (can be null)
      status: normalizedStatus,
      is_active: normalizedStatus === 'active',
    };
  });

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
 * Custom hook to update a sub-service
 * 
 * @returns Mutation result for updating a sub-service
 */
export const useUpdateSubService = (options?: {
  onSuccess?: (data: IUpdateSubServiceResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateSubServiceResponse, Error, { subServiceId: string; data: IUpdateSubServiceRequest }> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ subServiceId, data }: { subServiceId: string; data: IUpdateSubServiceRequest }) => 
      subServiceService.updateSubService(subServiceId, data),
    {
      onSuccess: (data, variables) => {
        // Invalidate queries to ensure fresh data is fetched
        queryClient.invalidateQueries(['sub-services']);
        queryClient.invalidateQueries(['sub-service', variables.subServiceId]);
        
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

/**
 * Custom hook to fetch a single sub-service by ID
 * 
 * @param subServiceId - Public ID of the sub-service
 * @param options - Additional React Query options
 * @returns Query result with sub-service data
 */
export const useSubServiceById = (
  subServiceId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<IGetSubServiceByIdResponse, Error> => {
  return useQuery(
    ['sub-service', subServiceId],
    () => subServiceService.getSubServiceById(subServiceId!),
    {
      enabled: options?.enabled !== false && !!subServiceId,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );
};

/**
 * Custom hook to create a sub-service
 * 
 * @returns Mutation result for creating a sub-service
 */
export const useCreateSubService = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<any, Error, any> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: any) => subServiceService.createSubService(data),
    {
      onSuccess: (data) => {
        // Invalidate sub-services query to refresh the list
        queryClient.invalidateQueries(['sub-services']);
        // Also invalidate services query in case sub-service count changed
        queryClient.invalidateQueries(['services']);
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

/**
 * Custom hook to delete a sub-service
 * 
 * @returns Mutation result for deleting a sub-service
 */
export const useDeleteSubService = (options?: {
  onSuccess?: (data: IDeleteSubServiceResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteSubServiceResponse, Error, string> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (subServiceId: string) => subServiceService.deleteSubService(subServiceId),
    {
      onSuccess: (data, subServiceId) => {
        // Invalidate sub-services query to refresh the list
        queryClient.invalidateQueries(['sub-services']);
        // Also invalidate the specific sub-service
        queryClient.invalidateQueries(['sub-service', subServiceId]);
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

