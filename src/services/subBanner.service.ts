/**
 * Sub-Banner Management Service
 * 
 * Service functions for sub-banner management API calls
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import { getAuth } from '@/auth';
import type {
  IGetSubBannersParams,
  IGetSubBannersResponse,
  IGetSubBannerDetailResponse,
  ICreateSubBannerRequest,
  ICreateSubBannerResponse,
  IUpdateSubBannerRequest,
  IUpdateSubBannerResponse,
  IDeleteSubBannerResponse,
  IBannerSettings,
  IBannerSettingsResponse,
  IUpdateBannerSettingsRequest,
  IPaginationMeta,
  ISubBanner
} from './subBanner.types';

const SUB_BANNER_BASE_URL = `${API_URL}/admin/sub-banners`;
const BANNER_SETTINGS_BASE_URL = `${API_URL}/admin/banner-settings`;

/**
 * Handle API errors consistently
 */
const handleApiError = (error: any, defaultMessage: string): never => {
  if (error.response) {
    const message = error.response.data?.message || error.response.data?.error || defaultMessage;
    throw new Error(message);
  } else if (error.request) {
    throw new Error('Network error. Please check your connection.');
  } else {
    throw new Error(error.message || defaultMessage);
  }
};

/**
 * Get all sub-banners with filters
 */
export const getSubBanners = async (
  params: IGetSubBannersParams = {}
): Promise<IGetSubBannersResponse> => {
  try {
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

    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.get<{ status: number; message: string; data: { sub_banners: any[]; pagination: IPaginationMeta } }>(
      SUB_BANNER_BASE_URL,
      {
        params: queryParams,
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    const transformedSubBanners: ISubBanner[] = (response.data.data.sub_banners || []).map((subBanner: any) => ({
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
      success: true,
      data: {
        sub_banners: transformedSubBanners,
        pagination: response.data.data.pagination,
      },
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error, 'Failed to fetch sub-banners');
  }
};

/**
 * Get sub-banner details by ID
 */
export const getSubBannerById = async (
  subBannerId: string
): Promise<IGetSubBannerDetailResponse> => {
  try {
    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.get<{ status: number; message: string; data: { sub_banner: any } }>(
      `${SUB_BANNER_BASE_URL}/${subBannerId}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    const subBanner = response.data.data.sub_banner;
    const transformedSubBanner: ISubBanner = {
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
    };

    return {
      success: true,
      data: {
        sub_banner: transformedSubBanner,
      },
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error, 'Failed to fetch sub-banner details');
  }
};

/**
 * Create a new sub-banner
 */
export const createSubBanner = async (
  data: ICreateSubBannerRequest
): Promise<ICreateSubBannerResponse> => {
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

    if (data.category_id !== undefined && data.category_id !== null && data.category_id !== '') {
      formData.append('category_id', data.category_id);
    }

    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.post<ICreateSubBannerResponse>(
      SUB_BANNER_BASE_URL,
      formData,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        transformRequest: [(data) => {
          if (data instanceof FormData) {
            return data;
          }
          return data;
        }],
      }
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to create sub-banner');
  }
};

/**
 * Update an existing sub-banner
 */
export const updateSubBanner = async (
  subBannerId: string,
  data: IUpdateSubBannerRequest
): Promise<IUpdateSubBannerResponse> => {
  try {
    const formData = new FormData();

    if (data.title !== undefined) {
      formData.append('title', data.title);
    }

    if (data.image instanceof File) {
      formData.append('image', data.image);
    } else if (data.image_url !== undefined) {
      formData.append('image_url', data.image_url || '');
    }

    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }

    if (data.category_id !== undefined) {
      formData.append('category_id', data.category_id || '');
    }

    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.put<IUpdateSubBannerResponse>(
      `${SUB_BANNER_BASE_URL}/${subBannerId}`,
      formData,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        transformRequest: [(data) => {
          if (data instanceof FormData) {
            return data;
          }
          return data;
        }],
      }
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update sub-banner');
  }
};

/**
 * Delete a sub-banner
 */
export const deleteSubBanner = async (
  subBannerId: string
): Promise<IDeleteSubBannerResponse> => {
  try {
    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.delete<IDeleteSubBannerResponse>(
      `${SUB_BANNER_BASE_URL}/${subBannerId}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to delete sub-banner');
  }
};

/**
 * Get banner settings
 */
export const getBannerSettings = async (): Promise<IBannerSettings> => {
  try {
    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.get<IBannerSettingsResponse>(
      BANNER_SETTINGS_BASE_URL,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch banner settings');
  }
};

/**
 * Update banner settings
 */
export const updateBannerSettings = async (
  data: IUpdateBannerSettingsRequest
): Promise<IBannerSettings> => {
  try {
    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.put<IBannerSettingsResponse>(
      BANNER_SETTINGS_BASE_URL,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update banner settings');
  }
};

/**
 * Sub-Banner Service Object
 */
export const subBannerService = {
  getSubBanners,
  getSubBannerById,
  createSubBanner,
  updateSubBanner,
  deleteSubBanner,
  getBannerSettings,
  updateBannerSettings,
};
