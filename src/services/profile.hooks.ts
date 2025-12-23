/**
 * Profile Management Hooks
 * 
 * Custom React hooks for admin profile operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from 'react-query';
import { profileService } from './profile.service';
import type {
  IGetAdminProfileResponse,
  IAdminProfile,
  IUpdateAdminProfileRequest,
  IUpdateAdminProfileResponse,
} from './profile.types';

/**
 * Hook return type for better type safety
 */
export interface IUseAdminProfileReturn {
  profile: IAdminProfile | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch admin profile
 * 
 * @param options - Additional React Query options
 * @returns Profile data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { profile, isLoading, isError, error, refetch } = useAdminProfile();
 * ```
 */
export const useAdminProfile = (
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseAdminProfileReturn => {
  const queryResult: UseQueryResult<IGetAdminProfileResponse, Error> = useQuery(
    ['adminProfile'],
    () => profileService.getAdminProfile(),
    {
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
      retry: 1, // Only retry once on failure
    }
  );

  // Normalize profile data - memoize to prevent infinite loops
  const profile = useMemo(() => {
    const rawProfile = queryResult.data?.data?.user || null;

    if (!rawProfile) {
      return null;
    }

    // Normalize profile picture URL - convert relative paths to full URLs
    let profilePictureUrl = rawProfile.profile_picture_url;

    // If it's a relative path (starts with /uploads), construct full URL
    if (profilePictureUrl && profilePictureUrl.startsWith('/uploads')) {
      // In dev, use relative path (goes through Vite proxy)
      // In prod, use the API URL without /api/v1
      if (import.meta.env.DEV) {
        // Keep as relative path - Vite proxy will handle it
        // profilePictureUrl is already correct as /uploads/...
      } else {
        // In production, construct full URL
        const baseUrl = import.meta.env.VITE_APP_API_URL?.replace('/api/v1', '') || 'https://ancellor.duckdns.org';
        profilePictureUrl = `${baseUrl}${profilePictureUrl}`;
      }
    }

    return {
      ...rawProfile,
      profile_picture_url: profilePictureUrl,
      // name: `${rawProfile.first_name || ''} ${rawProfile.last_name || ''}`.trim() || rawProfile.email || 'Admin User',
      name: rawProfile.name || `${rawProfile.first_name || ''} ${rawProfile.last_name || ''}`.trim() || 'Admin User',
      phone: rawProfile.phone || (rawProfile.phone_number ? `${rawProfile.phone_country_code || ''} ${rawProfile.phone_number}`.trim() : null),
    };
  }, [
    queryResult.data?.data?.user?.user_id,
    queryResult.data?.data?.user?.profile_picture_url,
    queryResult.data?.data?.user?.first_name,
    queryResult.data?.data?.user?.last_name,
    // queryResult.data?.data?.user?.phone_number,
    queryResult.data?.data?.user?.phone_country_code,
    queryResult.data?.data?.user?.email,
    queryResult.data?.data?.user?.name,
    queryResult.data?.data?.user?.phone
  ]);

  return {
    profile,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to update admin profile
 * 
 * @param options - Mutation options with callbacks
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```tsx
 * const { mutate: updateProfile, isLoading } = useUpdateAdminProfile({
 *   onSuccess: () => {
 *     toast.success('Profile updated successfully');
 *   }
 * });
 * ```
 */
export const useUpdateAdminProfile = (
  options?: {
    onSuccess?: (data: IUpdateAdminProfileResponse) => void;
    onError?: (error: any) => void;
  }
): UseMutationResult<IUpdateAdminProfileResponse, any, IUpdateAdminProfileRequest & { profile_picture?: File }> => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: IUpdateAdminProfileRequest & { profile_picture?: File }) => profileService.updateAdminProfile(data),
    {
      onSuccess: (data) => {
        // Invalidate and refetch profile data to update the UI
        queryClient.invalidateQueries(['adminProfile']);
        options?.onSuccess?.(data);
      },
      onError: (error: any) => {
        options?.onError?.(error);
      },
    }
  );
};

