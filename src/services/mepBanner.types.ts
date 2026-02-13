/**
 * MEP Banner Management Types
 * 
 * Type definitions for MEP banner management API responses and data structures
 */

export type MEPBannerType = 'offer' | 'buy_banner';

/**
 * MEP Banner entity interface
 */
export interface IMEPBanner {
  mep_banner_id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  banner_type?: MEPBannerType;
  created_at?: string;
  updated_at?: string;
}

/**
 * Query parameters for fetching MEP banners
 */
export interface IGetMEPBannersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  banner_type?: MEPBannerType;
}

/**
 * API response structure for get MEP banners endpoint
 */
export interface IGetMEPBannersResponse {
  success: boolean;
  data: {
    banners?: IMEPBanner[];
    banner?: IMEPBanner[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

/**
 * API response structure for get MEP banner detail endpoint
 */
export interface IGetMEPBannerDetailResponse {
  success: boolean;
  data: {
    mep_banner: IMEPBanner;
  };
  message?: string;
}

/**
 * Request structure for creating a MEP banner
 */
export interface ICreateMEPBannerRequest {
  title: string;
  image: File;
  is_active?: boolean;
  banner_type?: MEPBannerType;
}

/**
 * Response structure for creating a MEP banner
 */
export interface ICreateMEPBannerResponse {
  success: boolean;
  data: {
    mep_banner: IMEPBanner;
  };
  message?: string;
}

/**
 * Request structure for updating a MEP banner
 */
export interface IUpdateMEPBannerRequest {
  title?: string;
  image?: File;
  image_url?: string;
  is_active?: boolean;
  banner_type?: MEPBannerType;
}

/**
 * Response structure for updating a MEP banner
 */
export interface IUpdateMEPBannerResponse {
  success: boolean;
  data: {
    mep_banner: IMEPBanner;
  };
  message?: string;
}

/**
 * Response structure for deleting a MEP banner
 */
export interface IDeleteMEPBannerResponse {
  success: boolean;
  message?: string;
}

/**
 * MEP Banner Settings
 */
export interface IMEPBannerSettings {
  setting_id: string | null;
  banner_show: boolean;
  sub_banner_show: boolean;
}

/**
 * Request structure for updating MEP banner settings
 */
export interface IUpdateMEPBannerSettingsRequest {
  banner_show?: boolean;
  sub_banner_show?: boolean;
}
