/**
 * Banner Management Types
 * 
 * Type definitions for banner management API responses and data structures
 */

/**
 * Banner entity interface
 */
export interface IBanner {
  banner_id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Query parameters for fetching banners
 */
export interface IGetBannersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
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

/**
 * API response structure for get banners endpoint
 */
export interface IGetBannersResponse {
  success: boolean;
  data: {
    banners?: IBanner[];
    banner?: IBanner[];
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * API response structure for get banner detail endpoint
 */
export interface IGetBannerDetailResponse {
  success: boolean;
  data: {
    banner: IBanner;
  };
  message?: string;
}

/**
 * Request structure for creating a banner
 */
export interface ICreateBannerRequest {
  title: string;
  image: File;
  is_active?: boolean;
}

/**
 * Response structure for creating a banner
 */
export interface ICreateBannerResponse {
  success: boolean;
  data: {
    banner: IBanner;
  };
  message?: string;
}

/**
 * Request structure for updating a banner
 */
export interface IUpdateBannerRequest {
  title?: string;
  image?: File;
  image_url?: string;
  is_active?: boolean;
}

/**
 * Response structure for updating a banner
 */
export interface IUpdateBannerResponse {
  success: boolean;
  data: {
    banner: IBanner;
  };
  message?: string;
}

/**
 * Response structure for deleting a banner
 */
export interface IDeleteBannerResponse {
  success: boolean;
  message?: string;
}

