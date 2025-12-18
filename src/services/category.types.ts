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
 * Request structure for creating a category
 * Supports multipart/form-data for image and icon files
 */
export interface ICreateCategoryRequest {
  name: string;
  description?: string;
  image?: File | null;
  icon?: File | null;
  sort_order?: number;
  is_active?: boolean;
  meta_data?: string; // JSON string
}

/**
 * Response structure for category creation
 */
export interface ICreateCategoryResponse {
  status: number;
  message: string;
  data: {
    category_id: string;
  };
}

/**
 * Request structure for updating a category
 */
export interface IUpdateCategoryRequest extends Partial<ICreateCategoryRequest> {
  id: string;
}

/**
 * Response structure for category update
 */
export interface IUpdateCategoryResponse {
  status: number;
  message: string;
  data: {
    category_id: string;
  };
}

/**
 * Response structure for category deletion
 */
export interface IDeleteCategoryResponse {
  status: number;
  message: string;
  data: null;
}

/**
 * Error response structure
 */
export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

