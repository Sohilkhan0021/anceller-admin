/**
 * Sub-Banner Management Types
 * 
 * Type definitions for sub-banner management API responses and data structures
 */

/**
 * Sub-banner entity interface
 */
export interface ISubBanner {
  sub_banner_id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  category_id?: string | null;
  category?: {
    category_id: string;
    name: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Query parameters for fetching sub-banners
 */
export interface IGetSubBannersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * API response structure for get sub-banners endpoint
 */
export interface IGetSubBannersResponse {
  success: boolean;
  data: {
    sub_banners?: ISubBanner[];
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * API response structure for get sub-banner detail endpoint
 */
export interface IGetSubBannerDetailResponse {
  success: boolean;
  data: {
    sub_banner: ISubBanner;
  };
  message?: string;
}

/**
 * Request structure for creating a sub-banner
 */
export interface ICreateSubBannerRequest {
  title: string;
  image: File;
  is_active?: boolean;
  category_id?: string | null;
}

/**
 * Response structure for creating a sub-banner
 */
export interface ICreateSubBannerResponse {
  success: boolean;
  data: {
    sub_banner: ISubBanner;
  };
  message?: string;
}

/**
 * Request structure for updating a sub-banner
 */
export interface IUpdateSubBannerRequest {
  title?: string;
  image?: File;
  image_url?: string;
  is_active?: boolean;
  category_id?: string | null;
}

/**
 * Response structure for updating a sub-banner
 */
export interface IUpdateSubBannerResponse {
  success: boolean;
  data: {
    sub_banner: ISubBanner;
  };
  message?: string;
}

/**
 * Response structure for deleting a sub-banner
 */
export interface IDeleteSubBannerResponse {
  success: boolean;
  message?: string;
}

/**
 * Banner settings interface
 */
export interface IBannerSettings {
  banner_show: boolean;
  sub_banner_show: boolean;
}

/**
 * Request structure for updating banner settings
 */
export interface IUpdateBannerSettingsRequest {
  banner_show?: boolean;
  sub_banner_show?: boolean;
}

/**
 * Response structure for banner settings
 */
export interface IBannerSettingsResponse {
  success: boolean;
  data: IBannerSettings;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
