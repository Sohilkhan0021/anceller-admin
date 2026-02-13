/**
 * MEP Banner Management Hooks
 * 
 * React Query hooks for MEP banner management operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from 'react-query';
import {
  getMEPBanners,
  getMEPBannerById,
  createMEPBanner,
  updateMEPBanner,
  deleteMEPBanner,
  getMEPBannerSettings,
  updateMEPBannerSettings,
} from './mepBanner.service';
import type {
  IGetMEPBannersParams,
  IGetMEPBannersResponse,
  IGetMEPBannerDetailResponse,
  ICreateMEPBannerRequest,
  ICreateMEPBannerResponse,
  IUpdateMEPBannerRequest,
  IUpdateMEPBannerResponse,
  IDeleteMEPBannerResponse,
  IMEPBannerSettings,
  IUpdateMEPBannerSettingsRequest,
  IMEPBanner,
} from './mepBanner.types';

/**
 * Hook return type for better type safety
 */
export interface IUseMEPBannersReturn {
  banners: IMEPBanner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Hook to fetch MEP banners with filters
 */
export const useMEPBanners = (
  params: IGetMEPBannersParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
  }
): IUseMEPBannersReturn => {
  const queryResult = useQuery(
    ['mep-banners', params],
    () => getMEPBanners(params),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  const banners = queryResult.data?.data?.banners || [];
  const pagination = queryResult.data?.data?.pagination || null;

  return {
    banners,
    pagination,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Hook to fetch a single MEP banner by ID
 */
export const useMEPBannerById = (
  bannerId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<IGetMEPBannerDetailResponse, Error> => {
  return useQuery(
    ['mep-banner', bannerId],
    () => getMEPBannerById(bannerId!),
    {
      enabled: options?.enabled !== false && bannerId !== null,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );
};

/**
 * Hook to create a new MEP banner
 */
export const useCreateMEPBanner = (options?: {
  onSuccess?: (data: ICreateMEPBannerResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateMEPBannerResponse, Error, ICreateMEPBannerRequest> => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: ICreateMEPBannerRequest) => createMEPBanner(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-banners']);
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
 * Hook to update an existing MEP banner
 */
export const useUpdateMEPBanner = (options?: {
  onSuccess?: (data: IUpdateMEPBannerResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateMEPBannerResponse, Error, { bannerId: string; data: IUpdateMEPBannerRequest }> => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ bannerId, data }: { bannerId: string; data: IUpdateMEPBannerRequest }) => updateMEPBanner(bannerId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['mep-banners']);
        queryClient.invalidateQueries(['mep-banner', variables.bannerId]);
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
 * Hook to delete a MEP banner
 */
export const useDeleteMEPBanner = (options?: {
  onSuccess?: (data: IDeleteMEPBannerResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteMEPBannerResponse, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation(
    (bannerId: string) => deleteMEPBanner(bannerId),
    {
      onSuccess: (data, bannerId) => {
        queryClient.invalidateQueries(['mep-banners']);
        queryClient.invalidateQueries(['mep-banner', bannerId]);
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
 * Hook to fetch MEP banner settings
 */
export const useMEPBannerSettings = (
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<IMEPBannerSettings, Error> => {
  return useQuery(
    ['mep-banner-settings'],
    () => getMEPBannerSettings(),
    {
      enabled: options?.enabled !== false,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );
};

/**
 * Hook to update MEP banner settings
 */
export const useUpdateMEPBannerSettings = (options?: {
  onSuccess?: (data: IMEPBannerSettings) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IMEPBannerSettings, Error, IUpdateMEPBannerSettingsRequest> => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: IUpdateMEPBannerSettingsRequest) => updateMEPBannerSettings(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-banner-settings']);
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
