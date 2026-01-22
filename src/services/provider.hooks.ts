/**
 * Provider Management Hooks
 * 
 * Custom React hooks for provider management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult, useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { providerService } from './provider.service';
import type {
  IGetProvidersParams,
  IGetProvidersResponse,
  IProvider,
  IPaginationMeta,
  IGetProviderDetailResponse,
  IApproveProviderResponse,
  IRejectProviderRequest,
  IRejectProviderResponse,
  IUpdateProviderStatusRequest,
  IUpdateProviderStatusResponse,
  IProviderStatsResponse,
  ICreateProviderRequest,
  ICreateProviderResponse,
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
    kyc_status = '',
    category_id = '',
  } = params;

  const queryResult: UseQueryResult<IGetProvidersResponse['data'], Error> = useQuery(
    ['providers', page, limit, status, search, kyc_status, category_id],
    () => providerService.getProviders({ page, limit, status, search, kyc_status, category_id }),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  // Normalize providers data - convert snake_case to camelCase
  const normalizedProviders: IProvider[] = (queryResult.data?.providers || []).map((provider: any) => ({
    ...provider,
    id: provider.provider_id || provider.id,
    name: provider.name || provider.business_name || 'N/A',
    serviceCategory: provider.service_categories?.[0]?.name || provider.serviceCategory || 'N/A',
    kycStatus: (provider.kyc_status || provider.kycStatus || 'pending').toLowerCase() as any,
    rating: provider.rating || 0,
    jobsCompleted: provider.jobs || provider.jobsCompleted || 0,
    earnings: provider.earnings || 0,
    status: (provider.status || 'active').toLowerCase() as any,
    joinDate: provider.joined_at || provider.joinDate || provider.createdAt || '',
    avatar: provider.user?.profile_picture_url || provider.avatar || null,
  }));

  const paginationData = queryResult.data?.pagination;
  
  // Normalize pagination to include hasNextPage and hasPreviousPage if missing
  const normalizedPagination = paginationData ? {
    ...paginationData,
    hasNextPage: paginationData.hasNextPage ?? (paginationData.page < paginationData.totalPages),
    hasPreviousPage: paginationData.hasPreviousPage ?? (paginationData.page > 1)
  } : null;

  return {
    providers: normalizedProviders,
    pagination: normalizedPagination,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Hook to fetch provider by ID
 */
export const useProvider = (
  providerId: string | null,
  options?: {
    enabled?: boolean;
  }
): {
  provider: IGetProviderDetailResponse['data']['provider'] | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const queryResult: UseQueryResult<IGetProviderDetailResponse['data'], Error> = useQuery(
    ['provider', providerId],
    () => providerService.getProviderById(providerId!),
    {
      enabled: options?.enabled !== false && !!providerId,
      staleTime: 60000, // 1 minute
    }
  );

  return {
    provider: queryResult.data?.provider || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
};

/**
 * Hook to approve provider
 */
export const useApproveProvider = (options?: {
  onSuccess?: (data: IApproveProviderResponse['data']) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IApproveProviderResponse['data'], Error, string> => {
  const queryClient = useQueryClient();

  return useMutation(
    (providerId: string) => {
      // console.log('[HOOK] useApproveProvider mutation function called with providerId:', providerId);
      return providerService.approveProvider(providerId);
    },
    {
      onSuccess: (data) => {
        // console.log('[HOOK] useApproveProvider onSuccess called with data:', data);
        queryClient.invalidateQueries(['providers']);
        queryClient.invalidateQueries(['provider', data.provider_id]);
        if (options?.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        // console.error('[HOOK] useApproveProvider onError called:', error);
        if (options?.onError) options.onError(error);
      },
    }
  );
};

/**
 * Hook to reject provider
 */
export const useRejectProvider = (options?: {
  onSuccess?: (data: IRejectProviderResponse['data']) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IRejectProviderResponse['data'], Error, { providerId: string; reason: string }> => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ providerId, reason }: { providerId: string; reason: string }) => {
      // console.log('[HOOK] useRejectProvider mutation function called with:', { providerId, reason });
      return providerService.rejectProvider(providerId, reason);
    },
    {
      onSuccess: (data) => {
        // console.log('[HOOK] useRejectProvider onSuccess called with data:', data);
        queryClient.invalidateQueries(['providers']);
        queryClient.invalidateQueries(['provider', data.provider_id]);
        if (options?.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        // console.error('[HOOK] useRejectProvider onError called:', error);
        if (options?.onError) options.onError(error);
      },
    }
  );
};

/**
 * Hook to update provider status
 */
export const useUpdateProviderStatus = (options?: {
  onSuccess?: (data: IUpdateProviderStatusResponse['data']) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateProviderStatusResponse['data'], Error, { providerId: string; status: 'ACTIVE' | 'SUSPENDED' | 'DELETED' }> => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ providerId, status }: { providerId: string; status: 'ACTIVE' | 'SUSPENDED' | 'DELETED' }) => 
      providerService.updateProviderStatus(providerId, status),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['providers']);
        queryClient.invalidateQueries(['provider', data.provider_id]);
        if (options?.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        if (options?.onError) options.onError(error);
      },
    }
  );
};

/**
 * Hook to get provider stats
 * Calculates stats from providers data
 */
export const useProviderStats = (providers: IProvider[]): {
  stats: IProviderStatsResponse['data'];
  isLoading: boolean;
} => {
  const stats = providerService.getProviderStats(providers as any[]);

  return {
    stats,
    isLoading: false,
  };
};

/**
 * Hook to create provider
 */
export const useCreateProvider = (options?: {
  onSuccess?: (data: ICreateProviderResponse['data']) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateProviderResponse['data'], Error, ICreateProviderRequest> => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: ICreateProviderRequest) => providerService.createProvider(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['providers']);
        if (options?.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        if (options?.onError) options.onError(error);
      },
    }
  );
};

