/**
 * MEP Banner Management Service
 * 
 * Service functions for MEP banner management API calls
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import { getAuth } from '@/auth';
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
  IMEPBanner
} from './mepBanner.types';

const MEP_BANNER_BASE_URL = `${API_URL}/admin/mep-banners`;
const MEP_BANNER_SETTINGS_BASE_URL = `${API_URL}/admin/mep-banner-settings`;

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
 * Get all MEP banners with filters
 */
export const getMEPBanners = async (
  params: IGetMEPBannersParams = {}
): Promise<IGetMEPBannersResponse> => {
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
    if (params.banner_type) {
      queryParams.banner_type = params.banner_type;
    }

    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.get<{ status: number; message: string; data: { banners: any[]; pagination: any } }>(
      MEP_BANNER_BASE_URL,
      {
        params: queryParams,
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    const transformedBanners: IMEPBanner[] = (response.data.data.banners || []).map((banner: any) => ({
      mep_banner_id: banner.mep_banner_id,
      title: banner.title || '',
      image_url: banner.image_url || '',
      is_active: banner.is_active ?? true,
      banner_type: banner.banner_type || 'offer',
      created_at: banner.created_at,
      updated_at: banner.updated_at,
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
    return handleApiError(error, 'Failed to fetch MEP banners');
  }
};

/**
 * Get MEP banner details by ID
 */
export const getMEPBannerById = async (
  bannerId: string
): Promise<IGetMEPBannerDetailResponse> => {
  try {
    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.get<{ status: number; message: string; data: { mep_banner: any } }>(
      `${MEP_BANNER_BASE_URL}/${bannerId}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    const banner = response.data.data.mep_banner;
    const transformedBanner: IMEPBanner = {
      mep_banner_id: banner.mep_banner_id,
      title: banner.title || '',
      image_url: banner.image_url || '',
      is_active: banner.is_active ?? true,
      banner_type: banner.banner_type || 'offer',
      created_at: banner.created_at,
      updated_at: banner.updated_at,
    };

    return {
      success: true,
      data: {
        mep_banner: transformedBanner,
      },
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error, 'Failed to fetch MEP banner details');
  }
};

/**
 * Create a new MEP banner
 */
export const createMEPBanner = async (
  data: ICreateMEPBannerRequest
): Promise<ICreateMEPBannerResponse> => {
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

    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.post<ICreateMEPBannerResponse>(
      MEP_BANNER_BASE_URL,
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
    return handleApiError(error, 'Failed to create MEP banner');
  }
};

/**
 * Update an existing MEP banner
 */
export const updateMEPBanner = async (
  bannerId: string,
  data: IUpdateMEPBannerRequest
): Promise<IUpdateMEPBannerResponse> => {
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

    if (data.banner_type !== undefined) {
      formData.append('banner_type', data.banner_type);
    }

    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.put<IUpdateMEPBannerResponse>(
      `${MEP_BANNER_BASE_URL}/${bannerId}`,
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
    return handleApiError(error, 'Failed to update MEP banner');
  }
};

/**
 * Delete a MEP banner
 */
export const deleteMEPBanner = async (
  bannerId: string
): Promise<IDeleteMEPBannerResponse> => {
  try {
    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.delete<IDeleteMEPBannerResponse>(
      `${MEP_BANNER_BASE_URL}/${bannerId}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to delete MEP banner');
  }
};

/**
 * Get MEP banner settings
 */
export const getMEPBannerSettings = async (): Promise<IMEPBannerSettings> => {
  try {
    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.get<{ status: number; message: string; data: IMEPBannerSettings }>(
      MEP_BANNER_SETTINGS_BASE_URL,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch MEP banner settings');
  }
};

/**
 * Update MEP banner settings
 */
export const updateMEPBannerSettings = async (
  data: IUpdateMEPBannerSettingsRequest
): Promise<IMEPBannerSettings> => {
  try {
    const auth = getAuth();
    const token = auth?.access_token;

    const response = await axios.put<{ status: number; message: string; data: IMEPBannerSettings }>(
      MEP_BANNER_SETTINGS_BASE_URL,
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
    return handleApiError(error, 'Failed to update MEP banner settings');
  }
};

/**
 * MEP Banner Service Object
 */
export const mepBannerService = {
  getMEPBanners,
  getMEPBannerById,
  createMEPBanner,
  updateMEPBanner,
  deleteMEPBanner,
  getMEPBannerSettings,
  updateMEPBannerSettings,
};
