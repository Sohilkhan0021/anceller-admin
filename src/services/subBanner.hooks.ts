/**
 * Sub-Banner Management Hooks
 * 
 * Custom React hooks for sub-banner management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult, useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { subBannerService } from './subBanner.service';
import type {
  IGetSubBannersParams,
  IGetSubBannersResponse,
  ISubBanner,
  IPaginationMeta,
  ICreateSubBannerRequest,
  ICreateSubBannerResponse,
  IGetSubBannerDetailResponse,
  IUpdateSubBannerRequest,
  IUpdateSubBannerResponse,
  IDeleteSubBannerResponse,
  IBannerSettings,
  IUpdateBannerSettingsRequest,
} from './subBanner.types';

/**
 * Hook return type for better type safety
 */
export interface IUseSubBannersReturn {
  subBanners: ISubBanner[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch sub-banners with filters
 */
export const useSubBanners = (
  params: IGetSubBannersParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseSubBannersReturn => {
  const {
    page = 1,
    limit = 20,
    status = '',
    search = '',
  } = params;

  const queryParams: IGetSubBannersParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetSubBannersResponse, Error> = useQuery(
    ['sub-banners', page, limit, status, search],
    () => subBannerService.getSubBanners(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  const rawSubBanners = queryResult.data?.data?.sub_banners || [];

  const normalizedSubBanners: ISubBanner[] = rawSubBanners.map((subBanner: any) => ({
    sub_banner_id: subBanner.sub_banner_id,
    title: subBanner.title || '',
    image_url: subBanner.image_url || '',
    is_active: subBanner.is_active ?? true,
    category_id: subBanner.category_id || null,
    category: subBanner.category ? {
      category_id: subBanner.category.category_id || subBanner.category.public_id,
      name: subBanner.category.name
    } : null,
    created_at: subBanner.created_at,
    updated_at: subBanner.updated_at,
  }));

  return {
    subBanners: normalizedSubBanners,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Hook return type for sub-banner detail
 */
export interface IUseSubBannerByIdReturn {
  subBanner: ISubBanner | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch sub-banner detail by ID
 */
export const useSubBannerById = (
  subBannerId: string | null,
  options?: {
    enabled?: boolean;
  }
): IUseSubBannerByIdReturn => {
  const queryResult: UseQueryResult<IGetSubBannerDetailResponse, Error> = useQuery(
    ['sub-banner', subBannerId],
    () => subBannerService.getSubBannerById(subBannerId!),
    {
      enabled: options?.enabled !== false && subBannerId !== null,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  const rawSubBanner: any = queryResult.data?.data?.sub_banner || null;
  const subBanner: ISubBanner | null = rawSubBanner ? {
    sub_banner_id: rawSubBanner.sub_banner_id || '',
    title: rawSubBanner.title || '',
    image_url: rawSubBanner.image_url || '',
    is_active: rawSubBanner.is_active ?? true,
    category_id: rawSubBanner.category_id || null,
    category: rawSubBanner.category ? {
      category_id: rawSubBanner.category.category_id || rawSubBanner.category.public_id || '',
      name: rawSubBanner.category.name || ''
    } : null,
    created_at: rawSubBanner.created_at,
    updated_at: rawSubBanner.updated_at,
  } : null;

  return {
    subBanner,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
};

/**
 * Hook to create a new sub-banner
 */
export const useCreateSubBanner = (options?: {
  onSuccess?: (data: ICreateSubBannerResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateSubBannerResponse, Error, ICreateSubBannerRequest> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: ICreateSubBannerRequest) => subBannerService.createSubBanner(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['sub-banners']);
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
 * Hook to update an existing sub-banner
 */
export const useUpdateSubBanner = (options?: {
  onSuccess?: (data: IUpdateSubBannerResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateSubBannerResponse, Error, { subBannerId: string; data: IUpdateSubBannerRequest }> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ subBannerId, data }) => subBannerService.updateSubBanner(subBannerId, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['sub-banners']);
        queryClient.invalidateQueries(['sub-banner']);
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
 * Hook to delete a sub-banner
 */
export const useDeleteSubBanner = (options?: {
  onSuccess?: (data: IDeleteSubBannerResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteSubBannerResponse, Error, string> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (subBannerId: string) => subBannerService.deleteSubBanner(subBannerId),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['sub-banners']);
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
 * Hook to get banner settings
 */
export const useBannerSettings = (options?: {
  enabled?: boolean;
}): UseQueryResult<IBannerSettings, Error> => {
  return useQuery(
    ['banner-settings'],
    () => subBannerService.getBannerSettings(),
    {
      enabled: options?.enabled !== false,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );
};

/**
 * Hook to update banner settings
 */
export const useUpdateBannerSettings = (options?: {
  onSuccess?: (data: IBannerSettings) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IBannerSettings, Error, IUpdateBannerSettingsRequest> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: IUpdateBannerSettingsRequest) => subBannerService.updateBannerSettings(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['banner-settings']);
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
