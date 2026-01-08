/**
 * Service Management Hooks
 * 
 * Custom React hooks for service management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult, useMutation, UseMutationResult } from 'react-query';
import { useMemo } from 'react';
import { serviceService } from './service.service';
import type {
  IGetServicesParams,
  IGetServicesResponse,
  IService,
  ServiceStatus,
  IPaginationMeta,
  ICreateServiceRequest,
  ICreateServiceResponse,
  IUpdateServiceRequest,
  IUpdateServiceResponse,
  IDeleteServiceResponse,
} from './service.types';

/**
 * Hook return type for better type safety
 */
export interface IUseServicesReturn {
  services: IService[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch services with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Services data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { services, pagination, isLoading, isError, error, refetch } = useServices({
 *   page: 1,
 *   limit: 20,
 *   status: 'active',
 *   category_id: 'cat-123',
 *   search: 'electrical'
 * });
 * ```
 */
export const useServices = (
  params: IGetServicesParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseServicesReturn => {
  const {
    page = 1,
    limit = 20,
    status = '',
    category_id = '',
    search = '',
  } = params;

  // Build params object, excluding empty strings
  const queryParams: IGetServicesParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (category_id && category_id.trim() !== '') {
    queryParams.category_id = category_id;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetServicesResponse, Error> = useQuery(
    ['services', page, limit, status, category_id, search],
    () => serviceService.getServices(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  // Normalize services data - convert snake_case to camelCase
  const rawServices = queryResult.data?.data?.services || [];

  const normalizedServices = useMemo(() => rawServices.map((service) => {
    // Handle category - can be string or object {category_id, name}
    let categoryName: string | undefined;
    let categoryId: string | undefined;

    if (typeof service.category === 'string') {
      categoryName = service.category;
    } else if (service.category && typeof service.category === 'object') {
      categoryName = (service.category as any).name;
      categoryId = (service.category as any).category_id;
    }

    // Also check if category_id exists separately
    if (!categoryId) {
      categoryId = service.categoryId ?? service.category_id ?? undefined;
    }

    // Normalize status: handle 'Active'/'Inactive' (capitalized) or boolean is_active
    let normalizedStatus: ServiceStatus = 'inactive';
    if (service.status) {
      normalizedStatus = service.status.toLowerCase() as ServiceStatus;
    } else if (service.is_active === true) {
      normalizedStatus = 'active';
    } else if (service.is_active === false) {
      normalizedStatus = 'inactive';
    }

    return {
      ...service,
      id: service.id || service.public_id || (service as any).service_id || '',
      subServiceId: service.subServiceId ?? service.sub_service_id ?? undefined,
      subServiceName: service.subServiceName ?? service.sub_service_name ?? undefined,
      categoryId: categoryId,
      categoryName: categoryName ?? (typeof service.category === 'string' ? service.category : undefined),
      category: categoryName ?? (typeof service.category === 'string' ? service.category : undefined), // Normalize to string
      basePrice: service.basePrice ?? service.base_price ?? undefined,
      duration: service.duration ?? service.duration_minutes ?? undefined,
      status: normalizedStatus,
      is_active: normalizedStatus === 'active',
      displayOrder: service.displayOrder ?? service.display_order ?? undefined,
      image: service.image ?? service.image_url ?? undefined,
      skills: service.skills ?? service.skills_tags ?? undefined,
    };
  }), [rawServices]);

  return {
    services: normalizedServices,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to create a service
 * 
 * @returns Mutation result for creating a service
 */
export const useCreateService = (options?: {
  onSuccess?: (data: ICreateServiceResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateServiceResponse, Error, ICreateServiceRequest> => {
  return useMutation(
    (data: ICreateServiceRequest) => serviceService.createService(data),
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

/**
 * Custom hook to update a service
 * 
 * @returns Mutation result for updating a service
 */
export const useUpdateService = (options?: {
  onSuccess?: (data: IUpdateServiceResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateServiceResponse, Error, IUpdateServiceRequest> => {
  return useMutation(
    (data: IUpdateServiceRequest) => serviceService.updateService(data),
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

/**
 * Custom hook to delete a service
 * 
 * @returns Mutation result for deleting a service
 */
export const useDeleteService = (options?: {
  onSuccess?: (data: IDeleteServiceResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteServiceResponse, Error, string> => {
  return useMutation(
    (serviceId: string) => serviceService.deleteService(serviceId),
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
