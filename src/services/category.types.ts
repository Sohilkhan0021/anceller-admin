/**
 * Category Management Types
 * 
 * Type definitions for category management API responses and data structures
 */

/**
 * Category status enum
 */
export type CategoryStatus = 'active' | 'inactive';

/**
 * Category entity interface
 */
export interface ICategory {
  id: string;
  name: string;
  icon?: string;
  lucideIcon?: string;
  description?: string;
  status: CategoryStatus;
  displayOrder?: number; // Optional as API might not always return it
  display_order?: number; // Snake case version from API
  iconUrl?: string;
  icon_url?: string; // Snake case version from API
  // Additional fields that might come from API
  public_id?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

/**
 * Query parameters for fetching categories
 */
export interface IGetCategoriesParams {
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
 * API response structure for get categories endpoint
 */
export interface IGetCategoriesResponse {
  success: boolean;
  data: {
    categories: ICategory[];
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * Error response structure
 */
export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

