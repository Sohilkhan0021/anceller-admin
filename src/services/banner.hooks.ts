/**
 * Banner Management Hooks
 * 
 * Custom React hooks for banner management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult, useMutation, UseMutationResult } from 'react-query';
import { bannerService } from './banner.service';
import type {
  IGetBannersParams,
  IGetBannersResponse,
  IBanner,
  IPaginationMeta,
  ICreateBannerRequest,
  ICreateBannerResponse,
  IGetBannerDetailResponse,
  IUpdateBannerRequest,
  IUpdateBannerResponse,
  IDeleteBannerResponse,
} from './banner.types';

/**
 * Hook return type for better type safety
 */
export interface IUseBannersReturn {
  banners: IBanner[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch banners with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Banners data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { banners, pagination, isLoading, isError, error, refetch } = useBanners({
 *   page: 1,
 *   limit: 20,
 *   status: 'active',
 *   search: 'promo'
 * });
 * ```
 */
export const useBanners = (
  params: IGetBannersParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseBannersReturn => {
  const {
    page = 1,
    limit = 20,
    status = '',
    search = '',
  } = params;

  // Build params object, excluding empty strings
  const queryParams: IGetBannersParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetBannersResponse, Error> = useQuery(
    ['banners', page, limit, status, search],
    () => bannerService.getBanners(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  // Normalize banners data
  const rawBanners = queryResult.data?.data?.banners ||
    queryResult.data?.data?.banner ||
    [];

  const normalizedBanners: IBanner[] = rawBanners.map((banner: any) => ({
    banner_id: banner.banner_id || banner.id,
    title: banner.title || '',
    image_url: banner.image_url || banner.image || '',
    is_active: banner.is_active ?? true,
    category_id: banner.category_id || null,
    category: banner.category ? {
      category_id: banner.category.category_id || banner.category.public_id,
      name: banner.category.name
    } : null,
    created_at: banner.created_at || banner.createdAt,
    updated_at: banner.updated_at || banner.updatedAt,
  }));

  return {
    banners: normalizedBanners,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Hook return type for banner detail
 */
export interface IUseBannerByIdReturn {
  banner: IBanner | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch banner detail by ID
 * 
 * @param bannerId - ID of the banner to fetch
 * @param options - Additional React Query options
 * @returns Banner data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { banner, isLoading, isError, error, refetch } = useBannerById('banner-123', {
 *   enabled: true
 * });
 * ```
 */
export const useBannerById = (
  bannerId: string | null,
  options?: {
    enabled?: boolean;
  }
): IUseBannerByIdReturn => {
  const queryResult: UseQueryResult<IGetBannerDetailResponse, Error> = useQuery(
    ['banner', bannerId],
    () => bannerService.getBannerById(bannerId!),
    {
      enabled: options?.enabled !== false && bannerId !== null,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  const rawBanner: any = queryResult.data?.data?.banner || null;
  const banner: IBanner | null = rawBanner ? {
    banner_id: rawBanner.banner_id || rawBanner.id || '',
    title: rawBanner.title || '',
    image_url: rawBanner.image_url || rawBanner.image || '',
    is_active: rawBanner.is_active ?? true,
    category_id: rawBanner.category_id || null,
    category: rawBanner.category ? {
      category_id: rawBanner.category.category_id || rawBanner.category.public_id || '',
      name: rawBanner.category.name || ''
    } : null,
    created_at: rawBanner.created_at,
    updated_at: rawBanner.updated_at,
  } : null;

  return {
    banner,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
};

/**
 * Hook return type for create banner mutation
 */
export interface IUseCreateBannerReturn {
  createBanner: (data: ICreateBannerRequest) => Promise<ICreateBannerResponse>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook to create a new banner
 * 
 * @returns Mutation function and state
 * 
 * @example
 * ```tsx
 * const { createBanner, isLoading } = useCreateBanner();
 * await createBanner({ title: 'New Banner', image: file, is_active: true });
 * ```
 */
export const useCreateBanner = (): IUseCreateBannerReturn => {
  const mutation: UseMutationResult<ICreateBannerResponse, Error, ICreateBannerRequest> = useMutation(
    (data: ICreateBannerRequest) => bannerService.createBanner(data),
    {
      onSuccess: () => {
        // Invalidate banners query to refetch the list
        // This is handled by React Query automatically
      },
    }
  );

  return {
    createBanner: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error || null,
  };
};

/**
 * Hook return type for update banner mutation
 */
export interface IUseUpdateBannerReturn {
  updateBanner: (bannerId: string, data: IUpdateBannerRequest) => Promise<IUpdateBannerResponse>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook to update an existing banner
 * 
 * @returns Mutation function and state
 * 
 * @example
 * ```tsx
 * const { updateBanner, isLoading } = useUpdateBanner();
 * await updateBanner('banner-123', { title: 'Updated Banner', is_active: false });
 * ```
 */
export const useUpdateBanner = (): IUseUpdateBannerReturn => {
  const mutation: UseMutationResult<IUpdateBannerResponse, Error, { bannerId: string; data: IUpdateBannerRequest }> = useMutation(
    ({ bannerId, data }) => bannerService.updateBanner(bannerId, data),
    {
      onSuccess: () => {
        // Invalidate banners query to refetch the list
        // This is handled by React Query automatically
      },
    }
  );

  return {
    updateBanner: (bannerId: string, data: IUpdateBannerRequest) => mutation.mutateAsync({ bannerId, data }),
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error || null,
  };
};

/**
 * Hook return type for delete banner mutation
 */
export interface IUseDeleteBannerReturn {
  deleteBanner: (bannerId: string) => Promise<IDeleteBannerResponse>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook to delete a banner
 * 
 * @returns Mutation function and state
 * 
 * @example
 * ```tsx
 * const { deleteBanner, isLoading } = useDeleteBanner();
 * await deleteBanner('banner-123');
 * ```
 */
export const useDeleteBanner = (): IUseDeleteBannerReturn => {
  const mutation: UseMutationResult<IDeleteBannerResponse, Error, string> = useMutation(
    (bannerId: string) => bannerService.deleteBanner(bannerId),
    {
      onSuccess: () => {
        // Invalidate banners query to refetch the list
        // This is handled by React Query automatically
      },
    }
  );

  return {
    deleteBanner: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error || null,
  };
};

