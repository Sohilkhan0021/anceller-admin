/**
 * Banner Service
 * 
 * Enterprise-level service layer for banner management API operations
 * Handles all HTTP requests related to banner management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import { getAuth } from '@/auth';
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
 * Base URL for banner management endpoints
 */
const BANNER_BASE_URL = `${API_URL}/admin/banners`;

/**
 * Helper to handle API errors and extract detailed validation messages
 */
const handleApiError = (error: any, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data;

    // Check for validation errors array first
    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      // Return the first validation error message
      const firstError = errorData.errors[0];
      if (firstError.message) {
        throw new Error(firstError.message);
      }
    }

    // Fallback to top-level message or string error
    const message = errorData?.message || errorData?.error || defaultMessage;
    throw new Error(message);
  }
  throw new Error(`An unexpected error occurred: ${defaultMessage}`);
};

/**
 * Get all banners with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to banners data with pagination
 * @throws Error if API request fails
 */
export const getBanners = async (
  params: IGetBannersParams = {}
): Promise<IGetBannersResponse> => {
  try {
    // Build query parameters, excluding undefined and empty values
    const queryParams: Record<string, string | number> = {};

    if (params.page !== undefined && params.page > 0) {
      queryParams.page = params.page;
    }
    if (params.limit !== undefined && params.limit > 0) {
      queryParams.limit = params.limit;
    }
    if (params.status && params.status.trim() !== '' && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('Banner API Request:', {
        url: BANNER_BASE_URL,
        params: queryParams,
      });
    }

    const response = await axios.get<{ status: number; message: string; data: { banners: any[]; pagination: IPaginationMeta } }>(BANNER_BASE_URL, {
      params: queryParams,
    });

    // Transform to match frontend IBanner interface
    const transformedBanners: IBanner[] = (response.data.data.banners || []).map((banner: any) => ({
      banner_id: banner.banner_id || banner.id,
      title: banner.title || '',
      image_url: banner.image_url || banner.image || '',
      is_active: banner.is_active ?? true,
      banner_type: banner.banner_type || 'offer',
      category_id: banner.category_id || null,
      category: banner.category ? {
        category_id: banner.category.category_id || banner.category.public_id,
        name: banner.category.name
      } : null,
      created_at: banner.created_at || banner.createdAt,
      updated_at: banner.updated_at || banner.updatedAt,
    }));

    return {
      success: true,
      data: {
        banners: transformedBanners,
        pagination: response.data.data.pagination,
      },
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error, 'Failed to fetch banners');
  }
};

/**
 * Get banner details by ID
 * 
 * @param bannerId - ID of the banner to fetch
 * @returns Promise resolving to banner details
 * @throws Error if API request fails
 */
export const getBannerById = async (
  bannerId: string
): Promise<IGetBannerDetailResponse> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: { banner: any } }>(`${BANNER_BASE_URL}/${bannerId}`);
    
    // Transform to match frontend IBanner interface
    const banner = response.data.data.banner;
    const transformedBanner: IBanner = {
      banner_id: banner.banner_id || banner.id,
      title: banner.title || '',
      image_url: banner.image_url || banner.image || '',
      is_active: banner.is_active ?? true,
      banner_type: banner.banner_type || 'offer',
      category_id: banner.category_id || null,
      category: banner.category ? {
        category_id: banner.category.category_id || banner.category.public_id,
        name: banner.category.name
      } : null,
      created_at: banner.created_at || banner.createdAt,
      updated_at: banner.updated_at || banner.updatedAt,
    };

    return {
      success: true,
      data: {
        banner: transformedBanner,
      },
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error, 'Failed to fetch banner details');
  }
};

/**
 * Create a new banner
 * 
 * @param data - Banner data to create
 * @returns Promise resolving to creation response
 * @throws Error if API request fails
 */
export const createBanner = async (
  data: ICreateBannerRequest
): Promise<ICreateBannerResponse> => {
  try {
    const formData = new FormData();

    if (data.title) {
      formData.append('title', data.title);
    }

    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }

    if (data.banner_type !== undefined) {
      formData.append('banner_type', data.banner_type);
    }

    if (data.category_id !== undefined && data.category_id !== null && data.category_id !== '') {
      formData.append('category_id', data.category_id);
    }

    // Get auth token using the auth helper
    const auth = getAuth();
    const token = auth?.access_token;

    // Log request for debugging
    if (import.meta.env.DEV) {
      console.log('Create Banner API Request:', {
        url: BANNER_BASE_URL,
        hasImage: formData.has('image'),
        imageIsFile: formData.get('image') instanceof File,
      });
    }

    const response = await axios.post<ICreateBannerResponse>(
      BANNER_BASE_URL,
      formData,
      {
        headers: {
          // DO NOT set Content-Type manually - axios will set it automatically with the correct boundary
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        transformRequest: [(data) => {
          // If it's FormData, return it as-is (axios will handle it)
          if (data instanceof FormData) {
            return data;
          }
          return data;
        }],
      }
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to create banner');
  }
};

/**
 * Update an existing banner
 * 
 * @param bannerId - ID of the banner to update
 * @param data - Updated banner data
 * @returns Promise resolving to update response
 * @throws Error if API request fails
 */
export const updateBanner = async (
  bannerId: string,
  data: IUpdateBannerRequest
): Promise<IUpdateBannerResponse> => {
  try {
    const formData = new FormData();

    if (data.title !== undefined) {
      formData.append('title', data.title);
    }

    // Handle image - prioritize file upload over image_url
    if (data.image instanceof File) {
      formData.append('image', data.image);
    } else if (data.image_url !== undefined) {
      // Always send image_url if provided (even if null/empty to clear it)
      formData.append('image_url', data.image_url || '');
    }

    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }

    if (data.banner_type !== undefined) {
      formData.append('banner_type', data.banner_type);
    }

    if (data.category_id !== undefined) {
      // Allow null/empty string to clear category association
      formData.append('category_id', data.category_id || '');
    }

    // Get auth token using the auth helper
    const auth = getAuth();
    const token = auth?.access_token;

    // Log request for debugging
    if (import.meta.env.DEV) {
      console.log('Update Banner API Request:', {
        url: `${BANNER_BASE_URL}/${bannerId}`,
        hasImage: formData.has('image'),
        imageIsFile: formData.get('image') instanceof File,
      });
    }

    const response = await axios.put<IUpdateBannerResponse>(
      `${BANNER_BASE_URL}/${bannerId}`,
      formData,
      {
        headers: {
          // DO NOT set Content-Type manually - axios will set it automatically with the correct boundary
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        transformRequest: [(data) => {
          // If it's FormData, return it as-is (axios will handle it)
          if (data instanceof FormData) {
            return data;
          }
          return data;
        }],
      }
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update banner');
  }
};

/**
 * Delete a banner
 * 
 * @param bannerId - ID of the banner to delete
 * @returns Promise resolving to deletion response
 * @throws Error if API request fails
 */
export const deleteBanner = async (
  bannerId: string
): Promise<IDeleteBannerResponse> => {
  try {
    const response = await axios.delete<IDeleteBannerResponse>(`${BANNER_BASE_URL}/${bannerId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to delete banner');
  }
};

/**
 * Banner Service Object
 * 
 * Centralized service object for all banner-related operations
 * This pattern allows for easy extension and testing
 */
export const bannerService = {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};

